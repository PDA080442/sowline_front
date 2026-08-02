<template>
  <AppLayout>
    <div class="jira-connection-detail-page">
      <v-btn
        variant="text"
        class="text-none pa-0 mb-4"
        prepend-icon="mdi-arrow-left"
        :to="'/workspace/jira'"
      >
        К списку подключений
      </v-btn>

      <div v-if="loading && !connection" aria-busy="true">
        <JiraConnectionsSkeleton />
      </div>

      <PageErrorState
        v-else-if="error && !connection"
        :description="error"
        :loading="loading"
        @retry="loadConnection"
      />

      <template v-else-if="connection">
        <div class="jira-connection-detail-page__header">
          <div>
            <h1 class="jira-connection-detail-page__title">{{ connection.name }}</h1>
            <div class="jira-connection-detail-page__meta">
              <JiraConnectionStatusBadge
                :is-active="connection.is_active"
                :last-test-status="connection.last_test_status"
              />
              <v-chip size="small" variant="outlined">{{ connection.project_key }}</v-chip>
            </div>
          </div>

          <div v-if="isWorkspaceAdmin" class="jira-connection-detail-page__actions">
            <v-btn
              variant="outlined"
              class="text-none"
              prepend-icon="mdi-pencil-outline"
              @click="formDialogOpen = true"
            >
              Редактировать
            </v-btn>
            <v-btn
              variant="outlined"
              class="text-none"
              prepend-icon="mdi-connection"
              :loading="actionLoading[`test-${connection.id}`]"
              @click="handleTestConnection(connection.id)"
            >
              Проверить
            </v-btn>
            <v-btn
              v-if="connection.is_active"
              variant="outlined"
              color="warning"
              class="text-none"
              prepend-icon="mdi-link-off"
              @click="deactivateDialogOpen = true"
            >
              Деактивировать
            </v-btn>
          </div>
        </div>

        <dl class="jira-connection-detail-page__info">
          <div>
            <dt>Base URL</dt>
            <dd>{{ connection.base_url }}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{{ connection.email }}</dd>
          </div>
          <div>
            <dt>Board ID</dt>
            <dd>{{ connection.board_id || '—' }}</dd>
          </div>
          <div>
            <dt>API-токен</dt>
            <dd>
              <v-icon
                :icon="connection.has_api_token ? 'mdi-shield-check' : 'mdi-shield-off-outline'"
                :color="connection.has_api_token ? 'success' : 'grey'"
                size="18"
                class="mr-1"
              />
              {{ connection.has_api_token ? 'Сохранён' : 'Не задан' }}
            </dd>
          </div>
          <div>
            <dt>Последняя проверка</dt>
            <dd>{{ formatJiraDateTime(connection.last_test_at) }}</dd>
          </div>
          <div v-if="connection.last_test_error">
            <dt>Ошибка проверки</dt>
            <dd class="jira-connection-detail-page__error">{{ connection.last_test_error }}</dd>
          </div>
        </dl>

        <JiraMetadataPanel
          :metadata="metadata"
          :loading="metadataLoading"
          :syncing="syncing"
          :error="metadataError"
          :status="status"
          :can-manage="isWorkspaceAdmin"
          @sync="handleSync"
          @retry="loadMetadata"
        />
      </template>

      <JiraConnectionFormDialog
        v-model="formDialogOpen"
        :connection="connection"
        :loading="formLoading"
        :field-errors="fieldErrors"
        @submit="handleFormSubmit"
      />

      <DeactivateConnectionDialog
        v-model="deactivateDialogOpen"
        :connection-name="connection?.name"
        :loading="deactivateLoading"
        @confirm="handleDeactivateConfirm"
      />
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import PageErrorState from '@/components/common/PageErrorState.vue'
import DeactivateConnectionDialog from '@/components/jira/DeactivateConnectionDialog.vue'
import JiraConnectionFormDialog from '@/components/jira/JiraConnectionFormDialog.vue'
import JiraConnectionStatusBadge from '@/components/jira/JiraConnectionStatusBadge.vue'
import JiraConnectionsSkeleton from '@/components/jira/JiraConnectionsSkeleton.vue'
import JiraMetadataPanel from '@/components/jira/JiraMetadataPanel.vue'
import { useJiraConnections } from '@/composables/useJiraConnections'
import { useJiraMetadata } from '@/composables/useJiraMetadata'
import { useWorkspace } from '@/composables/useWorkspace'
import AppLayout from '@/layouts/AppLayout.vue'
import { formatJiraDateTime, type JiraConnectionFormValues } from '@/models/jira'
import { useWorkspaceStore } from '@/stores/workspace'

const route = useRoute()
const router = useRouter()
const workspaceStore = useWorkspaceStore()
const { handleFetchWorkspaces } = useWorkspace()

const {
  connection,
  loading,
  error,
  fieldErrors,
  actionLoading,
  handleFetchConnection,
  handleUpdateConnection,
  handleDeactivateConnection,
  handleTestConnection,
} = useJiraConnections()

const {
  metadata,
  loading: metadataLoading,
  syncing,
  error: metadataError,
  status,
  handleFetchMetadata,
  handleSyncMetadata,
  resumePollIfSyncing,
  stopPolling,
} = useJiraMetadata()

const formDialogOpen = ref(false)
const formLoading = ref(false)
const deactivateDialogOpen = ref(false)
const deactivateLoading = ref(false)

const connectionId = computed(() => String(route.params.connectionId ?? ''))
const isWorkspaceAdmin = computed(() => workspaceStore.isWorkspaceAdmin)

const loadConnection = async () => {
  await handleFetchConnection(connectionId.value)
}

const loadMetadata = async () => {
  await handleFetchMetadata(connectionId.value)
  await resumePollIfSyncing(connectionId.value)
}

const handleSync = async () => {
  await handleSyncMetadata(connectionId.value)
}

const handleFormSubmit = async (values: JiraConnectionFormValues) => {
  if (!connection.value) {
    return
  }

  formLoading.value = true

  try {
    const updated = await handleUpdateConnection(connection.value.id, values)

    if (updated) {
      formDialogOpen.value = false
    }
  } finally {
    formLoading.value = false
  }
}

const handleDeactivateConfirm = async () => {
  if (!connection.value) {
    return
  }

  deactivateLoading.value = true

  try {
    const result = await handleDeactivateConnection(connection.value.id)

    if (result) {
      deactivateDialogOpen.value = false
      router.push('/workspace/jira')
    }
  } finally {
    deactivateLoading.value = false
  }
}

watch(connectionId, async () => {
  stopPolling()
  await loadConnection()
  await loadMetadata()
})

onMounted(async () => {
  if (workspaceStore.workspaces.length === 0) {
    await handleFetchWorkspaces()
  }

  await workspaceStore.resolveCurrentRole()
  await loadConnection()
  await loadMetadata()
})

onUnmounted(() => {
  stopPolling()
})
</script>

<style scoped>
.jira-connection-detail-page__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.jira-connection-detail-page__title {
  margin: 0 0 8px;
  font-size: 1.75rem;
  font-weight: 700;
  color: #1c1917;
}

.jira-connection-detail-page__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.jira-connection-detail-page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.jira-connection-detail-page__info {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin: 0 0 8px;
  padding: 20px;
  border: 1px solid #e7e5e4;
  border-radius: 12px;
  background: #fafaf9;
}

.jira-connection-detail-page__info dt {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #78716c;
}

.jira-connection-detail-page__info dd {
  margin: 4px 0 0;
  font-size: 0.9375rem;
  color: #1c1917;
}

.jira-connection-detail-page__error {
  color: #b91c1c;
}

@media (max-width: 768px) {
  .jira-connection-detail-page__header {
    flex-direction: column;
    align-items: stretch;
  }

  .jira-connection-detail-page__actions {
    flex-direction: column;
  }

  .jira-connection-detail-page__actions .v-btn {
    width: 100%;
  }

  .jira-connection-detail-page__info {
    grid-template-columns: 1fr;
  }

  .jira-connection-detail-page__title {
    font-size: 1.375rem;
  }
}
</style>
