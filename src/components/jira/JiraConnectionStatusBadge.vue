<template>
  <div class="jira-connection-status">
    <v-chip
      v-if="!isActive"
      size="small"
      color="grey"
      variant="tonal"
      prepend-icon="mdi-pause-circle-outline"
    >
      Неактивно
    </v-chip>
    <v-chip
      v-else
      size="small"
      :color="testMeta.color"
      variant="tonal"
      :prepend-icon="testMeta.icon"
    >
      {{ testMeta.label }}
    </v-chip>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { getTestStatusMeta } from '@/models/jira'

const props = defineProps<{
  isActive: boolean
  lastTestStatus: string
}>()

const testMeta = computed(() => getTestStatusMeta(props.lastTestStatus))
</script>
