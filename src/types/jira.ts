import type { ApiUuid, IsoDateTimeString } from './common'

export type JiraConnectionTestStatus = 'unknown' | 'success' | 'failed'

export type JiraSyncStatus = 'pending' | 'syncing' | 'fresh' | 'failed'

export type TemplateFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'datetime'
  | 'user'
  | 'select'
  | 'multiselect'
  | 'cascading_select'
  | 'labels'
  | 'multiselect_user'
  | 'url'
  | 'readonly'
  | 'project'
  | 'group'
  | 'version'
  | 'multiselect_version'
  | 'priority'
  | 'status'
  | 'issuetype'
  | 'timetracking'
  | 'custom'

/** `GET/POST/PATCH` Jira connection response. */
export interface JiraConnection {
  id: ApiUuid
  workspace_id: ApiUuid
  name: string
  base_url: string
  email: string
  project_key: string
  board_id: string
  extra: Record<string, unknown>
  is_active: boolean
  has_api_token: boolean
  last_test_at: IsoDateTimeString | null
  last_test_status: JiraConnectionTestStatus | string
  last_test_error: string
  created_by_id: ApiUuid | null
  created_at: IsoDateTimeString
  updated_at: IsoDateTimeString
}

/** `POST /jira-connections/` */
export interface JiraConnectionCreate {
  name: string
  base_url: string
  email: string
  api_token: string
  project_key: string
  board_id?: string
  extra?: Record<string, unknown>
  is_active?: boolean
}

/** `PATCH /jira-connections/{id}/` */
export interface JiraConnectionUpdate {
  name?: string
  base_url?: string
  email?: string
  api_token?: string
  project_key?: string
  board_id?: string
  extra?: Record<string, unknown>
  is_active?: boolean
}

/** `GET /api/workspaces/` jira connections list — plain array. */
export type JiraConnectionListResponse = JiraConnection[]

export interface JiraConnectionAccount {
  account_id: string
  display_name: string
  email_address: string
}

/** `POST .../test/` — always HTTP 200. */
export interface JiraConnectionTestResult {
  status: JiraConnectionTestStatus
  tested_at: IsoDateTimeString
  detail: string
  account: JiraConnectionAccount | null
}

export interface JiraMetadataItem {
  jira_id: string
  name: string
  extra: Record<string, unknown>
}

export interface JiraIssueType {
  jira_id: string
  name: string
  hierarchy_level: number | null
  is_subtask: boolean
  description: string
  icon_url: string
}

export interface JiraField {
  jira_id: string
  key: string
  name: string
  is_custom: boolean
  schema_type: string
  is_required: boolean
  template_field_type: TemplateFieldType | string
  extra: Record<string, unknown>
}

export interface JiraSprint {
  jira_sprint_id: string
  name: string
  state: string
  start_date: IsoDateTimeString | null
  end_date: IsoDateTimeString | null
  goal: string
  board_id: string
}

export interface JiraBoard {
  jira_board_id: string
  name: string
  board_type: string
  sprints: JiraSprint[]
}

/** `GET .../metadata/` */
export interface JiraProjectMetadata {
  connection_id: ApiUuid
  project_id: string
  project_name: string
  project_key: string
  status: JiraSyncStatus
  is_stale: boolean
  fetched_at: IsoDateTimeString | null
  ttl_seconds: number
  last_sync_started_at: IsoDateTimeString | null
  last_error: string
  issue_types: JiraIssueType[]
  fields: JiraField[]
  priorities: JiraMetadataItem[]
  statuses: JiraMetadataItem[]
  components: JiraMetadataItem[]
  labels: JiraMetadataItem[]
  boards: JiraBoard[]
}

/** `POST .../sync-metadata/` — HTTP 202. */
export interface JiraMetadataSyncResponse {
  status: 'syncing'
  detail: string
}

/* --- Jira Guides (help content) --- */

export interface JiraGuideFieldItem {
  name: string
  label: string
  required: boolean
  example: string
  description: string
}

export interface JiraGuideStepItem {
  text: string
  hint?: string
}

export type JiraGuideBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'note'; variant: 'info' | 'warning' | 'success'; text: string }
  | { type: 'steps'; items: JiraGuideStepItem[] }
  | { type: 'link'; text: string; url: string }
  | { type: 'fields'; items: JiraGuideFieldItem[] }

export interface JiraGuideSection {
  id: string
  title: string
  blocks: JiraGuideBlock[]
}

/** `GET /api/jira/guides/` item (no `content`). */
export interface JiraGuideListItem {
  slug: string
  title: string
  summary: string
  locale: string
  version: number
  updated_at: IsoDateTimeString
}

/** `GET /api/jira/guides/{slug}/` full guide. */
export interface JiraGuide extends JiraGuideListItem {
  content: JiraGuideSection[]
}
