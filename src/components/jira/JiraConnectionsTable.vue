<template>
  <div class="table-scroll">
    <v-table class="jira-connections-table" aria-label="Jira-подключения">
      <thead>
        <tr>
          <th scope="col">Название</th>
          <th scope="col">Проект</th>
          <th scope="col">Статус</th>
          <th scope="col">Последняя проверка</th>
          <th v-if="canManage" scope="col" class="text-right">Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in connections"
          :key="item.id"
          tabindex="0"
          role="link"
          class="jira-connections-table__row"
          :aria-label="`Открыть подключение ${item.name}`"
          @click="emit('open', item.id)"
          @keydown.enter="emit('open', item.id)"
          @keydown.space.prevent="emit('open', item.id)"
        >
          <td>
            <div class="jira-connections-table__name">{{ item.name }}</div>
            <div class="jira-connections-table__url">{{ item.base_url }}</div>
          </td>
          <td>
            <v-chip size="small" variant="outlined">{{ item.project_key }}</v-chip>
          </td>
          <td>
            <JiraConnectionStatusBadge
              :is-active="item.is_active"
              :last-test-status="item.last_test_status"
            />
          </td>
          <td class="jira-connections-table__date">
            {{ formatJiraDateTime(item.last_test_at) }}
          </td>
          <td v-if="canManage" class="text-right" @click.stop>
            <v-menu>
              <template #activator="{ props: menuProps }">
                <v-btn
                  v-bind="menuProps"
                  icon="mdi-dots-horizontal"
                  variant="text"
                  size="small"
                  :aria-label="`Действия для ${item.name}`"
                />
              </template>
              <v-list density="compact" min-width="180" role="menu">
                <v-list-item
                  title="Редактировать"
                  prepend-icon="mdi-pencil-outline"
                  role="menuitem"
                  @click="emit('edit', item)"
                />
                <v-list-item
                  title="Проверить"
                  prepend-icon="mdi-connection"
                  role="menuitem"
                  :disabled="actionLoading[`test-${item.id}`]"
                  @click="emit('test', item.id)"
                />
                <v-list-item
                  v-if="item.is_active"
                  title="Деактивировать"
                  prepend-icon="mdi-link-off"
                  role="menuitem"
                  @click="emit('deactivate', item)"
                />
              </v-list>
            </v-menu>
          </td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>

<script setup lang="ts">
import JiraConnectionStatusBadge from '@/components/jira/JiraConnectionStatusBadge.vue'
import { formatJiraDateTime } from '@/models/jira'
import type { JiraConnection } from '@/types'

defineProps<{
  connections: JiraConnection[]
  canManage: boolean
  actionLoading: Record<string, boolean>
}>()

const emit = defineEmits<{
  open: [connectionId: string]
  edit: [connection: JiraConnection]
  test: [connectionId: string]
  deactivate: [connection: JiraConnection]
}>()
</script>

<style scoped>
.jira-connections-table {
  border: 1px solid #e7e5e4;
  border-radius: 12px;
  overflow: hidden;
  min-width: 720px;
}

.jira-connections-table__row {
  cursor: pointer;
}

.jira-connections-table__row:focus-visible {
  outline: 2px solid #16a34a;
  outline-offset: -2px;
}

.jira-connections-table :deep(th) {
  background: #fafaf9;
  font-size: 0.8125rem !important;
  font-weight: 600 !important;
  color: #78716c !important;
}

.jira-connections-table__name {
  font-weight: 600;
  color: #1c1917;
}

.jira-connections-table__url {
  font-size: 0.8125rem;
  color: #78716c;
}

.jira-connections-table__date {
  font-size: 0.875rem;
  color: #57534e;
}

@media (max-width: 600px) {
  .table-scroll {
    overflow-x: visible;
  }

  .jira-connections-table {
    min-width: 0;
    border: none;
    background: transparent;
  }

  .jira-connections-table :deep(thead) {
    display: none;
  }

  .jira-connections-table :deep(tbody tr) {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    margin-bottom: 12px;
    border: 1px solid #e7e5e4;
    border-radius: 12px;
    background: #ffffff;
  }

  .jira-connections-table :deep(tbody td) {
    display: block;
    width: 100%;
    padding: 0 !important;
    border: none !important;
  }

  .jira-connections-table :deep(tbody td.text-right) {
    text-align: left !important;
  }
}
</style>
