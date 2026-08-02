<template>
  <div class="jira-metadata-skeleton" aria-busy="true" aria-label="Загрузка метаданных Jira">
    <v-skeleton-loader type="heading" width="280" class="mb-4" />
    <v-skeleton-loader type="text@3" />
    <div class="jira-metadata-skeleton__sections">
      <v-skeleton-loader v-for="index in 4" :key="index" type="article" />
    </div>
  </div>
</template>

<style scoped>
.jira-metadata-skeleton__sections {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 24px;
}

@media (max-width: 768px) {
  .jira-metadata-skeleton__sections {
    grid-template-columns: 1fr;
  }
}
</style>
