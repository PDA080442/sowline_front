<template>
  <v-dialog
    :model-value="modelValue"
    max-width="520"
    scrollable
    class="workspace-dialog"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card rounded="xl" class="deactivate-connection-dialog">
      <v-btn
        icon="mdi-close"
        aria-label="Закрыть"
        variant="text"
        size="small"
        class="deactivate-connection-dialog__close"
        @click="emit('update:modelValue', false)"
      />

      <v-card-text class="text-center pa-8 pt-10">
        <div class="deactivate-connection-dialog__icon-wrap">
          <v-icon icon="mdi-link-off" size="28" color="warning" />
        </div>

        <h2 class="deactivate-connection-dialog__title">Деактивировать подключение?</h2>
        <p class="deactivate-connection-dialog__text">
          Подключение
          <strong v-if="connectionName">{{ connectionName }}</strong>
          будет деактивировано. Синхронизация метаданных станет недоступна до реактивации.
        </p>
      </v-card-text>

      <v-card-actions class="pa-6 pt-0 justify-center ga-3">
        <v-btn variant="outlined" class="text-none" @click="emit('update:modelValue', false)">
          Отмена
        </v-btn>
        <v-btn color="warning" class="text-none" :loading="loading" @click="emit('confirm')">
          Деактивировать
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
  connectionName?: string
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
}>()
</script>

<style scoped>
.deactivate-connection-dialog {
  position: relative;
}

.deactivate-connection-dialog__close {
  position: absolute;
  top: 12px;
  right: 12px;
}

.deactivate-connection-dialog__icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin-bottom: 16px;
  border-radius: 50%;
  background: #fef3c7;
}

.deactivate-connection-dialog__title {
  margin-bottom: 8px;
  font-size: 1.125rem;
  font-weight: 700;
  color: #1c1917;
}

.deactivate-connection-dialog__text {
  font-size: 0.9375rem;
  color: #57534e;
  line-height: 1.5;
}
</style>
