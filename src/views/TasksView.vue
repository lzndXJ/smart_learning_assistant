<script setup>
import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import MetricCard from '@/components/MetricCard.vue'
import TaskEditorDialog from '@/components/TaskEditorDialog.vue'
import TaskList from '@/components/TaskList.vue'
import { loadLearningData, saveLearningSection } from '@/utils/storage'

const initialData = loadLearningData()
const courses = ref(initialData.courses)
const tasks = ref(initialData.tasks)

const dialogVisible = ref(false)
const editingTask = ref(null)
const statusFilter = ref('all')
const priorityFilter = ref('all')

const priorityOrder = {
  High: 1,
  Medium: 2,
  Low: 3,
}

const taskStats = computed(() => {
  const total = tasks.value.length
  const completed = tasks.value.filter((task) => task.completed).length
  const pending = total - completed

  return {
    total,
    completed,
    pending,
  }
})

const filteredTasks = computed(() => {
  return [...tasks.value]
    .filter((task) => {
      if (statusFilter.value === 'pending') return !task.completed
      if (statusFilter.value === 'completed') return task.completed
      return true
    })
    .filter((task) => priorityFilter.value === 'all' || task.priority === priorityFilter.value)
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      if (a.dueDate !== b.dueDate) return (a.dueDate || '').localeCompare(b.dueDate || '')
      return (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4)
    })
})

const completionRate = computed(() => {
  if (taskStats.value.total === 0) return 0
  return Math.round((taskStats.value.completed / taskStats.value.total) * 100)
})

function openAddDialog() {
  editingTask.value = null
  dialogVisible.value = true
}

function openEditDialog(task) {
  editingTask.value = { ...task }
  dialogVisible.value = true
}

function saveTask(taskData) {
  if (taskData.id) {
    tasks.value = tasks.value.map((task) => (task.id === taskData.id ? taskData : task))
    ElMessage.success('Task updated.')
  } else {
    tasks.value = [
      {
        ...taskData,
        id: `task-${Date.now()}`,
        completed: false,
      },
      ...tasks.value,
    ]
    ElMessage.success('Task added.')
  }

  saveLearningSection('tasks', tasks.value)
}

function toggleTask(taskId) {
  tasks.value = tasks.value.map((task) =>
    task.id === taskId ? { ...task, completed: !task.completed } : task,
  )
  saveLearningSection('tasks', tasks.value)
}

function deleteTask(taskId) {
  ElMessageBox.confirm('This task will be removed from your local list.', 'Delete task?', {
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
    type: 'warning',
  })
    .then(() => {
      tasks.value = tasks.value.filter((task) => task.id !== taskId)
      saveLearningSection('tasks', tasks.value)
      ElMessage.success('Task deleted.')
    })
    .catch(() => {})
}
</script>

<template>
  <div class="page-stack">
    <PageHeader
      eyebrow="Task board"
      title="Flexible task management"
      description="Add quick work items, connect them to courses, and keep progress visible with simple feedback."
    >
      <template #actions>
        <el-button type="primary" :icon="Plus" @click="openAddDialog">Add task</el-button>
      </template>
    </PageHeader>

    <div class="responsive-grid">
      <MetricCard title="All tasks" :value="taskStats.total" detail="Stored locally" />
      <MetricCard title="Pending" :value="taskStats.pending" detail="Ready to work on" tone="blue" />
      <MetricCard title="Completed" :value="`${completionRate}%`" detail="Completion rate" tone="amber" />
    </div>

    <section class="panel">
      <div class="task-toolbar">
        <div>
          <h2 class="section-title">Tasks</h2>
          <el-progress :percentage="completionRate" :stroke-width="10" />
        </div>

        <div class="filters">
          <el-radio-group v-model="statusFilter">
            <el-radio-button label="all">All</el-radio-button>
            <el-radio-button label="pending">Pending</el-radio-button>
            <el-radio-button label="completed">Completed</el-radio-button>
          </el-radio-group>

          <el-select v-model="priorityFilter" class="priority-select" aria-label="Priority filter">
            <el-option label="All priorities" value="all" />
            <el-option label="High" value="High" />
            <el-option label="Medium" value="Medium" />
            <el-option label="Low" value="Low" />
          </el-select>
        </div>
      </div>

      <TaskList
        :tasks="filteredTasks"
        empty-text="No tasks match the current filters."
        @toggle="toggleTask"
        @edit="openEditDialog"
        @delete="deleteTask"
      >
        <template #empty-action>
          <el-button type="primary" :icon="Plus" @click="openAddDialog">Add task</el-button>
        </template>
      </TaskList>
    </section>

    <TaskEditorDialog
      v-model="dialogVisible"
      :task="editingTask"
      :courses="courses"
      @save="saveTask"
    />
  </div>
</template>

<style scoped>
.task-toolbar {
  display: grid;
  grid-template-columns: minmax(240px, 1fr) auto;
  gap: 16px;
  align-items: end;
  margin-bottom: 18px;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.priority-select {
  width: 160px;
}

@media (max-width: 820px) {
  .task-toolbar {
    grid-template-columns: 1fr;
  }

  .filters {
    justify-content: flex-start;
  }
}
</style>
