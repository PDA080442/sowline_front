import { ref } from 'vue'

import { isApiRequestError } from '@/api/client'
import { CONNECTION_GUIDE_SLUG, useJiraApi } from '@/composables/Requests'
import type { JiraGuide } from '@/types'
import { applyApiError } from '@/utils/apiErrors'

const CACHE_KEY = `jira-guide:${CONNECTION_GUIDE_SLUG}`

const readCache = (): JiraGuide | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as JiraGuide) : null
  } catch {
    return null
  }
}

const writeCache = (guide: JiraGuide) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(guide))
  } catch {
    // ignore quota / serialization errors — cache is best-effort
  }
}

export const useJiraGuide = () => {
  const jiraApi = useJiraApi()

  const guide = ref<JiraGuide | null>(null)
  const loading = ref(false)
  const error = ref('')

  const fetchAndCache = async () => {
    const fresh = await jiraApi.getConnectionGuide()
    guide.value = fresh
    writeCache(fresh)
    return fresh
  }

  const handleLoadGuide = async () => {
    error.value = ''

    // Show cached content instantly for a snappy modal.
    const cached = readCache()
    if (cached) {
      guide.value = cached
    }

    loading.value = !cached

    try {
      // Cheap list call to check the published version; refetch full guide only if changed.
      const list = await jiraApi.listGuides()
      const meta = list.find((item) => item.slug === CONNECTION_GUIDE_SLUG)

      if (!meta) {
        if (!cached) {
          error.value = 'Инструкция не найдена'
        }
        return
      }

      if (!cached || cached.version !== meta.version) {
        await fetchAndCache()
      }
    } catch (err) {
      if (cached) {
        // Keep showing the cached guide on background-refresh failure.
        return
      }

      if (isApiRequestError(err) && (err.status === 404 || err.body.code === 'NOT_FOUND')) {
        error.value = 'Инструкция не найдена'
        return
      }

      applyApiError(
        err,
        (message) => {
          error.value = message
        },
        () => undefined,
        'Не удалось загрузить инструкцию',
      )
    } finally {
      loading.value = false
    }
  }

  return {
    guide,
    loading,
    error,
    handleLoadGuide,
  }
}
