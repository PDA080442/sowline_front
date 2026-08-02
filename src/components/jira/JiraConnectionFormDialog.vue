<template>
  <v-dialog
    :model-value="modelValue"
    max-width="720"
    scrollable
    class="workspace-dialog"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card rounded="xl" class="jira-connection-form-dialog">
      <v-btn
        icon="mdi-close"
        aria-label="Закрыть"
        variant="text"
        size="small"
        class="jira-connection-form-dialog__close"
        @click="handleClose"
      />

      <v-card-text class="pa-8">
        <h2 class="jira-connection-form-dialog__title">
          {{ isEdit ? 'Редактирование подключения' : 'Новое Jira-подключение' }}
        </h2>
        <p class="jira-connection-form-dialog__subtitle">
          Укажите данные Jira Cloud. API-токен хранится на сервере в зашифрованном виде и не
          отображается после сохранения.
        </p>

        <v-form class="mt-6" @submit.prevent="handleSubmit">
          <div class="jira-connection-form-dialog__field">
            <label class="jira-connection-form-dialog__label">
              Название <span class="jira-connection-form-dialog__required">*</span>
            </label>
            <v-text-field
              v-model="form.name"
              variant="outlined"
              hide-details="auto"
              :error-messages="fieldErrors.name"
              :disabled="loading"
            />
          </div>

          <div class="jira-connection-form-dialog__field">
            <label class="jira-connection-form-dialog__label">
              Base URL <span class="jira-connection-form-dialog__required">*</span>
            </label>
            <v-text-field
              v-model="form.base_url"
              placeholder="https://your-domain.atlassian.net"
              variant="outlined"
              hide-details="auto"
              :error-messages="fieldErrors.base_url"
              :disabled="loading"
            />
            <div class="jira-connection-form-dialog__hint">
              <v-icon icon="mdi-information-outline" size="14" color="grey" />
              HTTPS-адрес вашего Jira Cloud сайта.
            </div>
          </div>

          <div class="jira-connection-form-dialog__field">
            <label class="jira-connection-form-dialog__label">
              Email <span class="jira-connection-form-dialog__required">*</span>
            </label>
            <v-text-field
              v-model="form.email"
              type="email"
              variant="outlined"
              hide-details="auto"
              :error-messages="fieldErrors.email"
              :disabled="loading"
            />
          </div>

          <div class="jira-connection-form-dialog__field">
            <label class="jira-connection-form-dialog__label">
              API-токен
              <span v-if="!isEdit" class="jira-connection-form-dialog__required">*</span>
            </label>
            <v-text-field
              v-model="form.api_token"
              type="password"
              :placeholder="isEdit && hasApiToken ? 'Оставьте пустым, чтобы не менять' : ''"
              variant="outlined"
              hide-details="auto"
              :error-messages="fieldErrors.api_token"
              :disabled="loading"
            />
            <div v-if="isEdit && hasApiToken" class="jira-connection-form-dialog__hint">
              <v-icon icon="mdi-shield-check-outline" size="14" color="success" />
              Токен сохранён на сервере. Введите новый только для ротации.
            </div>
          </div>

          <div class="jira-connection-form-dialog__field">
            <label class="jira-connection-form-dialog__label">
              Project key <span class="jira-connection-form-dialog__required">*</span>
            </label>
            <v-text-field
              v-model="form.project_key"
              placeholder="PROJ"
              variant="outlined"
              hide-details="auto"
              :error-messages="fieldErrors.project_key"
              :disabled="loading"
              @update:model-value="form.project_key = form.project_key.toUpperCase()"
            />
            <div class="jira-connection-form-dialog__hint">
              <v-icon icon="mdi-information-outline" size="14" color="grey" />
              Заглавные буквы, цифры и подчёркивание (например PROJ).
            </div>
          </div>

          <div class="jira-connection-form-dialog__field">
            <label class="jira-connection-form-dialog__label">Board ID (необязательно)</label>
            <v-text-field
              v-model="form.board_id"
              variant="outlined"
              hide-details="auto"
              :disabled="loading"
            />
          </div>

          <div class="jira-connection-form-dialog__actions">
            <v-btn variant="outlined" class="text-none" :disabled="loading" @click="handleClose">
              Отмена
            </v-btn>
            <v-btn type="submit" color="primary" class="text-none" :loading="loading">
              {{ isEdit ? 'Сохранить' : 'Создать' }}
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'

import type { JiraConnectionFormValues } from '@/models/jira'
import type { JiraConnection } from '@/types'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    connection?: JiraConnection | null
    loading?: boolean
    fieldErrors?: Record<string, string>
  }>(),
  {
    connection: null,
    loading: false,
    fieldErrors: () => ({}),
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [values: JiraConnectionFormValues]
}>()

const emptyForm = (): JiraConnectionFormValues => ({
  name: '',
  base_url: '',
  email: '',
  api_token: '',
  project_key: '',
  board_id: '',
})

const form = reactive(emptyForm())

const isEdit = computed(() => Boolean(props.connection))
const hasApiToken = computed(() => props.connection?.has_api_token ?? false)

const fillForm = (connection: JiraConnection | null | undefined) => {
  if (!connection) {
    Object.assign(form, emptyForm())
    return
  }

  form.name = connection.name
  form.base_url = connection.base_url
  form.email = connection.email
  form.api_token = ''
  form.project_key = connection.project_key
  form.board_id = connection.board_id
}

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleSubmit = () => {
  emit('submit', { ...form })
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      fillForm(props.connection)
    }
  },
)

watch(
  () => props.connection,
  (connection) => {
    if (props.modelValue) {
      fillForm(connection)
    }
  },
)
</script>

<style scoped>
.jira-connection-form-dialog {
  position: relative;
}

.jira-connection-form-dialog__close {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
}

.jira-connection-form-dialog__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1c1917;
}

.jira-connection-form-dialog__subtitle {
  margin-top: 8px;
  font-size: 0.9375rem;
  color: #78716c;
  line-height: 1.5;
}

.jira-connection-form-dialog__field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.jira-connection-form-dialog__label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1c1917;
}

.jira-connection-form-dialog__required {
  color: #b91c1c;
}

.jira-connection-form-dialog__hint {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 0.8125rem;
  color: #78716c;
}

.jira-connection-form-dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 8px;
}

@media (max-width: 480px) {
  .jira-connection-form-dialog__actions {
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .jira-connection-form-dialog__actions :deep(.v-btn) {
    width: 100%;
  }
}
</style>
