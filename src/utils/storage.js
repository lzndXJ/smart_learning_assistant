const STORAGE_KEY = 'smart-learning-assistant-data'

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function getTodayISO() {
  return toLocalISODate(new Date())
}

function addDaysISO(daysToAdd) {
  const date = new Date()
  date.setDate(date.getDate() + daysToAdd)
  return toLocalISODate(date)
}

function toLocalISODate(date) {
  const localDate = new Date(date)
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset())
  return localDate.toISOString().slice(0, 10)
}

export function getWeekDays() {
  return days
}

export function createDefaultData() {
  const today = getTodayISO()

  return {
    courses: [
      {
        id: 'course-hci',
        name: 'Human-Computer Interaction',
        day: 'Monday',
        startTime: '09:00',
        endTime: '10:30',
        room: 'Design Lab 204',
        color: '#2f7d68',
      },
      {
        id: 'course-data',
        name: 'Data Visualization',
        day: 'Tuesday',
        startTime: '14:00',
        endTime: '15:30',
        room: 'Room B305',
        color: '#3867d6',
      },
      {
        id: 'course-web',
        name: 'Web Development',
        day: 'Wednesday',
        startTime: '10:00',
        endTime: '11:40',
        room: 'Computer Lab 2',
        color: '#8a5a00',
      },
      {
        id: 'course-english',
        name: 'Academic English',
        day: 'Friday',
        startTime: '08:30',
        endTime: '10:00',
        room: 'Room A112',
        color: '#9b3d3a',
      },
      {
        id: 'course-project',
        name: 'Project Review Session',
        day: 'Sunday',
        startTime: '16:00',
        endTime: '17:00',
        room: 'Online',
        color: '#4c6a8a',
      },
    ],
    tasks: [
      {
        id: 'task-hci-notes',
        title: 'Review HCI lecture notes',
        course: 'Human-Computer Interaction',
        category: 'Review',
        priority: 'High',
        dueDate: today,
        completed: false,
        estimatedMinutes: 45,
        notes: 'Focus on usability heuristics and cognitive load.',
      },
      {
        id: 'task-prototype-flow',
        title: 'Sketch planner interaction flow',
        course: 'Human-Computer Interaction',
        category: 'Project',
        priority: 'High',
        dueDate: today,
        completed: false,
        estimatedMinutes: 90,
        notes: 'Keep the guided flow simple and demo-friendly.',
      },
      {
        id: 'task-web-practice',
        title: 'Practice Vue component props',
        course: 'Web Development',
        category: 'Practice',
        priority: 'Medium',
        dueDate: addDaysISO(1),
        completed: false,
        estimatedMinutes: 60,
        notes: '',
      },
      {
        id: 'task-reading',
        title: 'Read article about dashboard design',
        course: '',
        category: 'Reading',
        priority: 'Low',
        dueDate: addDaysISO(2),
        completed: true,
        estimatedMinutes: 30,
        notes: '',
      },
    ],
    resources: [
      {
        id: 'resource-vue-guide',
        title: 'Vue3 Composition API Guide',
        course: 'Web Development',
        type: 'Reference',
        url: 'https://vuejs.org/guide/introduction.html',
        note: 'Core concepts for building the task and resource modules.',
      },
      {
        id: 'resource-element-plus',
        title: 'Element Plus Components',
        course: 'Human-Computer Interaction',
        type: 'Tool',
        url: 'https://element-plus.org/',
        note: 'Useful UI components for forms, dialogs, tags, and navigation.',
      },
      {
        id: 'resource-report-outline',
        title: 'Final Report Outline',
        course: 'Project Review Session',
        type: 'Note',
        url: 'https://example.com/report-outline',
        note: 'User needs, modules, interaction design, limitations, improvements, and contribution.',
      },
    ],
    plans: [],
  }
}

export function loadLearningData() {
  const defaults = createDefaultData()
  const rawData = localStorage.getItem(STORAGE_KEY)

  if (!rawData) {
    saveLearningData(defaults)
    return defaults
  }

  try {
    const savedData = JSON.parse(rawData)

    return {
      ...defaults,
      ...savedData,
      courses: Array.isArray(savedData.courses) ? savedData.courses : defaults.courses,
      tasks: Array.isArray(savedData.tasks)
        ? savedData.tasks.map((task) => ({ estimatedMinutes: 45, ...task }))
        : defaults.tasks,
      resources: Array.isArray(savedData.resources) ? savedData.resources : defaults.resources,
      plans: Array.isArray(savedData.plans) ? savedData.plans : defaults.plans,
    }
  } catch (error) {
    console.warn('Learning data was reset because localStorage could not be parsed.', error)
    saveLearningData(defaults)
    return defaults
  }
}

export function saveLearningData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function saveLearningSection(sectionName, sectionValue) {
  const currentData = loadLearningData()
  saveLearningData({
    ...currentData,
    [sectionName]: sectionValue,
  })
}
