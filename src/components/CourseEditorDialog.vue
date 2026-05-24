<script setup>
import { computed, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete, Plus } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  course: {
    type: Object,
    default: null,
  },
  courses: {
    type: Array,
    default: () => [],
  },
  weekDays: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue', 'save'])

const colorOptions = [
  { label: 'Green', value: '#2f7d68' },
  { label: 'Blue', value: '#3867d6' },
  { label: 'Amber', value: '#8a5a00' },
  { label: 'Red', value: '#9b3d3a' },
  { label: 'Steel', value: '#4c6a8a' },
  { label: 'Purple', value: '#6f4bb2' },
]

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const form = reactive(createEmptyCourse())

function createEmptyCourse() {
  return {
    id: '',
    name: '',
    color: '#2f7d68',
    timeSlots: [createEmptyTimeSlot()],
  }
}

function createEmptyTimeSlot(day = 'Monday') {
  return {
    localId: `slot-${Date.now()}-${Math.random()}`,
    day,
    startTime: '09:00',
    endTime: '10:00',
    room: '',
  }
}

function resetForm(course) {
  const emptyCourse = createEmptyCourse()

  form.id = course?.id || ''
  form.name = course?.name || ''
  form.color = course?.color || emptyCourse.color
  form.timeSlots = createTimeSlots(course)
}

function createTimeSlots(course) {
  if (Array.isArray(course?.timeSlots) && course.timeSlots.length) {
    return course.timeSlots.map((slot) => ({
      ...createEmptyTimeSlot(slot.day),
      ...slot,
    }))
  }

  return [
    {
      ...createEmptyTimeSlot(course?.day || 'Monday'),
      startTime: course?.startTime || '09:00',
      endTime: course?.endTime || '10:00',
      room: course?.room || '',
    },
  ]
}

watch(
  () => props.modelValue,
  (isVisible) => {
    if (isVisible) resetForm(props.course)
  },
)

watch(
  () => props.course,
  (course) => {
    if (props.modelValue) resetForm(course)
  },
)

function saveCourse() {
  if (!form.name.trim()) {
    ElMessage.warning('Please enter a course name.')
    return
  }

  for (const slot of form.timeSlots) {
    if (!slot.day || !slot.startTime || !slot.endTime) {
      ElMessage.warning('Please complete every time slot.')
      return
    }

    if (slot.startTime >= slot.endTime) {
      ElMessage.warning('Each end time should be later than its start time.')
      return
    }
  }

  const cleanSlots = form.timeSlots.map((slot) => ({
    day: slot.day,
    startTime: slot.startTime,
    endTime: slot.endTime,
    room: slot.room.trim(),
  }))

  emit('save', {
    id: form.id,
    name: form.name.trim(),
    color: form.color,
    day: cleanSlots[0].day,
    startTime: cleanSlots[0].startTime,
    endTime: cleanSlots[0].endTime,
    room: cleanSlots[0].room,
    timeSlots: cleanSlots,
  })

  visible.value = false
}

function addTimeSlot() {
  const lastSlot = form.timeSlots[form.timeSlots.length - 1]
  form.timeSlots.push({
    ...createEmptyTimeSlot(lastSlot?.day || 'Monday'),
    room: lastSlot?.room || '',
  })
}

function removeTimeSlot(index) {
  if (form.timeSlots.length === 1) {
    ElMessage.warning('A course needs at least one time slot.')
    return
  }

  form.timeSlots.splice(index, 1)
}

function slotOverlapMessage(slot, index) {
  if (!slot.day || !slot.startTime || !slot.endTime || slot.startTime >= slot.endTime) return ''

  const existingCourse = props.courses.find((course) => {
    if (course.id === form.id || course.day !== slot.day) return false
    return slot.startTime < course.endTime && slot.endTime > course.startTime
  })

  if (existingCourse) return `This overlaps with ${existingCourse.name}.`

  const siblingIndex = form.timeSlots.findIndex((otherSlot, otherIndex) => {
    if (otherIndex === index || otherSlot.day !== slot.day) return false
    return slot.startTime < otherSlot.endTime && slot.endTime > otherSlot.startTime
  })

  return siblingIndex >= 0 ? 'This overlaps with another time slot in this course.' : ''
}
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="form.id ? 'Edit course' : 'Add course'"
    width="560px"
    destroy-on-close
  >
    <el-form label-position="top" class="course-form">
      <el-form-item label="Course name">
        <el-input v-model="form.name" placeholder="e.g., Human-Computer Interaction" />
      </el-form-item>

      <el-form-item label="Color">
        <div class="color-swatches">
          <button
            v-for="color in colorOptions"
            :key="color.value"
            type="button"
            class="color-swatch"
            :class="{ selected: form.color === color.value }"
            :style="{ backgroundColor: color.value }"
            :aria-label="color.label"
            @click="form.color = color.value"
          ></button>
        </div>
      </el-form-item>

      <div class="time-slot-header">
        <h3>Time slots</h3>
        <el-button :icon="Plus" @click="addTimeSlot">Add time</el-button>
      </div>

      <section
        v-for="(slot, index) in form.timeSlots"
        :key="slot.localId"
        class="time-slot"
      >
        <div class="slot-title">
          <strong>Time slot {{ index + 1 }}</strong>
          <el-button
            v-if="form.timeSlots.length > 1"
            :icon="Delete"
            circle
            text
            type="danger"
            @click="removeTimeSlot(index)"
          />
        </div>

        <div class="form-grid">
          <el-form-item label="Day">
            <el-select v-model="slot.day" placeholder="Choose day">
              <el-option v-for="day in weekDays" :key="day" :label="day" :value="day" />
            </el-select>
          </el-form-item>

          <el-form-item label="Room / Location">
            <el-input v-model="slot.room" placeholder="e.g., Design Lab 204" />
          </el-form-item>
        </div>

        <div class="form-grid">
          <el-form-item label="Start time">
            <el-time-select
              v-model="slot.startTime"
              start="06:00"
              step="00:05"
              end="23:55"
              class="full-width"
              placeholder="Start time"
            />
          </el-form-item>

          <el-form-item label="End time">
            <el-time-select
              v-model="slot.endTime"
              start="06:00"
              step="00:05"
              end="23:55"
              class="full-width"
              placeholder="End time"
            />
          </el-form-item>
        </div>

        <el-alert
          v-if="slotOverlapMessage(slot, index)"
          type="warning"
          :closable="false"
          show-icon
          :title="slotOverlapMessage(slot, index)"
        />
      </section>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">Cancel</el-button>
      <el-button type="primary" @click="saveCourse">Save course</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.course-form {
  display: grid;
  gap: 2px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.color-swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.full-width {
  width: 100%;
}

.color-swatch {
  width: 34px;
  height: 34px;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
}

.color-swatch.selected {
  border-color: var(--text-strong);
  box-shadow: 0 0 0 3px #ffffff inset;
}

.time-slot-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 4px;
}

.time-slot-header h3 {
  margin: 0;
  color: var(--text-strong);
  font-size: 1rem;
  font-weight: 800;
}

.time-slot {
  display: grid;
  gap: 2px;
  padding: 14px;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  background: #fbfcfc;
}

.slot-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 32px;
}

.slot-title strong {
  color: var(--text-strong);
  font-weight: 800;
}

@media (max-width: 620px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
</style>
