import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { useWorkspaceApi } from '@/composables/Requests'
import { apiRoleToUi, type WorkspaceListItem, type WorkspaceRole } from '@/models/workspace'
import { useAuthStore } from '@/stores/auth'

const STORAGE_KEY = 'forest-trust-current-workspace-id'

export const useWorkspaceStore = defineStore('workspace', () => {
  const workspaces = ref<WorkspaceListItem[]>([])
  const currentWorkspaceId = ref<string | null>(sessionStorage.getItem(STORAGE_KEY))
  const currentRole = ref<WorkspaceRole | null>(null)

  const selectedWorkspace = computed(
    () => workspaces.value.find((ws) => ws.id === currentWorkspaceId.value) ?? null,
  )

  const isWorkspaceAdmin = computed(
    () => currentRole.value === 'Owner' || currentRole.value === 'Admin',
  )

  const setWorkspaces = (items: WorkspaceListItem[]) => {
    workspaces.value = items
  }

  const setCurrentWorkspace = (id: string) => {
    currentWorkspaceId.value = id
    sessionStorage.setItem(STORAGE_KEY, id)
  }

  const clearCurrentWorkspace = () => {
    currentWorkspaceId.value = null
    currentRole.value = null
    sessionStorage.removeItem(STORAGE_KEY)
  }

  const setCurrentRole = (role: WorkspaceRole | null) => {
    currentRole.value = role
  }

  const resolveCurrentRole = async (): Promise<WorkspaceRole | null> => {
    const authStore = useAuthStore()
    const workspaceId = currentWorkspaceId.value

    if (!workspaceId) {
      currentRole.value = null
      return null
    }

    const profile = await authStore.ensureProfile()

    if (!profile) {
      currentRole.value = null
      return null
    }

    // NOTE: `/api/me/` returns the profile id, not the user id. Workspace members
    // expose `user_id` + `email`, so we match on email (stable across both).
    const profileEmail = profile.email?.toLowerCase()

    try {
      const workspaceApi = useWorkspaceApi()
      const response = await workspaceApi.listMembers(workspaceId)
      const member = response.members.find((item) => item.email?.toLowerCase() === profileEmail)
      const role = member ? apiRoleToUi(member.role) : null
      currentRole.value = role
      return role
    } catch {
      currentRole.value = null
      return null
    }
  }

  return {
    workspaces,
    currentWorkspaceId,
    currentRole,
    selectedWorkspace,
    isWorkspaceAdmin,
    setWorkspaces,
    setCurrentWorkspace,
    clearCurrentWorkspace,
    setCurrentRole,
    resolveCurrentRole,
  }
})
