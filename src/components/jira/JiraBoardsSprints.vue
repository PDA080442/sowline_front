<template>
  <section class="jira-boards-sprints" aria-label="Доски и спринты">
    <h3 class="jira-boards-sprints__title">Доски и спринты</h3>
    <p v-if="boards.length === 0" class="jira-boards-sprints__empty">Нет данных</p>
    <div v-else class="jira-boards-sprints__list">
      <article
        v-for="board in boards"
        :key="board.jira_board_id"
        class="jira-boards-sprints__board"
      >
        <header class="jira-boards-sprints__board-header">
          <strong>{{ board.name }}</strong>
          <v-chip size="x-small" variant="tonal">{{ board.board_type }}</v-chip>
        </header>
        <ul v-if="board.sprints.length > 0" class="jira-boards-sprints__sprints">
          <li v-for="sprint in board.sprints" :key="sprint.jira_sprint_id">
            <span>{{ sprint.name }}</span>
            <v-chip size="x-small" :color="sprintStateColor(sprint.state)" variant="tonal">
              {{ sprint.state }}
            </v-chip>
            <span v-if="sprint.start_date" class="jira-boards-sprints__dates">
              {{ formatJiraDateTime(sprint.start_date) }} —
              {{ formatJiraDateTime(sprint.end_date) }}
            </span>
          </li>
        </ul>
        <p v-else class="jira-boards-sprints__empty-sprints">Спринтов нет</p>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { formatJiraDateTime } from '@/models/jira'
import type { JiraBoard } from '@/types'

defineProps<{
  boards: JiraBoard[]
}>()

const sprintStateColor = (state: string) => {
  if (state === 'active') {
    return 'success'
  }

  if (state === 'future') {
    return 'info'
  }

  return 'grey'
}
</script>

<style scoped>
.jira-boards-sprints {
  padding: 16px;
  border: 1px solid #e7e5e4;
  border-radius: 12px;
  grid-column: 1 / -1;
}

.jira-boards-sprints__title {
  margin: 0 0 12px;
  font-size: 1rem;
  font-weight: 700;
}

.jira-boards-sprints__empty,
.jira-boards-sprints__empty-sprints {
  margin: 0;
  font-size: 0.875rem;
  color: #78716c;
}

.jira-boards-sprints__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.jira-boards-sprints__board {
  padding: 12px;
  border: 1px solid #f5f5f4;
  border-radius: 8px;
}

.jira-boards-sprints__board-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.jira-boards-sprints__sprints {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.jira-boards-sprints__sprints li {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
}

.jira-boards-sprints__dates {
  color: #78716c;
  font-size: 0.8125rem;
}
</style>
