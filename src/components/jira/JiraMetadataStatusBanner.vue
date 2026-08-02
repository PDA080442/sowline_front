<template>
  <v-alert
    v-if="showBanner"
    :type="alertType"
    variant="tonal"
    :icon="syncMeta.icon"
    class="jira-metadata-status-banner"
    role="status"
    aria-live="polite"
  >
    <div class="jira-metadata-status-banner__content">
      <div>
        <strong>{{ syncMeta.label }}</strong>
        <span v-if="description" class="jira-metadata-status-banner__detail">{{
          description
        }}</span>
      </div>
      <div v-if="fetchedAt" class="jira-metadata-status-banner__time">
        Обновлено: {{ fetchedAt }}
      </div>
    </div>
  </v-alert>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { formatJiraDateTime, getSyncStatusMeta, isMetadataStale } from '@/models/jira'
import type { JiraSyncStatus } from '@/types'

const props = defineProps<{
  status: JiraSyncStatus | string
  isStale: boolean
  lastError?: string
  fetchedAt?: string | null
}>()

const syncMeta = computed(() => getSyncStatusMeta(props.status))

const showBanner = computed(
  () =>
    props.status === 'pending' ||
    props.status === 'syncing' ||
    props.status === 'failed' ||
    isMetadataStale(props.isStale, props.status),
)

const alertType = computed(() => {
  if (props.status === 'failed') {
    return 'error'
  }

  if (isMetadataStale(props.isStale, props.status)) {
    return 'warning'
  }

  if (props.status === 'syncing') {
    return 'info'
  }

  return 'info'
})

const description = computed(() => {
  if (props.status === 'failed') {
    return props.lastError || syncMeta.value.description
  }

  if (isMetadataStale(props.isStale, props.status)) {
    return 'Кэш метаданных устарел. Рекомендуется обновить данные.'
  }

  if (props.status === 'pending') {
    return syncMeta.value.description
  }

  if (props.status === 'syncing') {
    return syncMeta.value.description
  }

  return ''
})

const fetchedAt = computed(() => formatJiraDateTime(props.fetchedAt))
</script>

<style scoped>
.jira-metadata-status-banner__content {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
}

.jira-metadata-status-banner__detail {
  display: block;
  margin-top: 4px;
  font-weight: 400;
}

.jira-metadata-status-banner__time {
  font-size: 0.8125rem;
  opacity: 0.85;
  white-space: nowrap;
}
</style>
