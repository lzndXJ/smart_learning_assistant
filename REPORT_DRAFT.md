# Smart Learning Assistant Report Draft

## 1. Program Introduction

Smart Learning Assistant is an interactive web system designed for university students. It helps students manage classes, learning tasks, study resources, deadline reminders, and short-term study plans in one place. The project is implemented with Vue3, Vue Router, Element Plus, Vite, and localStorage.

The system contains five main pages: Dashboard, Schedule, Tasks, Resources, and Planner. These pages are connected by shared local data, so task changes can influence the dashboard and reminder center.

## 2. Target Users And Needs

The target users are university students who need to manage multiple courses, assignments, readings, exams, project work, and online resources. Their common problems include scattered information, unclear task priorities, and weak awareness of upcoming deadlines.

The system addresses these needs by combining task management, progress overview, course resources, and reminders. Students can quickly understand what needs to be done, which course has the highest workload, and which materials are useful for current tasks.

## 3. Implemented Features

### 3.1 Task Management

Users can add, edit, delete, complete, and filter tasks. Each task has a title, course, category, priority, due date, estimated study time, and notes. The page supports filtering by completion status, priority, and course.

### 3.2 Learning Dashboard

The Dashboard shows classes today, pending tasks, completion rate, estimated study time, saved resources, course workload, and deadline reminders. It also suggests a next step based on today's tasks and classes. This gives users immediate feedback and helps them decide what to do next.

### 3.3 Resource And Reminder Center

Users can add, edit, delete, search, and open learning resources. Resources can be organized by course and type. The same page also displays urgent tasks due within three days, which connects learning materials with task deadlines.

### 3.4 Study Planner

The Planner guides users through three prompts: subject, available time, and study goal. It then generates a simple study plan. Some browsers also support voice input, which adds another interaction method.

## 4. User Interaction Design

The interface uses a sidebar navigation structure and consistent Element Plus components. Tags, progress indicators, buttons, dialogs, filters, and cards provide clear feedback. The Dashboard translates stored data into visual and actionable information, such as workload bars and urgent reminder tags.

The system is designed to be easy to demonstrate. A user can create a task, see the dashboard update, add a resource, and generate a study plan in a short workflow.

## 5. Advantages

The first advantage is system completeness. The project is not a set of isolated pages; task data is reused by the Dashboard and Resources reminder center. The second advantage is usability. Common actions are visible and supported by immediate feedback. The third advantage is low deployment complexity because the app can run locally with Vite and stores demo data in localStorage.

## 6. Limitations

The current system does not have a real backend server, account login, cloud synchronization, or file upload. Data is stored in one browser only. The workload chart and study plan generation are rule-based and relatively simple.

## 7. Future Improvements

Future work could include user accounts, database storage, calendar import, notification services, file upload, mobile optimization, and smarter recommendation logic based on historical study behavior.

## 8. Team Contribution

Member A: application layout, router, schedule page, and task management module.

Member B: dashboard statistics, workload visualization, completion logic, and reminder logic.

Member C: resource center, study planner refinement, README, report preparation, and presentation organization.

If the team contribution is equal, the ratio can be written as 33.3%, 33.3%, and 33.3%.
