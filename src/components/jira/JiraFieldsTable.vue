<template>
  <section class="jira-fields-table" aria-label="Поля проекта">
    <h3 class="jira-fields-table__title">Поля ({{ items.length }})</h3>
    <div class="table-scroll">
      <v-table v-if="items.length > 0" density="compact">
        <thead>
          <tr>
            <th scope="col">Key</th>
            <th scope="col">Название</th>
            <th scope="col">Тип</th>
            <th scope="col">Обязательное</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="field in items" :key="field.jira_id">
            <td>
              <code>{{ field.key }}</code>
            </td>
            <td>{{ field.name }}</td>
            <td>{{ getTemplateFieldTypeLabel(field.template_field_type) }}</td>
            <td>
              <v-icon
                :icon="field.is_required ? 'mdi-check' : 'mdi-minus'"
                :color="field.is_required ? 'success' : 'grey'"
                size="18"
                :aria-label="field.is_required ? 'Обязательное' : 'Необязательное'"
              />
            </td>
          </tr>
        </tbody>
      </v-table>
      <p v-else class="jira-fields-table__empty">Нет данных</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { getTemplateFieldTypeLabel } from '@/models/jira'
import type { JiraField } from '@/types'

defineProps<{
  items: JiraField[]
}>()
</script>

<style scoped>
.jira-fields-table {
  padding: 16px;
  border: 1px solid #e7e5e4;
  border-radius: 12px;
  grid-column: 1 / -1;
}

.jira-fields-table__title {
  margin: 0 0 12px;
  font-size: 1rem;
  font-weight: 700;
}

.jira-fields-table__empty {
  margin: 0;
  font-size: 0.875rem;
  color: #78716c;
}

@media (max-width: 600px) {
  .jira-fields-table :deep(table) {
    min-width: 520px;
  }
}
</style>
