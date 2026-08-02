import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { isApiRequestError } from '@/api/client'
import { useJiraApi } from '@/composables/Requests'
import { useAppNotify } from '@/composables/useAppNotify'
import { validateJiraConnectionForm, type JiraConnectionFormValues } from '@/models/jira'
import { useWorkspaceStore } from '@/stores/workspace'
import type {
  JiraConnection,
  JiraConnectionCreate,
  JiraConnectionTestResult,
  JiraConnectionUpdate,
} from '@/types'
import { applyApiError } from '@/utils/apiErrors'

export const useJiraConnections = () => {
  const router = useRouter()
  const workspaceStore = useWorkspaceStore()
  const jiraApi = useJiraApi()
  const { showSuccess, showError } = useAppNotify()

  const connections = ref<JiraConnection[]>([])
  const connection = ref<JiraConnection | null>(null)
  const loading = ref(false)
  const error = ref('')
  const fieldErrors = ref<Record<string, string>>({})
  const actionLoading = ref<Record<string, boolean>>({})
  const lastTestResult = ref<JiraConnectionTestResult | null>(null)

  const getWorkspaceId = () => workspaceStore.currentWorkspaceId

  const resetState = () => {
    error.value = ''
    fieldErrors.value = {}
  }

  const setActionLoading = (key: string, value: boolean) => {
    actionLoading.value = { ...actionLoading.value, [key]: value }
  }

  const handleForbiddenOrNotFound = (err: unknown) => {
    if (isApiRequestError(err)) {
      if (err.status === 404 || err.body.code === 'NOT_FOUND') {
        router.push('/forbidden')
        return true
      }

      if (err.status === 403 || err.body.code === 'FORBIDDEN') {
        showError('Недостаточно прав для этого действия')
        return true
      }
    }

    return false
  }

  const handleFetchConnections = async () => {
    resetState()
    const workspaceId = getWorkspaceId()

    if (!workspaceId) {
      error.value = 'Выберите workspace'
      return
    }

    loading.value = true

    try {
      connections.value = await jiraApi.listConnections(workspaceId)
    } catch (err) {
      if (!handleForbiddenOrNotFound(err)) {
        applyApiError(
          err,
          (message) => {
            error.value = message
          },
          (errors) => {
            fieldErrors.value = errors
          },
        )
      }
    } finally {
      loading.value = false
    }
  }

  const handleFetchConnection = async (connectionId: string) => {
    resetState()
    const workspaceId = getWorkspaceId()

    if (!workspaceId) {
      error.value = 'Выберите workspace'
      return null
    }

    loading.value = true

    try {
      connection.value = await jiraApi.getConnection(workspaceId, connectionId)
      return connection.value
    } catch (err) {
      if (!handleForbiddenOrNotFound(err)) {
        applyApiError(
          err,
          (message) => {
            error.value = message
          },
          () => undefined,
        )
      }

      connection.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  const handleCreateConnection = async (values: JiraConnectionFormValues) => {
    resetState()
    const workspaceId = getWorkspaceId()

    if (!workspaceId) {
      showError('Выберите workspace')
      return null
    }

    const clientErrors = validateJiraConnectionForm(values, { isEdit: false, hasApiToken: false })

    if (Object.keys(clientErrors).length > 0) {
      fieldErrors.value = clientErrors
      return null
    }

    loading.value = true

    const body: JiraConnectionCreate = {
      name: values.name.trim(),
      base_url: values.base_url.trim().replace(/\/+$/, ''),
      email: values.email.trim(),
      api_token: values.api_token.trim(),
      project_key: values.project_key.trim().toUpperCase(),
      board_id: values.board_id.trim() || undefined,
    }

    try {
      const created = await jiraApi.createConnection(workspaceId, body)
      connections.value = [created, ...connections.value]
      showSuccess('Успешно', 'Jira-подключение создано')
      return created
    } catch (err) {
      if (!handleForbiddenOrNotFound(err)) {
        applyApiError(
          err,
          (message) => {
            error.value = message
            showError(message)
          },
          (errors) => {
            fieldErrors.value = errors
          },
        )
      }

      return null
    } finally {
      loading.value = false
    }
  }

  const handleUpdateConnection = async (connectionId: string, values: JiraConnectionFormValues) => {
    resetState()
    const workspaceId = getWorkspaceId()

    if (!workspaceId) {
      showError('Выберите workspace')
      return null
    }

    const existing = connection.value ?? connections.value.find((item) => item.id === connectionId)

    const clientErrors = validateJiraConnectionForm(values, {
      isEdit: true,
      hasApiToken: existing?.has_api_token ?? false,
    })

    if (Object.keys(clientErrors).length > 0) {
      fieldErrors.value = clientErrors
      return null
    }

    loading.value = true

    const body: JiraConnectionUpdate = {
      name: values.name.trim(),
      base_url: values.base_url.trim().replace(/\/+$/, ''),
      email: values.email.trim(),
      project_key: values.project_key.trim().toUpperCase(),
      board_id: values.board_id.trim(),
    }

    if (values.api_token.trim()) {
      body.api_token = values.api_token.trim()
    }

    try {
      const updated = await jiraApi.updateConnection(workspaceId, connectionId, body)
      connections.value = connections.value.map((item) => (item.id === updated.id ? updated : item))

      if (connection.value?.id === updated.id) {
        connection.value = updated
      }

      showSuccess('Успешно', 'Подключение обновлено')
      return updated
    } catch (err) {
      if (!handleForbiddenOrNotFound(err)) {
        applyApiError(
          err,
          (message) => {
            error.value = message
            showError(message)
          },
          (errors) => {
            fieldErrors.value = errors
          },
        )
      }

      return null
    } finally {
      loading.value = false
    }
  }

  const handleDeactivateConnection = async (connectionId: string) => {
    resetState()
    const workspaceId = getWorkspaceId()

    if (!workspaceId) {
      showError('Выберите workspace')
      return null
    }

    setActionLoading(`deactivate-${connectionId}`, true)

    try {
      const updated = await jiraApi.deactivateConnection(workspaceId, connectionId)
      connections.value = connections.value.map((item) => (item.id === updated.id ? updated : item))

      if (connection.value?.id === updated.id) {
        connection.value = updated
      }

      showSuccess('Успешно', 'Подключение деактивировано')
      return updated
    } catch (err) {
      if (!handleForbiddenOrNotFound(err)) {
        applyApiError(
          err,
          (message) => {
            showError(message)
          },
          () => undefined,
        )
      }

      return null
    } finally {
      setActionLoading(`deactivate-${connectionId}`, false)
    }
  }

  const handleTestConnection = async (connectionId: string) => {
    resetState()
    const workspaceId = getWorkspaceId()

    if (!workspaceId) {
      showError('Выберите workspace')
      return null
    }

    setActionLoading(`test-${connectionId}`, true)
    lastTestResult.value = null

    try {
      const result = await jiraApi.testConnection(workspaceId, connectionId)
      lastTestResult.value = result

      const refreshed = await jiraApi.getConnection(workspaceId, connectionId)
      connections.value = connections.value.map((item) =>
        item.id === refreshed.id ? refreshed : item,
      )

      if (connection.value?.id === refreshed.id) {
        connection.value = refreshed
      }

      if (result.status === 'success') {
        showSuccess('Проверка пройдена', result.detail)
      } else {
        showError(result.detail)
      }

      return result
    } catch (err) {
      if (!handleForbiddenOrNotFound(err)) {
        applyApiError(
          err,
          (message) => {
            showError(message)
          },
          () => undefined,
        )
      }

      return null
    } finally {
      setActionLoading(`test-${connectionId}`, false)
    }
  }

  return {
    connections,
    connection,
    loading,
    error,
    fieldErrors,
    actionLoading,
    lastTestResult,
    resetState,
    handleFetchConnections,
    handleFetchConnection,
    handleCreateConnection,
    handleUpdateConnection,
    handleDeactivateConnection,
    handleTestConnection,
  }
}
