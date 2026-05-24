<script setup>
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Back, Check, Microphone, Refresh, Right, VideoPause } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
import { loadLearningData, saveLearningSection } from '@/utils/storage'

const initialData = loadLearningData()
const plans = ref(initialData.plans)

const steps = [
  {
    key: 'subject',
    title: 'Subject',
    question: 'What subject do you want to study?',
    placeholder: 'e.g., Human-Computer Interaction',
  },
  {
    key: 'time',
    title: 'Time',
    question: 'How much time do you have today?',
    placeholder: 'e.g., 90 minutes',
  },
  {
    key: 'goal',
    title: 'Goal',
    question: 'What is your goal?',
    placeholder: 'e.g., Finish the planner prototype flow',
  },
]

const currentStepIndex = ref(0)
const answers = reactive({
  subject: '',
  time: '',
  goal: '',
})
const generatedPlan = ref(null)
const isListening = ref(false)
let recognition = null

const currentStep = computed(() => steps[currentStepIndex.value])
const voiceSupported = computed(() => {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
})

function nextStep() {
  const key = currentStep.value.key

  if (!answers[key].trim()) {
    ElMessage.warning('Please answer this step first.')
    return
  }

  if (currentStepIndex.value < steps.length - 1) {
    currentStepIndex.value += 1
  } else {
    generatePlan()
  }
}

function previousStep() {
  if (currentStepIndex.value > 0) currentStepIndex.value -= 1
}

function startVoiceInput() {
  if (!voiceSupported.value) {
    ElMessage.warning('Voice input is not supported in this browser.')
    return
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  recognition = new SpeechRecognition()
  recognition.lang = 'en-US'
  recognition.interimResults = false
  recognition.maxAlternatives = 1

  recognition.onstart = () => {
    isListening.value = true
  }

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript
    answers[currentStep.value.key] = transcript
  }

  recognition.onerror = () => {
    ElMessage.warning('Voice input stopped. You can continue by typing.')
  }

  recognition.onend = () => {
    isListening.value = false
  }

  recognition.start()
}

function stopVoiceInput() {
  if (recognition) recognition.stop()
  isListening.value = false
}

function generatePlan() {
  const minutes = extractMinutes(answers.time)
  const plan = {
    id: `plan-${Date.now()}`,
    createdAt: new Date().toISOString(),
    subject: answers.subject.trim(),
    time: answers.time.trim(),
    goal: answers.goal.trim(),
    steps: buildPlanSteps(minutes),
  }

  generatedPlan.value = plan
  plans.value = [plan, ...plans.value].slice(0, 5)
  saveLearningSection('plans', plans.value)
  ElMessage.success('Study plan saved locally.')
}

function extractMinutes(timeText) {
  const number = Number((timeText.match(/\d+/) || [60])[0])
  return Number.isFinite(number) && number > 0 ? number : 60
}

function buildPlanSteps(minutes) {
  if (minutes >= 90) {
    return [
      { label: 'Set up', minutes: 10, detail: 'Open materials and define the exact output.' },
      { label: 'Deep work', minutes: Math.round(minutes * 0.55), detail: 'Work on the most important part of the goal.' },
      { label: 'Practice', minutes: Math.round(minutes * 0.25), detail: 'Apply the idea with notes, exercises, or prototype edits.' },
      { label: 'Review', minutes: 10, detail: 'Write the next action before stopping.' },
    ]
  }

  return [
    { label: 'Focus', minutes: Math.max(20, Math.round(minutes * 0.65)), detail: 'Work on one clear part of the goal.' },
    { label: 'Check', minutes: Math.max(8, Math.round(minutes * 0.2)), detail: 'Compare progress with the target outcome.' },
    { label: 'Wrap up', minutes: Math.max(5, Math.round(minutes * 0.15)), detail: 'Record what to continue later.' },
  ]
}

function resetPlanner() {
  answers.subject = ''
  answers.time = ''
  answers.goal = ''
  currentStepIndex.value = 0
  generatedPlan.value = null
}

function formatPlanDate(dateString) {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onBeforeUnmount(() => {
  stopVoiceInput()
})
</script>

<template>
  <div class="page-stack">
    <PageHeader
      eyebrow="Guided planning"
      title="Study planner"
      description="Move through three focused prompts, using typing or voice input, and finish with a simple plan."
    />

    <div class="planner-grid">
      <section class="panel planner-panel">
        <el-steps :active="currentStepIndex" finish-status="success" align-center>
          <el-step v-for="step in steps" :key="step.key" :title="step.title" />
        </el-steps>

        <div v-if="!generatedPlan" class="step-card">
          <p class="step-count">Step {{ currentStepIndex + 1 }} of {{ steps.length }}</p>
          <h2>{{ currentStep.question }}</h2>

          <el-input
            v-model="answers[currentStep.key]"
            type="textarea"
            :rows="4"
            :placeholder="currentStep.placeholder"
          />

          <div class="voice-row">
            <el-button
              v-if="!isListening"
              :icon="Microphone"
              :disabled="!voiceSupported"
              @click="startVoiceInput"
            >
              Voice input
            </el-button>
            <el-button v-else type="warning" :icon="VideoPause" @click="stopVoiceInput">
              Stop listening
            </el-button>
            <span class="muted-text">
              {{ voiceSupported ? 'Manual input is always available.' : 'Voice input is unavailable here.' }}
            </span>
          </div>

          <div class="planner-actions">
            <el-button :icon="Back" :disabled="currentStepIndex === 0" @click="previousStep">
              Back
            </el-button>
            <el-button type="primary" :icon="currentStepIndex === steps.length - 1 ? Check : Right" @click="nextStep">
              {{ currentStepIndex === steps.length - 1 ? 'Generate plan' : 'Next' }}
            </el-button>
          </div>
        </div>

        <div v-else class="plan-result">
          <el-result icon="success" title="Today's study plan is ready" />
          <div class="plan-summary">
            <h2>{{ generatedPlan.subject }}</h2>
            <p>{{ generatedPlan.time }} · {{ generatedPlan.goal }}</p>
            <ol>
              <li v-for="item in generatedPlan.steps" :key="item.label">
                <strong>{{ item.label }} · {{ item.minutes }} min</strong>
                <span>{{ item.detail }}</span>
              </li>
            </ol>
          </div>
          <el-button :icon="Refresh" @click="resetPlanner">Plan another session</el-button>
        </div>
      </section>

      <aside class="panel">
        <h2 class="section-title">Recent Plans</h2>
        <div v-if="plans.length" class="recent-plans">
          <article v-for="plan in plans" :key="plan.id" class="recent-plan">
            <strong>{{ plan.subject }}</strong>
            <p>{{ plan.goal }}</p>
            <span>{{ formatPlanDate(plan.createdAt) }}</span>
          </article>
        </div>
        <EmptyState v-else description="Generated plans will appear here." />
      </aside>
    </div>
  </div>
</template>

<style scoped>
.planner-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 16px;
  align-items: start;
}

.planner-panel {
  display: grid;
  gap: 24px;
}

.step-card,
.plan-result {
  display: grid;
  gap: 18px;
}

.step-count {
  margin: 0;
  color: var(--accent-green);
  font-weight: 800;
}

h2 {
  margin: 0;
  color: var(--text-strong);
  font-size: 1.35rem;
  font-weight: 800;
}

.voice-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.planner-actions {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.plan-summary {
  padding: 16px;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  background: #ffffff;
}

.plan-summary p,
.recent-plan p {
  margin: 6px 0 0;
  color: var(--text-muted);
}

ol {
  display: grid;
  gap: 10px;
  margin: 16px 0 0;
  padding-left: 20px;
}

li strong,
.recent-plan strong {
  display: block;
  color: var(--text-strong);
  font-weight: 800;
}

li span,
.recent-plan span {
  display: block;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.recent-plans {
  display: grid;
  gap: 10px;
}

.recent-plan {
  padding: 14px;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  background: #ffffff;
}

@media (max-width: 980px) {
  .planner-grid {
    grid-template-columns: 1fr;
  }
}
</style>
