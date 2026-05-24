<script setup>
import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Calendar, Delete, Plus } from '@element-plus/icons-vue'
import CourseEditorDialog from '@/components/CourseEditorDialog.vue'
import PageHeader from '@/components/PageHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
import { getWeekDays, loadLearningData, saveLearningSection } from '@/utils/storage'

const initialData = loadLearningData()
const courses = ref(initialData.courses)
const tasks = ref(initialData.tasks)
const weekDays = getWeekDays()
const dialogVisible = ref(false)
const editingCourse = ref(null)

const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' })

const totalClasses = computed(() => courses.value.length)

function coursesForDay(day) {
  return courses.value
    .filter((course) => course.day === day)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
}

function openAddDialog(day = todayName) {
  editingCourse.value = {
    day,
  }
  dialogVisible.value = true
}

function openEditDialog(course) {
  editingCourse.value = { ...course }
  dialogVisible.value = true
}

function saveCourse(courseData) {
  const previousCourse = courses.value.find((course) => course.id === courseData.id)
  const timeSlots = courseData.timeSlots?.length ? courseData.timeSlots : [courseData]

  if (courseData.id) {
    const [firstSlot, ...extraSlots] = timeSlots
    const updatedCourse = buildCourseFromSlot(courseData, firstSlot, courseData.id)

    courses.value = courses.value.map((course) =>
      course.id === courseData.id ? updatedCourse : course,
    )

    if (extraSlots.length) {
      courses.value = [
        ...courses.value,
        ...extraSlots.map((slot, index) => buildCourseFromSlot(courseData, slot, `course-${Date.now()}-${index}`)),
      ]
    }

    ElMessage.success('Course updated.')
  } else {
    courses.value = [
      ...courses.value,
      ...timeSlots.map((slot, index) => buildCourseFromSlot(courseData, slot, `course-${Date.now()}-${index}`)),
    ]
    ElMessage.success('Course added.')
  }

  saveLearningSection('courses', courses.value)

  if (previousCourse && previousCourse.name !== courseData.name) {
    tasks.value = tasks.value.map((task) =>
      task.course === previousCourse.name ? { ...task, course: courseData.name } : task,
    )
    saveLearningSection('tasks', tasks.value)
  }
}

function buildCourseFromSlot(courseData, slot, id) {
  return {
    id,
    name: courseData.name,
    day: slot.day,
    startTime: slot.startTime,
    endTime: slot.endTime,
    room: slot.room,
    color: courseData.color,
  }
}

function deleteCourse(courseId) {
  ElMessageBox.confirm('This course will be removed from your weekly schedule.', 'Delete course?', {
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
    type: 'warning',
  })
    .then(() => {
      const deletedCourse = courses.value.find((course) => course.id === courseId)
      courses.value = courses.value.filter((course) => course.id !== courseId)
      saveLearningSection('courses', courses.value)

      if (deletedCourse) {
        tasks.value = tasks.value.map((task) =>
          task.course === deletedCourse.name ? { ...task, course: '' } : task,
        )
        saveLearningSection('tasks', tasks.value)
      }

      ElMessage.success('Course deleted.')
    })
    .catch(() => {})
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
        <el-button type="primary" :icon="Plus" @click="openAddDialog()">Add course</el-button>
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
          <div class="day-actions">
            <el-tag v-if="day === todayName" size="small" type="success">Today</el-tag>
            <el-tooltip content="Add course to this day" placement="top">
              <el-button :icon="Plus" circle text size="small" @click="openAddDialog(day)" />
            </el-tooltip>
          </div>
        </div>

        <div v-if="coursesForDay(day).length" class="course-stack">
          <div
            v-for="course in coursesForDay(day)"
            :key="course.id"
            class="course-card"
            :style="{ borderLeftColor: course.color }"
            role="button"
            tabindex="0"
            @click="openEditDialog(course)"
            @keydown.enter="openEditDialog(course)"
          >
            <div class="course-content">
              <span>{{ course.startTime }} - {{ course.endTime }}</span>
              <strong>{{ course.name }}</strong>
              <p>{{ course.room || 'Location not set' }}</p>
            </div>

            <div class="course-actions">
              <el-tooltip content="Delete course" placement="top">
                <el-button
                  :icon="Delete"
                  circle
                  text
                  type="danger"
                  size="small"
                  @click.stop="deleteCourse(course.id)"
                />
              </el-tooltip>
            </div>
          </div>
        </div>

        <EmptyState v-else description="No class blocks." />
      </article>
    </section>

    <CourseEditorDialog
      v-model="dialogVisible"
      :course="editingCourse"
      :courses="courses"
      :week-days="weekDays"
      @save="saveCourse"
    />
  </div>
</template>

<style scoped>
.schedule-board {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.day-column {
  min-width: 190px;
  min-height: 420px;
  padding: 18px;
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

.day-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

h2 {
  margin: 0;
  color: var(--text-strong);
  font-size: 1rem;
  font-weight: 800;
}

.course-stack {
  display: grid;
  gap: 12px;
}

.course-card {
  position: relative;
  min-height: 154px;
  padding: 18px 46px 18px 16px;
  border: 1px solid var(--app-border);
  border-left: 5px solid;
  border-radius: 8px;
  background: #ffffff;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.course-card:hover {
  border-color: #99cabb;
  box-shadow: 0 8px 24px rgba(33, 100, 80, 0.08);
  transform: translateY(-1px);
}

.course-content {
  min-width: 0;
}

.course-card span {
  color: var(--text-muted);
  font-size: 0.88rem;
  font-weight: 700;
}

.course-card strong {
  display: block;
  margin-top: 4px;
  color: var(--text-strong);
  font-size: 1.02rem;
  font-weight: 800;
  line-height: 1.35;
  overflow-wrap: break-word;
  word-break: normal;
  hyphens: auto;
}

.course-card p {
  margin: 10px 0 0;
  color: var(--text-muted);
}

.course-actions {
  display: flex;
  position: absolute;
  top: 8px;
  right: 8px;
  gap: 2px;
}

@media (max-width: 1320px) {
  .schedule-board {
    grid-template-columns: repeat(7, minmax(190px, 1fr));
  }
}

@media (hover: hover) {
  .course-actions {
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .course-card:hover .course-actions,
  .course-card:focus-within .course-actions {
    opacity: 1;
  }
}
</style>
