<script setup>
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { Calendar, Checked, Collection, Compass, House } from '@element-plus/icons-vue'

const route = useRoute()

const navItems = [
  { label: 'Dashboard', to: '/', icon: House },
  { label: 'Schedule', to: '/schedule', icon: Calendar },
  { label: 'Tasks', to: '/tasks', icon: Checked },
  { label: 'Resources', to: '/resources', icon: Collection },
  { label: 'Planner', to: '/planner', icon: Compass },
]

const currentPage = computed(() => {
  return navItems.find((item) => item.to === route.path)?.label || 'Dashboard'
})
</script>

<template>
  <el-container class="app-shell">
    <el-aside class="side-nav" width="260px">
      <RouterLink to="/" class="brand-link">
        <span class="brand-mark">SLA</span>
        <span>
          <strong>Smart Learning</strong>
          <small>Assistant</small>
        </span>
      </RouterLink>

      <nav class="nav-list" aria-label="Main navigation">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-link"
          exact-active-class="is-active"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>
    </el-aside>

    <el-container class="main-panel">
      <el-header class="top-bar">
        <div>
          <span class="top-label">Current page</span>
          <strong>{{ currentPage }}</strong>
        </div>
        <el-tag effect="plain" type="success">Local demo version</el-tag>
      </el-header>

      <el-main class="content-area">
        <RouterView />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: var(--app-background);
}

.side-nav {
  position: sticky;
  top: 0;
  height: 100vh;
  padding: 24px 18px;
  border-right: 1px solid var(--app-border);
  background: var(--panel-background);
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-strong);
  text-decoration: none;
  padding: 8px 6px 24px;
}

.brand-link strong,
.brand-link small {
  display: block;
}

.brand-link small {
  color: var(--text-muted);
  font-size: 0.82rem;
  margin-top: 2px;
}

.brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background: #2f7d68;
  color: #ffffff;
  font-weight: 800;
  letter-spacing: 0;
}

.nav-list {
  display: grid;
  gap: 8px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 10px 12px;
  border-radius: 8px;
  color: var(--text-muted);
  text-decoration: none;
  font-weight: 600;
}

.nav-link:hover,
.nav-link.is-active {
  background: #eaf5f0;
  color: #216450;
}

.main-panel {
  min-width: 0;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 68px;
  padding: 0 32px;
  border-bottom: 1px solid var(--app-border);
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: blur(12px);
}

.top-bar div {
  display: grid;
  gap: 2px;
}

.top-label {
  color: var(--text-muted);
  font-size: 0.78rem;
}

.content-area {
  padding: 28px 32px 40px;
}

@media (max-width: 860px) {
  .app-shell {
    display: block;
  }

  .side-nav {
    position: static;
    width: 100% !important;
    height: auto;
    padding: 16px;
    border-right: 0;
    border-bottom: 1px solid var(--app-border);
  }

  .brand-link {
    padding-bottom: 14px;
  }

  .nav-list {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  .nav-link {
    justify-content: center;
    min-height: 42px;
    padding: 8px;
  }

  .nav-link span {
    display: none;
  }

  .top-bar {
    height: auto;
    padding: 16px;
    gap: 12px;
  }

  .content-area {
    padding: 20px 16px 32px;
  }
}
</style>
