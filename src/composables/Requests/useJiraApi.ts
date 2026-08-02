import type {
  ApiUuid,
  JiraConnection,
  JiraConnectionCreate,
  JiraConnectionListResponse,
  JiraConnectionTestResult,
  JiraConnectionUpdate,
  JiraGuide,
  JiraGuideListItem,
  JiraMetadataSyncResponse,
  JiraProjectMetadata,
} from '@/types'

import { useApi } from './useApi'

export const CONNECTION_GUIDE_SLUG = 'jira-connection-setup'

export function useJiraApi() {
  const api = useApi('/api/workspaces')
  const guideApi = useApi('/api/jira/guides')

  const base = (workspaceId: ApiUuid, connectionId?: ApiUuid) =>
    connectionId
      ? `/${workspaceId}/jira-connections/${connectionId}`
      : `/${workspaceId}/jira-connections`

  return {
    /** `GET /api/workspaces/{workspace_id}/jira-connections/` */
    listConnections: (workspaceId: ApiUuid) =>
      api.get<JiraConnectionListResponse>(`${base(workspaceId)}/`),

    /** `POST /api/workspaces/{workspace_id}/jira-connections/` */
    createConnection: (workspaceId: ApiUuid, body: JiraConnectionCreate) =>
      api.post<JiraConnection>(`${base(workspaceId)}/`, body),

    /** `GET /api/workspaces/{workspace_id}/jira-connections/{id}/` */
    getConnection: (workspaceId: ApiUuid, connectionId: ApiUuid) =>
      api.get<JiraConnection>(`${base(workspaceId, connectionId)}/`),

    /** `PATCH /api/workspaces/{workspace_id}/jira-connections/{id}/` */
    updateConnection: (workspaceId: ApiUuid, connectionId: ApiUuid, body: JiraConnectionUpdate) =>
      api.patch<JiraConnection>(`${base(workspaceId, connectionId)}/`, body),

    /** `POST /api/workspaces/{workspace_id}/jira-connections/{id}/deactivate/` */
    deactivateConnection: (workspaceId: ApiUuid, connectionId: ApiUuid) =>
      api.post<JiraConnection>(`${base(workspaceId, connectionId)}/deactivate/`),

    /** `POST /api/workspaces/{workspace_id}/jira-connections/{id}/test/` */
    testConnection: (workspaceId: ApiUuid, connectionId: ApiUuid) =>
      api.post<JiraConnectionTestResult>(`${base(workspaceId, connectionId)}/test/`),

    /** `GET /api/workspaces/{workspace_id}/jira-connections/{id}/metadata/` */
    getMetadata: (workspaceId: ApiUuid, connectionId: ApiUuid) =>
      api.get<JiraProjectMetadata>(`${base(workspaceId, connectionId)}/metadata/`),

    /** `POST /api/workspaces/{workspace_id}/jira-connections/{id}/sync-metadata/` — HTTP 202 */
    syncMetadata: (workspaceId: ApiUuid, connectionId: ApiUuid) =>
      api.post<JiraMetadataSyncResponse>(`${base(workspaceId, connectionId)}/sync-metadata/`),

    /** `GET /api/jira/guides/` — list without `content`. */
    listGuides: () => guideApi.get<JiraGuideListItem[]>('/'),

    /** `GET /api/jira/guides/jira-connection-setup/` — full connection guide. */
    getConnectionGuide: () => guideApi.get<JiraGuide>(`/${CONNECTION_GUIDE_SLUG}/`),
  }
}
