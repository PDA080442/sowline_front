<template>
  <AppLayout>
    <div class="jira-connections-page">
      <div class="jira-connections-page__header">
        <div>
          <h1 class="jira-connections-page__title">Jira-подключения</h1>
          <p class="jira-connections-page__subtitle">
            Управление подключениями к Jira Cloud и метаданными проектов workspace
            <strong v-if="workspaceName">{{ workspaceName }}</strong
            >.
          </p>
        </div>
        <div class="jira-connections-page__header-actions">
          <v-btn
            variant="tonal"
            color="primary"
            class="text-none jira-connections-page__guide-btn"
            prepend-icon="mdi-book-open-page-variant"
            @click="openGuide"
          >
            Как подключить Jira
          </v-btn>
          <v-btn
            v-if="isWorkspaceAdmin"
            color="primary"
            class="text-none"
            prepend-icon="mdi-plus"
            @click="openCreateDialog"
          >
            Создать подключение
          </v-btn>
        </div>
      </div>

      <div v-if="loading" aria-busy="true">
        <JiraConnectionsSkeleton />
      </div>

      <PageErrorState
        v-else-if="error"
        :description="error"
        :loading="loading"
        @retry="handleFetchConnections"
      />

      <AppEmptyState
        v-else-if="connections.length === 0"
        title="Нет Jira-подключений"
        description="Создайте первое подключение к Jira Cloud для импорта данных."
        :action-label="isWorkspaceAdmin ? 'Создать подключение' : undefined"
        icon="mdi-jira"
        @action="openCreateDialog"
      />

      <JiraConnectionsTable
        v-else
        :connections="connections"
        :can-manage="isWorkspaceAdmin"
        :action-loading="actionLoading"
        @open="handleOpen"
        @edit="handleEdit"
        @test="handleTest"
        @deactivate="handleDeactivateRequest"
      />

      <JiraConnectionFormDialog
        v-model="formDialogOpen"
        :connection="editingConnection"
        :loading="formLoading"
        :field-errors="fieldErrors"
        @submit="handleFormSubmit"
      />

      <DeactivateConnectionDialog
        v-model="deactivateDialogOpen"
        :connection-name="deactivatingConnection?.name"
        :loading="deactivateLoading"
        @confirm="handleDeactivateConfirm"
      />

      <JiraGuideDialog
        v-model="guideDialogOpen"
        :guide="guide"
        :loading="guideLoading"
        :error="guideError"
        @retry="handleLoadGuide"
      />
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppEmptyState from '@/components/common/AppEmptyState.vue'
import PageErrorState from '@/components/common/PageErrorState.vue'
import DeactivateConnectionDialog from '@/components/jira/DeactivateConnectionDialog.vue'
import JiraConnectionFormDialog from '@/components/jira/JiraConnectionFormDialog.vue'
import JiraConnectionsSkeleton from '@/components/jira/JiraConnectionsSkeleton.vue'
import JiraConnectionsTable from '@/components/jira/JiraConnectionsTable.vue'
import JiraGuideDialog from '@/components/jira/JiraGuideDialog.vue'
import { useJiraConnections } from '@/composables/useJiraConnections'
import { useJiraGuide } from '@/composables/useJiraGuide'
import { useWorkspace } from '@/composables/useWorkspace'
import AppLayout from '@/layouts/AppLayout.vue'
import type { JiraConnectionFormValues } from '@/models/jira'
import { useWorkspaceStore } from '@/stores/workspace'
import type { JiraConnection } from '@/types'

const router = useRouter()
const workspaceStore = useWorkspaceStore()
const { handleFetchWorkspaces } = useWorkspace()
const {
  connections,
  loading,
  error,
  fieldErrors,
  actionLoading,
  handleFetchConnections,
  handleCreateConnection,
  handleUpdateConnection,
  handleDeactivateConnection,
  handleTestConnection,
} = useJiraConnections()

const { guide, loading: guideLoading, error: guideError, handleLoadGuide } = useJiraGuide()

const formDialogOpen = ref(false)
const guideDialogOpen = ref(false)
const editingConnection = ref<JiraConnection | null>(null)
const formLoading = ref(false)
const deactivateDialogOpen = ref(false)
const deactivatingConnection = ref<JiraConnection | null>(null)
const deactivateLoading = ref(false)

const isWorkspaceAdmin = computed(() => workspaceStore.isWorkspaceAdmin)
const workspaceName = computed(() => workspaceStore.selectedWorkspace?.name)

const openCreateDialog = () => {
  editingConnection.value = null
  formDialogOpen.value = true
}

const openGuide = () => {
  guideDialogOpen.value = true
  handleLoadGuide()
}

const handleOpen = (connectionId: string) => {
  router.push(`/workspace/jira/${connectionId}`)
}

const handleEdit = (connection: JiraConnection) => {
  editingConnection.value = connection
  formDialogOpen.value = true
}

const handleTest = async (connectionId: string) => {
  await handleTestConnection(connectionId)
}

const handleDeactivateRequest = (connection: JiraConnection) => {
  deactivatingConnection.value = connection
  deactivateDialogOpen.value = true
}

const handleDeactivateConfirm = async () => {
  if (!deactivatingConnection.value) {
    return
  }

  deactivateLoading.value = true

  try {
    const result = await handleDeactivateConnection(deactivatingConnection.value.id)

    if (result) {
      deactivateDialogOpen.value = false
      deactivatingConnection.value = null
    }
  } finally {
    deactivateLoading.value = false
  }
}

const handleFormSubmit = async (values: JiraConnectionFormValues) => {
  formLoading.value = true

  try {
    if (editingConnection.value) {
      const updated = await handleUpdateConnection(editingConnection.value.id, values)

      if (updated) {
        formDialogOpen.value = false
        editingConnection.value = null
      }
    } else {
      const created = await handleCreateConnection(values)

      if (created) {
        formDialogOpen.value = false
        router.push(`/workspace/jira/${created.id}`)
      }
    }
  } finally {
    formLoading.value = false
  }
}

onMounted(async () => {
  if (workspaceStore.workspaces.length === 0) {
    await handleFetchWorkspaces()
  }

  await workspaceStore.resolveCurrentRole()
  await handleFetchConnections()
})
</script>

<style scoped>
.jira-connections-page__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.jira-connections-page__title {
  margin: 0 0 8px;
  font-size: 1.75rem;
  font-weight: 700;
  color: #1c1917;
}

.jira-connections-page__subtitle {
  margin: 0;
  font-size: 0.9375rem;
  color: #78716c;
  line-height: 1.5;
}

.jira-connections-page__header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  flex-shrink: 0;
}

@media (max-width: 600px) {
  .jira-connections-page__header {
    flex-direction: column;
    align-items: stretch;
  }

  .jira-connections-page__header-actions {
    flex-direction: column;
  }

  .jira-connections-page__header-actions .v-btn {
    width: 100%;
  }

  .jira-connections-page__title {
    font-size: 1.375rem;
  }
}
</style>
