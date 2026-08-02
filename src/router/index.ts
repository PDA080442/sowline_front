import { createRouter, createWebHistory } from 'vue-router'

import { getAccessToken } from '@/api/tokens'
import { useWorkspaceStore } from '@/stores/workspace'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiresWorkspace?: boolean
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/workspace/WorkspaceDashboardPage.vue'),
    },
    {
      path: '/auth/login',
      name: 'auth-login',
      component: () => import('@/views/auth/LoginPage.vue'),
    },
    {
      path: '/auth/register',
      name: 'auth-register',
      component: () => import('@/views/auth/RegisterPage.vue'),
    },
    {
      path: '/auth/forgot-password',
      name: 'auth-forgot-password',
      component: () => import('@/views/auth/ForgotPasswordPage.vue'),
    },
    {
      path: '/auth/reset-password',
      name: 'auth-reset-password',
      component: () => import('@/views/auth/ResetPasswordPage.vue'),
    },
    {
      path: '/workspace/select',
      name: 'workspace-select',
      component: () => import('@/views/workspace/WorkspaceSelectPage.vue'),
    },
    {
      path: '/workspace/create',
      redirect: { path: '/workspace/select', query: { create: '1' } },
    },
    {
      path: '/workspace/members',
      name: 'workspace-members',
      component: () => import('@/views/workspace/WorkspaceMembersPage.vue'),
    },
    {
      path: '/workspace/jira',
      name: 'workspace-jira',
      meta: { requiresAuth: true, requiresWorkspace: true },
      component: () => import('@/views/workspace/JiraConnectionsPage.vue'),
    },
    {
      path: '/workspace/jira/:connectionId',
      name: 'workspace-jira-detail',
      meta: { requiresAuth: true, requiresWorkspace: true },
      component: () => import('@/views/workspace/JiraConnectionDetailPage.vue'),
    },
    {
      path: '/invite/accept',
      name: 'invite-accept',
      component: () => import('@/views/workspace/AcceptInvitePage.vue'),
    },
    {
      path: '/forbidden',
      name: 'forbidden',
      component: () => import('@/views/errors/ForbiddenPage.vue'),
    },
  ],
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !getAccessToken()) {
    return { name: 'auth-login', query: { redirect: to.fullPath } }
  }

  if (to.meta.requiresWorkspace) {
    const workspaceStore = useWorkspaceStore()

    if (!workspaceStore.currentWorkspaceId) {
      return { name: 'workspace-select', query: { redirect: to.fullPath } }
    }
  }

  return true
})

export default router
