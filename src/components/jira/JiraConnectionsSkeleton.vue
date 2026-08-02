<template>
  <div class="jira-connections-skeleton" aria-busy="true" aria-label="Загрузка подключений Jira">
    <div v-for="index in 3" :key="index" class="jira-connections-skeleton__row">
      <v-skeleton-loader type="text" width="40%" />
      <v-skeleton-loader type="text" width="20%" />
      <v-skeleton-loader type="chip" width="80" />
      <v-skeleton-loader type="chip" width="100" />
    </div>
  </div>
</template>

<style scoped>
.jira-connections-skeleton {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.jira-connections-skeleton__row {
  display: grid;
  grid-template-columns: 2fr 1fr auto auto;
  gap: 16px;
  align-items: center;
  padding: 16px;
  border: 1px solid #e7e5e4;
  border-radius: 12px;
}

@media (max-width: 600px) {
  .jira-connections-skeleton__row {
    grid-template-columns: 1fr;
  }
}
</style>
