import type { JiraConnectionTestStatus, JiraSyncStatus, TemplateFieldType } from '@/types'

export interface JiraTestStatusMeta {
  label: string
  color: 'grey' | 'success' | 'error' | 'warning'
  icon: string
}

export interface JiraSyncStatusMeta {
  label: string
  color: 'grey' | 'info' | 'success' | 'error' | 'warning'
  icon: string
  description: string
}

const TEST_STATUS_MAP: Record<JiraConnectionTestStatus, JiraTestStatusMeta> = {
  unknown: { label: 'Не проверялось', color: 'grey', icon: 'mdi-help-circle-outline' },
  success: { label: 'Успешно', color: 'success', icon: 'mdi-check-circle-outline' },
  failed: { label: 'Ошибка', color: 'error', icon: 'mdi-alert-circle-outline' },
}

const SYNC_STATUS_MAP: Record<JiraSyncStatus, JiraSyncStatusMeta> = {
  pending: {
    label: 'Не загружалось',
    color: 'grey',
    icon: 'mdi-database-off-outline',
    description: 'Метаданные проекта ещё не синхронизировались с Jira.',
  },
  syncing: {
    label: 'Синхронизация…',
    color: 'info',
    icon: 'mdi-sync',
    description: 'Идёт загрузка метаданных из Jira.',
  },
  fresh: {
    label: 'Актуально',
    color: 'success',
    icon: 'mdi-check-circle-outline',
    description: 'Кэш метаданных актуален.',
  },
  failed: {
    label: 'Ошибка',
    color: 'error',
    icon: 'mdi-alert-circle-outline',
    description: 'Не удалось загрузить метаданные.',
  },
}

const TEMPLATE_FIELD_TYPE_LABELS: Record<string, string> = {
  text: 'Текст',
  textarea: 'Многострочный текст',
  number: 'Число',
  date: 'Дата',
  datetime: 'Дата и время',
  user: 'Пользователь',
  select: 'Выбор',
  multiselect: 'Множественный выбор',
  cascading_select: 'Каскадный выбор',
  labels: 'Метки',
  multiselect_user: 'Пользователи',
  url: 'URL',
  readonly: 'Только чтение',
  project: 'Проект',
  group: 'Группа',
  version: 'Версия',
  multiselect_version: 'Версии',
  priority: 'Приоритет',
  status: 'Статус',
  issuetype: 'Тип задачи',
  timetracking: 'Учёт времени',
  custom: 'Custom',
}

export const getTestStatusMeta = (status: string): JiraTestStatusMeta =>
  TEST_STATUS_MAP[status as JiraConnectionTestStatus] ?? TEST_STATUS_MAP.unknown

export const getSyncStatusMeta = (status: string): JiraSyncStatusMeta =>
  SYNC_STATUS_MAP[status as JiraSyncStatus] ?? SYNC_STATUS_MAP.pending

export const isMetadataStale = (isStale: boolean, status: JiraSyncStatus | string): boolean =>
  isStale && status === 'fresh'

export const formatJiraDateTime = (iso: string | null | undefined): string => {
  if (!iso) {
    return '—'
  }

  const date = new Date(iso)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return date.toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const getTemplateFieldTypeLabel = (type: TemplateFieldType | string): string =>
  TEMPLATE_FIELD_TYPE_LABELS[type] ?? type

export const PROJECT_KEY_PATTERN = /^[A-Z][A-Z0-9_]*$/

export const validateProjectKey = (value: string): string | null => {
  const trimmed = value.trim().toUpperCase()

  if (!trimmed) {
    return 'Укажите ключ проекта'
  }

  if (!PROJECT_KEY_PATTERN.test(trimmed)) {
    return 'Формат: заглавные буквы, цифры и _ (например PROJ)'
  }

  return null
}

export const validateBaseUrl = (value: string): string | null => {
  const trimmed = value.trim()

  if (!trimmed) {
    return 'Укажите URL Jira'
  }

  try {
    const url = new URL(trimmed)

    if (url.protocol !== 'https:') {
      return 'URL должен начинаться с https://'
    }
  } catch {
    return 'Некорректный URL'
  }

  return null
}

export interface JiraConnectionFormValues {
  name: string
  base_url: string
  email: string
  api_token: string
  project_key: string
  board_id: string
}

export const validateJiraConnectionForm = (
  values: JiraConnectionFormValues,
  options: { isEdit: boolean; hasApiToken: boolean },
): Record<string, string> => {
  const errors: Record<string, string> = {}

  if (!values.name.trim()) {
    errors.name = 'Укажите название'
  } else if (values.name.trim().length > 255) {
    errors.name = 'Не более 255 символов'
  }

  const baseUrlError = validateBaseUrl(values.base_url)
  if (baseUrlError) {
    errors.base_url = baseUrlError
  }

  if (!values.email.trim()) {
    errors.email = 'Укажите email'
  }

  if (!options.isEdit && !values.api_token.trim()) {
    errors.api_token = 'Укажите API-токен'
  }

  const projectKeyError = validateProjectKey(values.project_key)
  if (projectKeyError) {
    errors.project_key = projectKeyError
  }

  return errors
}
