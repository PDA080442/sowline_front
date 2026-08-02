import { computed, onScopeDispose, ref } from 'vue'
import { useRouter } from 'vue-router'

import { isApiRequestError } from '@/api/client'
import { useJiraApi } from '@/composables/Requests'
import { useAppNotify } from '@/composables/useAppNotify'
import { isMetadataStale } from '@/models/jira'
import { useWorkspaceStore } from '@/stores/workspace'
import type { JiraProjectMetadata, JiraSyncStatus } from '@/types'
import { applyApiError } from '@/utils/apiErrors'

const POLL_INTERVAL_MS = 2500
/** Stop polling after ~90s — Celery may be down; don't spin forever. */
const POLL_TIMEOUT_MS = 90 * 1000

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })

export const useJiraMetadata = () => {
  const router = useRouter()
  const workspaceStore = useWorkspaceStore()
  const jiraApi = useJiraApi()
  const { showError, showSuccess } = useAppNotify()

  const metadata = ref<JiraProjectMetadata | null>(null)
  const loading = ref(false)
  const syncing = ref(false)
  const error = ref('')
  const pollTimedOut = ref(false)

  let pollAbort = false
  let activeConnectionId: string | null = null

  onScopeDispose(() => {
    pollAbort = true
  })

  const status = computed<JiraSyncStatus>(() => metadata.value?.status ?? 'pending')

  const isStale = computed(() =>
    metadata.value ? isMetadataStale(metadata.value.is_stale, metadata.value.status) : false,
  )

  const resetState = () => {
    error.value = ''
    pollTimedOut.value = false
  }

  const getWorkspaceId = () => workspaceStore.currentWorkspaceId

  const handleForbiddenOrNotFound = (err: unknown) => {
    if (isApiRequestError(err)) {
      if (err.status === 404 || err.body.code === 'NOT_FOUND') {
        router.push('/forbidden')
        return true
      }

      if (err.status === 403 || err.body.code === 'FORBIDDEN') {
        showError('Недостаточно прав для синхронизации метаданных')
        return true
      }
    }

    return false
  }

  const fetchMetadata = async (connectionId: string) => {
    const workspaceId = getWorkspaceId()

    if (!workspaceId) {
      error.value = 'Выберите workspace'
      return null
    }

    try {
      const data = await jiraApi.getMetadata(workspaceId, connectionId)
      metadata.value = data
      return data
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

      return null
    }
  }

  const handleFetchMetadata = async (connectionId: string) => {
    resetState()
    loading.value = true

    try {
      return await fetchMetadata(connectionId)
    } finally {
      loading.value = false
    }
  }

  const pollUntilDone = async (connectionId: string) => {
    const startedAt = Date.now()
    pollAbort = false
    activeConnectionId = connectionId
    pollTimedOut.value = false

    while (!pollAbort) {
      await sleep(POLL_INTERVAL_MS)

      if (pollAbort || activeConnectionId !== connectionId) {
        return metadata.value
      }

      const data = await fetchMetadata(connectionId)

      if (!data) {
        return null
      }

      if (data.status === 'fresh') {
        syncing.value = false
        showSuccess('Метаданные обновлены', data.project_name)
        return data
      }

      if (data.status === 'failed') {
        syncing.value = false
        showError(data.last_error || 'Не удалось синхронизировать метаданные')
        return data
      }

      if (Date.now() - startedAt >= POLL_TIMEOUT_MS) {
        pollTimedOut.value = true
        syncing.value = false
        showError(
          'Синхронизация занимает дольше обычного. Обновите страницу позже или попробуйте ещё раз.',
        )
        return data
      }
    }

    return metadata.value
  }

  const handleSyncMetadata = async (connectionId: string) => {
    resetState()
    const workspaceId = getWorkspaceId()

    if (!workspaceId) {
      showError('Выберите workspace')
      return null
    }

    syncing.value = true

    try {
      await jiraApi.syncMetadata(workspaceId, connectionId)
    } catch (err) {
      if (isApiRequestError(err) && err.body.code === 'SYNC_IN_PROGRESS') {
        // Already syncing — just poll
      } else if (isApiRequestError(err) && err.body.code === 'VALIDATION_ERROR') {
        syncing.value = false
        showError(err.body.message || 'Сначала активируйте подключение')
        return null
      } else if (handleForbiddenOrNotFound(err)) {
        syncing.value = false
        return null
      } else {
        syncing.value = false
        applyApiError(
          err,
          (message) => {
            error.value = message
            showError(message)
          },
          () => undefined,
        )
        return null
      }
    }

    await fetchMetadata(connectionId)
    return pollUntilDone(connectionId)
  }

  const resumePollIfSyncing = async (connectionId: string) => {
    if (metadata.value?.status === 'syncing') {
      syncing.value = true
      await pollUntilDone(connectionId)
    }
  }

  const stopPolling = () => {
    pollAbort = true
    activeConnectionId = null
    syncing.value = false
  }

  return {
    metadata,
    loading,
    syncing,
    error,
    status,
    isStale,
    pollTimedOut,
    resetState,
    handleFetchMetadata,
    handleSyncMetadata,
    resumePollIfSyncing,
    stopPolling,
  }
}
