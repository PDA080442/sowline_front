<template>
  <div class="jira-guide-block">
    <p v-if="block.type === 'paragraph'" class="jira-guide-block__paragraph">
      {{ block.text }}
    </p>

    <ul v-else-if="block.type === 'list'" class="jira-guide-block__list">
      <li v-for="(item, index) in block.items" :key="index">{{ item }}</li>
    </ul>

    <v-alert
      v-else-if="block.type === 'note'"
      :type="noteType(block.variant)"
      variant="tonal"
      density="comfortable"
      class="jira-guide-block__note"
    >
      {{ block.text }}
    </v-alert>

    <ol v-else-if="block.type === 'steps'" class="jira-guide-block__steps">
      <li v-for="(step, index) in block.items" :key="index" class="jira-guide-block__step">
        <span class="jira-guide-block__step-index" aria-hidden="true">{{ index + 1 }}</span>
        <span class="jira-guide-block__step-body">
          <span class="jira-guide-block__step-text">{{ step.text }}</span>
          <span v-if="step.hint" class="jira-guide-block__step-hint">{{ step.hint }}</span>
        </span>
      </li>
    </ol>

    <a
      v-else-if="block.type === 'link'"
      :href="block.url"
      target="_blank"
      rel="noopener noreferrer"
      class="jira-guide-block__link"
    >
      <v-icon icon="mdi-open-in-new" size="18" />
      {{ block.text }}
    </a>

    <div v-else-if="block.type === 'fields'" class="table-scroll">
      <v-table density="comfortable" class="jira-guide-block__fields">
        <thead>
          <tr>
            <th scope="col">Поле</th>
            <th scope="col">Пример</th>
            <th scope="col">Описание</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="field in block.items" :key="field.name">
            <td>
              <span class="jira-guide-block__field-label">{{ field.label }}</span>
              <span
                v-if="field.required"
                class="jira-guide-block__field-required"
                aria-label="обязательное поле"
              >
                *
              </span>
            </td>
            <td>
              <code class="jira-guide-block__field-example">{{ field.example }}</code>
            </td>
            <td class="jira-guide-block__field-desc">{{ field.description }}</td>
          </tr>
        </tbody>
      </v-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { JiraGuideBlock } from '@/types'

defineProps<{
  block: JiraGuideBlock
}>()

const noteType = (variant: 'info' | 'warning' | 'success') => variant
</script>

<style scoped>
.jira-guide-block__paragraph {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: #44403c;
}

.jira-guide-block__list {
  margin: 0;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.9375rem;
  line-height: 1.55;
  color: #44403c;
}

.jira-guide-block__note {
  border-radius: 12px;
  font-size: 0.9rem;
}

.jira-guide-block__steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  counter-reset: guide-step;
}

.jira-guide-block__step {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.jira-guide-block__step-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #dcfce7;
  color: #15803d;
  font-size: 0.8125rem;
  font-weight: 700;
}

.jira-guide-block__step-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.jira-guide-block__step-text {
  font-size: 0.9375rem;
  line-height: 1.5;
  color: #292524;
}

.jira-guide-block__step-hint {
  font-size: 0.8125rem;
  color: #78716c;
}

.jira-guide-block__link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid #16a34a;
  border-radius: 10px;
  color: #15803d;
  font-weight: 600;
  font-size: 0.9375rem;
  text-decoration: none;
  transition: background 0.15s ease;
}

.jira-guide-block__link:hover {
  background: #f0fdf4;
}

.jira-guide-block__fields {
  border: 1px solid #e7e5e4;
  border-radius: 12px;
  overflow: hidden;
  min-width: 520px;
}

.jira-guide-block__fields :deep(th) {
  background: #fafaf9;
  font-size: 0.75rem !important;
  font-weight: 600 !important;
  color: #78716c !important;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.jira-guide-block__field-label {
  font-weight: 600;
  color: #1c1917;
}

.jira-guide-block__field-required {
  margin-left: 2px;
  color: #b91c1c;
  font-weight: 700;
}

.jira-guide-block__field-example {
  padding: 2px 6px;
  border-radius: 6px;
  background: #f5f5f4;
  font-size: 0.8125rem;
  color: #292524;
}

.jira-guide-block__field-desc {
  font-size: 0.875rem;
  color: #57534e;
}
</style>
