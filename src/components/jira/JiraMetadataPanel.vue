<template>
  <section class="jira-metadata-panel" aria-label="Метаданные Jira-проекта">
    <div class="jira-metadata-panel__header">
      <div>
        <h2 class="jira-metadata-panel__title">Метаданные проекта</h2>
        <p v-if="metadata" class="jira-metadata-panel__subtitle">
          {{ metadata.project_name }} ({{ metadata.project_key }})
        </p>
      </div>
      <v-btn
        v-if="canManage"
        color="primary"
        class="text-none"
        prepend-icon="mdi-sync"
        :loading="syncing"
        :disabled="syncing || status === 'syncing'"
        aria-label="Обновить метаданные проекта"
        @click="emit('sync')"
      >
        Обновить метаданные
      </v-btn>
    </div>

    <JiraMetadataStatusBanner
      v-if="metadata"
      :status="metadata.status"
      :is-stale="metadata.is_stale"
      :last-error="metadata.last_error"
      :fetched-at="metadata.fetched_at"
    />

    <div v-if="loading" aria-busy="true">
      <JiraMetadataSkeleton />
    </div>

    <PageErrorState
      v-else-if="error"
      :description="error"
      :loading="loading"
      @retry="emit('retry')"
    />

    <template v-else-if="metadata">
      <div
        v-if="metadata.status === 'fresh' || metadata.status === 'failed'"
        class="jira-metadata-panel__grid"
        :aria-live="syncing ? 'polite' : undefined"
      >
        <JiraIssueTypesList :items="metadata.issue_types" />
        <JiraMetadataItemsList title="Приоритеты" :items="metadata.priorities" />
        <JiraMetadataItemsList title="Статусы" :items="metadata.statuses" />
        <JiraMetadataItemsList title="Компоненты" :items="metadata.components" />
        <JiraMetadataItemsList title="Метки" :items="metadata.labels" />
        <JiraFieldsTable :items="metadata.fields" />
        <JiraBoardsSprints :boards="metadata.boards" />
      </div>

      <AppEmptyState
        v-else-if="metadata.status === 'pending'"
        title="Метаданные не загружались"
        description="Запустите синхронизацию, чтобы загрузить типы задач, поля, доски и спринты из Jira."
        :action-label="canManage ? 'Обновить метаданные' : undefined"
        icon="mdi-database-sync-outline"
        @action="emit('sync')"
      />

      <div
        v-else-if="metadata.status === 'syncing'"
        class="jira-metadata-panel__syncing"
        role="status"
        aria-live="polite"
      >
        <v-progress-circular indeterminate color="primary" size="32" />
        <p>Синхронизация метаданных с Jira…</p>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import AppEmptyState from '@/components/common/AppEmptyState.vue'
import PageErrorState from '@/components/common/PageErrorState.vue'
import JiraBoardsSprints from '@/components/jira/JiraBoardsSprints.vue'
import JiraFieldsTable from '@/components/jira/JiraFieldsTable.vue'
import JiraIssueTypesList from '@/components/jira/JiraIssueTypesList.vue'
import JiraMetadataItemsList from '@/components/jira/JiraMetadataItemsList.vue'
import JiraMetadataSkeleton from '@/components/jira/JiraMetadataSkeleton.vue'
import JiraMetadataStatusBanner from '@/components/jira/JiraMetadataStatusBanner.vue'
import type { JiraProjectMetadata, JiraSyncStatus } from '@/types'

defineProps<{
  metadata: JiraProjectMetadata | null
  loading: boolean
  syncing: boolean
  error: string
  status: JiraSyncStatus | string
  canManage: boolean
}>()

const emit = defineEmits<{
  sync: []
  retry: []
}>()
</script>

<style scoped>
.jira-metadata-panel {
  margin-top: 32px;
}

.jira-metadata-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.jira-metadata-panel__title {
  margin: 0;
  font-size: 1.375rem;
  font-weight: 700;
  color: #1c1917;
}

.jira-metadata-panel__subtitle {
  margin: 4px 0 0;
  font-size: 0.9375rem;
  color: #78716c;
}

.jira-metadata-panel__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.jira-metadata-panel__syncing {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 24px;
  text-align: center;
  color: #57534e;
}

@media (max-width: 768px) {
  .jira-metadata-panel__grid {
    grid-template-columns: 1fr;
  }

  .jira-metadata-panel__header {
    flex-direction: column;
    align-items: stretch;
  }

  .jira-metadata-panel__header .v-btn {
    width: 100%;
  }
}
</style>
