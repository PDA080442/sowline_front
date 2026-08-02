<template>
  <v-dialog
    :model-value="modelValue"
    max-width="1000"
    scrollable
    class="jira-guide-dialog"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card rounded="xl" class="jira-guide-card">
      <div class="jira-guide-card__hero">
        <div class="jira-guide-card__hero-icon" aria-hidden="true">
          <v-icon icon="mdi-book-open-page-variant" size="28" />
        </div>
        <div class="jira-guide-card__hero-text">
          <h2 class="jira-guide-card__title">
            {{ guide?.title ?? 'Как подключить Jira Cloud' }}
          </h2>
          <p v-if="guide?.summary" class="jira-guide-card__summary">{{ guide.summary }}</p>
          <div v-if="guide" class="jira-guide-card__meta">
            <v-chip size="x-small" variant="flat" color="white" class="jira-guide-card__version">
              v{{ guide.version }}
            </v-chip>
            <span>Обновлено: {{ formatJiraDateTime(guide.updated_at) }}</span>
          </div>
        </div>
        <v-btn
          icon="mdi-close"
          aria-label="Закрыть инструкцию"
          variant="text"
          size="small"
          class="jira-guide-card__close"
          @click="emit('update:modelValue', false)"
        />
      </div>

      <v-card-text class="jira-guide-card__body pa-0">
        <div v-if="loading && !guide" class="jira-guide-card__loading" aria-busy="true">
          <v-progress-circular indeterminate color="primary" size="36" />
          <p>Загрузка инструкции…</p>
        </div>

        <PageErrorState
          v-else-if="error && !guide"
          title="Не удалось загрузить инструкцию"
          :description="error"
          @retry="emit('retry')"
        />

        <div v-else-if="guide" class="jira-guide-card__layout">
          <nav class="jira-guide-card__nav" aria-label="Разделы инструкции">
            <button
              v-for="(section, index) in guide.content"
              :key="section.id"
              type="button"
              class="jira-guide-card__nav-item"
              @click="scrollToSection(section.id)"
            >
              <span class="jira-guide-card__nav-index">{{ index + 1 }}</span>
              {{ section.title }}
            </button>
          </nav>

          <div ref="contentRef" class="jira-guide-card__content">
            <section
              v-for="(section, index) in guide.content"
              :id="sectionAnchor(section.id)"
              :key="section.id"
              class="jira-guide-card__section"
            >
              <h3 class="jira-guide-card__section-title">
                <span class="jira-guide-card__section-index" aria-hidden="true">{{
                  index + 1
                }}</span>
                {{ section.title }}
              </h3>
              <div class="jira-guide-card__blocks">
                <JiraGuideBlock
                  v-for="(block, blockIndex) in section.blocks"
                  :key="blockIndex"
                  :block="block"
                />
              </div>
            </section>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import PageErrorState from '@/components/common/PageErrorState.vue'
import JiraGuideBlock from '@/components/jira/JiraGuideBlock.vue'
import { formatJiraDateTime } from '@/models/jira'
import type { JiraGuide } from '@/types'

defineProps<{
  modelValue: boolean
  guide: JiraGuide | null
  loading: boolean
  error: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  retry: []
}>()

const contentRef = ref<HTMLElement | null>(null)

const sectionAnchor = (id: string) => `jira-guide-section-${id}`

const scrollToSection = (id: string) => {
  const target = document.getElementById(sectionAnchor(id))

  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<style scoped>
.jira-guide-card {
  display: flex;
  flex-direction: column;
  max-height: 88vh;
  overflow: hidden;
}

.jira-guide-card__hero {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 24px 56px 24px 24px;
  background: linear-gradient(135deg, #16a34a 0%, #0f766e 100%);
  color: #ffffff;
}

.jira-guide-card__hero-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.18);
}

.jira-guide-card__title {
  margin: 0;
  font-size: 1.375rem;
  font-weight: 700;
  line-height: 1.25;
}

.jira-guide-card__summary {
  margin: 6px 0 0;
  font-size: 0.9375rem;
  line-height: 1.5;
  opacity: 0.92;
}

.jira-guide-card__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  font-size: 0.8125rem;
  opacity: 0.9;
}

.jira-guide-card__version {
  color: #15803d !important;
  font-weight: 700;
}

.jira-guide-card__close {
  position: absolute;
  top: 12px;
  right: 12px;
  color: #ffffff;
}

.jira-guide-card__body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.jira-guide-card__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 64px 24px;
  color: #57534e;
}

.jira-guide-card__layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  grid-template-rows: minmax(0, 1fr);
  flex: 1;
  min-height: 0;
}

.jira-guide-card__nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 16px 12px;
  min-height: 0;
  overflow-y: auto;
  border-right: 1px solid #e7e5e4;
  background: #fafaf9;
}

.jira-guide-card__nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #44403c;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease;
}

.jira-guide-card__nav-item:hover {
  background: #f0fdf4;
  color: #15803d;
}

.jira-guide-card__nav-item:focus-visible {
  outline: 2px solid #16a34a;
  outline-offset: -2px;
}

.jira-guide-card__nav-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #e7e5e4;
  font-size: 0.75rem;
  font-weight: 700;
  color: #57534e;
}

.jira-guide-card__content {
  padding: 24px 28px;
  min-height: 0;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.jira-guide-card__section {
  padding: 20px 0;
  border-bottom: 1px solid #f5f5f4;
  scroll-margin-top: 12px;
}

.jira-guide-card__section:first-child {
  padding-top: 0;
}

.jira-guide-card__section:last-child {
  border-bottom: none;
}

.jira-guide-card__section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 14px;
  font-size: 1.125rem;
  font-weight: 700;
  color: #1c1917;
}

.jira-guide-card__section-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #dcfce7;
  color: #15803d;
  font-size: 0.875rem;
  font-weight: 700;
}

.jira-guide-card__blocks {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

@media (max-width: 860px) {
  .jira-guide-card__layout {
    grid-template-columns: 1fr;
  }

  .jira-guide-card__nav {
    display: none;
  }

  .jira-guide-card__content {
    padding: 20px 18px;
  }

  .jira-guide-card__hero {
    padding: 20px 52px 20px 18px;
  }

  .jira-guide-card__title {
    font-size: 1.125rem;
  }
}
</style>
