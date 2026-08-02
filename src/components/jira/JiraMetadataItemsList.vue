<template>
  <section class="jira-metadata-section" :aria-label="title">
    <h3 class="jira-metadata-section__title">{{ title }}</h3>
    <p v-if="items.length === 0" class="jira-metadata-section__empty">Нет данных</p>
    <div v-else class="jira-metadata-section__chips">
      <v-chip v-for="item in items" :key="item.jira_id" size="small" variant="outlined">
        {{ item.name }}
      </v-chip>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { JiraMetadataItem } from '@/types'

defineProps<{
  title: string
  items: JiraMetadataItem[]
}>()
</script>

<style scoped>
.jira-metadata-section {
  padding: 16px;
  border: 1px solid #e7e5e4;
  border-radius: 12px;
  background: #ffffff;
}

.jira-metadata-section__title {
  margin: 0 0 12px;
  font-size: 1rem;
  font-weight: 700;
  color: #1c1917;
}

.jira-metadata-section__empty {
  margin: 0;
  font-size: 0.875rem;
  color: #78716c;
}

.jira-metadata-section__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
