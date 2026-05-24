# Smart Learning Assistant

Smart Learning Assistant is a Vue3 + Element Plus web system for university students. It connects class schedules, task management, dashboard analytics, guided planning, and resource reminders into one local demo application.

## Core Features

1. Task Management
   - Add, edit, delete, complete, and filter learning tasks.
   - Filter by status, priority, and course.
   - Store priority, due date, category, course, notes, and estimated study time.

2. Learning Dashboard
   - Show classes today, pending tasks, completion rate, study time, and saved resources.
   - Display course workload through a visual bar chart.
   - Show urgent deadline reminders for tasks due within three days.
   - Suggest the next learning step from task and schedule data.

3. Resource And Reminder Center
   - Add, edit, delete, search, and open study resources.
   - Organize resources by course and type.
   - Keep urgent deadlines visible next to related materials.

Extra module:

- Study Planner: a guided three-step planner with optional browser voice input.

## Technology Stack

- Vue3
- Vue Router
- Element Plus
- Vite
- localStorage

## Project Setup

```sh
npm install
```

## Run For Development

```sh
npm run dev
```

## Build For Submission

```sh
npm run build
```

## Data Storage

The demo uses browser `localStorage`. Data is saved locally on the current browser and device. If you need to reset the data, clear site data in the browser dev tools or change the storage key in `src/utils/storage.js`.

## Suggested Demo Flow

1. Open Dashboard and introduce the target user: university students managing classes, tasks, resources, and deadlines.
2. Show task management: add a task, filter by course or priority, and mark it completed.
3. Return to Dashboard to show updated progress, workload, and reminders.
4. Open Resources to add a course material and explain the reminder center.
5. Open Planner to generate a study plan.

## Team Contribution Example

- Member A: app layout, router, schedule, and task management.
- Member B: dashboard statistics, workload visualization, completion logic, and reminders.
- Member C: resource center, planner polish, README, report, and presentation preparation.
