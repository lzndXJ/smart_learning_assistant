import http from 'node:http'

const PORT = Number(process.env.AI_SERVER_PORT || 8787)
const PROVIDER = process.env.AI_PROVIDER || detectProvider()
const API_KEY =
  process.env.AI_API_KEY ||
  process.env.AIHUBMIX_API_KEY ||
  process.env.MODELSCOPE_API_KEY ||
  process.env.OPENAI_API_KEY
const BASE_URL = normalizeBaseUrl(
  process.env.AI_BASE_URL || process.env.AIHUBMIX_BASE_URL || process.env.MODELSCOPE_BASE_URL || defaultBaseUrl(),
)
const MODEL = process.env.AI_MODEL || process.env.AIHUBMIX_MODEL || process.env.MODELSCOPE_MODEL || defaultModel()

const server = http.createServer(async (req, res) => {
  setCorsHeaders(res)

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  if (req.method !== 'POST' || req.url !== '/api/study-suggestion') {
    sendJson(res, 404, { error: 'Not found' })
    return
  }

  try {
    if (!API_KEY) {
      sendJson(res, 503, { error: 'AI_API_KEY is not configured.' })
      return
    }

    const studyContext = await readJson(req)
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a concise study assistant for university students. Give one practical paragraph, under 90 words, based only on the supplied task and resource data.',
          },
          {
            role: 'user',
            content: `Create a focused study suggestion from this JSON:\n${JSON.stringify(studyContext, null, 2)}`,
          },
        ],
        temperature: 0.3,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      sendJson(res, response.status, { error: data.error?.message || 'OpenAI request failed.' })
      return
    }

    sendJson(res, 200, {
      suggestion: extractOutputText(data),
      source: `${PROVIDER} ${MODEL}`,
    })
  } catch (error) {
    sendJson(res, 500, { error: error.message || 'Unexpected server error.' })
  }
})

server.listen(PORT, () => {
  console.log(`AI suggestion server running at http://127.0.0.1:${PORT}`)
  console.log(`Provider: ${PROVIDER}`)
  console.log(`Base URL: ${BASE_URL}`)
  console.log(`Model: ${MODEL}`)
})

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(body))
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = ''

    req.on('data', (chunk) => {
      body += chunk
    })

    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'))
      } catch (error) {
        reject(new Error('Invalid JSON body.'))
      }
    })

    req.on('error', reject)
  })
}

function extractOutputText(data) {
  const content = data.choices?.[0]?.message?.content

  if (Array.isArray(content)) {
    return content
      .map((item) => item.text || item.content || '')
      .join('')
      .trim()
  }

  return String(content || '').trim() || 'No suggestion was returned.'
}

function detectProvider() {
  if (process.env.AIHUBMIX_API_KEY || process.env.AIHUBMIX_BASE_URL) return 'AIHubMix'
  if (process.env.MODELSCOPE_API_KEY || process.env.MODELSCOPE_BASE_URL) return 'ModelScope'
  if (process.env.OPENAI_API_KEY) return 'OpenAI'
  return 'OpenAI-compatible'
}

function defaultBaseUrl() {
  if (PROVIDER === 'AIHubMix') return 'https://aihubmix.com/v1'
  if (PROVIDER === 'ModelScope') return 'https://api-inference.modelscope.cn/v1'
  return 'https://api.openai.com/v1'
}

function defaultModel() {
  if (PROVIDER === 'ModelScope') return 'Qwen/Qwen3-30B-A3B-Instruct-2507'
  return 'gpt-4o-mini'
}

function normalizeBaseUrl(url) {
  return url.replace(/\/+$/, '')
}
