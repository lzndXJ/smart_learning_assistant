<script setup>
import { computed, ref } from 'vue'
import { Calendar } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
import { getWeekDays, loadLearningData } from '@/utils/storage'

const initialData = loadLearningData()
const courses = ref(initialData.courses)
const weekDays = getWeekDays()

const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' })

const totalClasses = computed(() => courses.value.length)

function coursesForDay(day) {
  return courses.value
    .filter((course) => course.day === day)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
}
</script>

<template>
  <div class="page-stack">
    <PageHeader
      eyebrow="Weekly view"
      title="Class schedule"
      description="A simple weekly structure for seeing where study tasks can fit around classes."
    >
      <template #actions>
        <el-tag type="success" effect="plain">
          <el-icon><Calendar /></el-icon>
          {{ totalClasses }} classes
        </el-tag>
      </template>
    </PageHeader>

    <section class="schedule-board">
      <article
        v-for="day in weekDays"
        :key="day"
        class="day-column"
        :class="{ 'is-today': day === todayName }"
      >
        <div class="day-heading">
          <h2>{{ day }}</h2>
          <el-tag v-if="day === todayName" size="small" type="success">Today</el-tag>
        </div>

        <div v-if="coursesForDay(day).length" class="course-stack">
          <div
            v-for="course in coursesForDay(day)"
            :key="course.id"
            class="course-card"
            :style="{ borderLeftColor: course.color }"
          >
            <span>{{ course.startTime }} - {{ course.endTime }}</span>
            <strong>{{ course.name }}</strong>
            <p>{{ course.room }}</p>
          </div>
        </div>

        <EmptyState v-else description="No class blocks." />
      </article>
    </section>
  </div>
</template>

<style scoped>
.schedule-board {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 14px;
}

.day-column {
  min-height: 260px;
  padding: 16px;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  background: var(--panel-background);
}

.day-column.is-today {
  border-color: #99cabb;
  background: #f8fcfa;
}

.day-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 28px;
  gap: 8px;
  margin-bottom: 14px;
}

h2 {
  margin: 0;
  color: var(--text-strong);
  font-size: 1rem;
  font-weight: 800;
}

.course-stack {
  display: grid;
  gap: 10px;
}

.course-card {
  padding: 12px 12px 12px 14px;
  border: 1px solid var(--app-border);
  border-left: 5px solid;
  border-radius: 8px;
  background: #ffffff;
}

.course-card span {
  color: var(--text-muted);
  font-size: 0.84rem;
  font-weight: 700;
}

.course-card strong {
  display: block;
  margin-top: 4px;
  color: var(--text-strong);
  font-weight: 800;
}

.course-card p {
  margin: 6px 0 0;
  color: var(--text-muted);
}
</style>
