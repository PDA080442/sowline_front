<template>
  <section class="jira-issue-types" aria-label="Типы задач">
    <h3 class="jira-issue-types__title">Типы задач</h3>
    <p v-if="items.length === 0" class="jira-issue-types__empty">Нет данных</p>
    <ul v-else class="jira-issue-types__list">
      <li v-for="item in items" :key="item.jira_id" class="jira-issue-types__item">
        <img
          v-if="item.icon_url"
          :src="item.icon_url"
          :alt="item.name"
          class="jira-issue-types__icon"
          width="20"
          height="20"
        />
        <v-icon v-else icon="mdi-checkbox-marked-circle-outline" size="20" color="grey" />
        <div>
          <div class="jira-issue-types__name">{{ item.name }}</div>
          <div v-if="item.description" class="jira-issue-types__desc">{{ item.description }}</div>
        </div>
        <v-chip v-if="item.is_subtask" size="x-small" variant="tonal">Sub-task</v-chip>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import type { JiraIssueType } from '@/types'

defineProps<{
  items: JiraIssueType[]
}>()
</script>

<style scoped>
.jira-issue-types {
  padding: 16px;
  border: 1px solid #e7e5e4;
  border-radius: 12px;
}

.jira-issue-types__title {
  margin: 0 0 12px;
  font-size: 1rem;
  font-weight: 700;
}

.jira-issue-types__empty {
  margin: 0;
  font-size: 0.875rem;
  color: #78716c;
}

.jira-issue-types__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.jira-issue-types__item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.jira-issue-types__icon {
  flex-shrink: 0;
}

.jira-issue-types__name {
  font-weight: 600;
  font-size: 0.9375rem;
}

.jira-issue-types__desc {
  font-size: 0.8125rem;
  color: #78716c;
}
</style>
