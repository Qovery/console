import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { type Member, type Organization, type OrganizationAvailableRole } from 'qovery-typescript-axios'
import {
  type AgentActivityParams,
  type ResolvedSkillPurpose,
  type SkillPresetRequest,
} from '@qovery/domains/skill-presets/data-access'
import { type SkillPresetsMockScenario } from './mock-scenario-names'
import { createSkillPresetsMockApi } from './skill-presets-mock-api'

/** The axios instance a request came through: the Qovery API, or the DevOps Copilot service. */
export type SkillPresetsMockService = 'api' | 'copilot'

type Passthrough = (config: InternalAxiosRequestConfig) => Promise<AxiosResponse>

interface MockRequest {
  path: string
  query: Record<string, string>
  body: unknown
  rawBody?: string
  passthrough?: Passthrough
  config: InternalAxiosRequestConfig
}

type Handler = (params: string[], request: MockRequest) => Promise<unknown>

interface Route {
  method: string
  pattern: RegExp
  handler: Handler
}

const MOCK_ORGANIZATION_NAME = 'Acme (mock)'

const definedQuery = (params: unknown): Record<string, string> =>
  Object.fromEntries(
    Object.entries((params ?? {}) as Record<string, unknown>)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => [key, String(value)])
  )

const parseBody = (data: unknown) => {
  if (typeof data !== 'string') return data
  try {
    return JSON.parse(data)
  } catch {
    return data
  }
}

const toBoolean = (value?: string) => (value === undefined ? undefined : value === 'true')
const toNumber = (value?: string) => (value === undefined ? undefined : Number(value))

/**
 * Answers the requests the skill presets pages make, from the in-memory mock of one scenario: the
 * skill presets and agent activity endpoints, and the organization data they read (members, roles,
 * policy tokens, AI features, Copilot config). Anything else is not answered here.
 */
export function createSkillPresetsMockServer(scenario: SkillPresetsMockScenario) {
  const api = createSkillPresetsMockApi(scenario, MOCK_ORGANIZATION_NAME)

  const apiRoutes: Route[] = [
    {
      method: 'get',
      pattern: /^\/organization\/([^/]+)\/skillPreset$/,
      handler: ([organizationId], { query }) =>
        api.listSkillPresets(organizationId, { isTemplate: toBoolean(query['isTemplate']) }),
    },
    {
      method: 'post',
      pattern: /^\/organization\/([^/]+)\/skillPreset$/,
      handler: ([organizationId], { body }) => api.createSkillPreset(organizationId, body as SkillPresetRequest),
    },
    {
      method: 'get',
      pattern: /^\/organization\/([^/]+)\/skillPreset\/revision$/,
      handler: ([organizationId], { query }) =>
        api.listSkillPresetRevisions(organizationId, {
          skillPresetId: query['skillPresetId'],
          limit: toNumber(query['limit']),
        }),
    },
    {
      method: 'get',
      pattern: /^\/organization\/([^/]+)\/skillPreset\/resolved$/,
      handler: ([organizationId]) => api.getResolvedSkillPreset(organizationId),
    },
    {
      method: 'get',
      pattern: /^\/organization\/([^/]+)\/skillPreset\/resolved\/skill\/([^/]+)$/,
      handler: ([organizationId, skillName], { query }) =>
        api.getResolvedSkill(organizationId, decodeURIComponent(skillName), {
          purpose: (query['purpose'] ?? 'VIEW') as ResolvedSkillPurpose,
        }),
    },
    {
      method: 'get',
      pattern: /^\/skillPreset\/([^/]+)$/,
      handler: ([skillPresetId]) => api.getSkillPreset(skillPresetId),
    },
    {
      method: 'put',
      pattern: /^\/skillPreset\/([^/]+)$/,
      handler: ([skillPresetId], { body }) => api.editSkillPreset(skillPresetId, body as SkillPresetRequest),
    },
    {
      method: 'delete',
      pattern: /^\/skillPreset\/([^/]+)$/,
      handler: ([skillPresetId]) => api.deleteSkillPreset(skillPresetId),
    },
    {
      method: 'get',
      pattern: /^\/organization\/([^/]+)\/agentActivity$/,
      handler: ([organizationId], { query }) =>
        api.getAgentActivity(organizationId, query as unknown as AgentActivityParams),
    },
    {
      method: 'get',
      pattern: /^\/organization\/([^/]+)\/agentActivity\/me$/,
      handler: ([organizationId], { query }) =>
        api.getMyAgentActivity(organizationId, query as unknown as AgentActivityParams),
    },
    {
      method: 'put',
      pattern: /^\/organization\/([^/]+)\/aiFeatures$/,
      handler: async ([organizationId], { body }) => {
        if ((body as { enabled?: boolean } | undefined)?.enabled) await api.enableAiFeatures(organizationId)
        return { enabled: await api.aiFeaturesEnabled() }
      },
    },
    {
      method: 'get',
      pattern: /^\/organization\/([^/]+)$/,
      // The real organization, with the mock's AI features flag. Tests have no real API to ask.
      handler: async ([organizationId], { passthrough, config }) => {
        const organization: Partial<Organization> = passthrough
          ? (await passthrough(config)).data
          : { id: organizationId, name: MOCK_ORGANIZATION_NAME }
        return { ...organization, ai_features_enabled: await api.aiFeaturesEnabled() }
      },
    },
    {
      method: 'get',
      pattern: /^\/organization\/([^/]+)\/member$/,
      handler: async () => {
        const { members, roles } = await api.listAssignees()
        const results: Member[] = members.map(({ id, name, email, role_id }) => ({
          id,
          created_at: '2025-01-06T09:00:00Z',
          name,
          nickname: name,
          email,
          role_id,
          role_name: roles.find((role) => role.id === role_id)?.name,
        }))
        return { results }
      },
    },
    {
      method: 'get',
      pattern: /^\/organization\/([^/]+)\/availableRole$/,
      handler: async () => {
        const { roles } = await api.listAssignees()
        const results: OrganizationAvailableRole[] = roles.map(({ id, name }) => ({ id, name }))
        return { results }
      },
    },
    {
      method: 'get',
      pattern: /^\/organization\/([^/]+)\/policyApiToken$/,
      handler: async () => ({ results: await api.listPolicyTokens() }),
    },
    {
      method: 'delete',
      pattern: /^\/organization\/([^/]+)\/policyApiToken\/([^/]+)$/,
      handler: ([, policyApiTokenId]) => api.deletePolicyToken(policyApiTokenId),
    },
  ]

  const route = (service: SkillPresetsMockService, method: string, path: string) => {
    if (service === 'copilot') {
      return {
        params: [],
        handler: ((_, { rawBody }) => api.copilotRequest(method, path, rawBody)) as Handler,
      }
    }
    for (const candidate of apiRoutes) {
      const match = candidate.method === method ? candidate.pattern.exec(path) : null
      if (match) return { params: match.slice(1), handler: candidate.handler }
    }
    return null
  }

  return {
    /**
     * The mock's answer to a request, or null when the mock does not play that endpoint. Failures
     * reject with an AxiosError carrying the response, as a real API error would.
     */
    handle(
      service: SkillPresetsMockService,
      config: InternalAxiosRequestConfig,
      passthrough?: Passthrough
    ): Promise<AxiosResponse> | null {
      const url = new URL(config.url ?? '', config.baseURL || 'http://localhost')
      // Whatever prefix the API base URL adds, the routes start at the first known resource.
      const path = url.pathname.replace(/^.*?(?=\/(?:organization|skillPreset)(?:\/|$))/, '')
      const method = (config.method ?? 'get').toLowerCase()
      const matched = route(service, method, path)
      if (!matched) return null

      const request: MockRequest = {
        path,
        query: { ...Object.fromEntries(url.searchParams), ...definedQuery(config.params) },
        body: parseBody(config.data),
        rawBody: typeof config.data === 'string' ? config.data : undefined,
        passthrough,
        config,
      }
      return matched.handler(matched.params, request).then(
        (data) => ({ data, status: 200, statusText: 'OK', headers: {}, config }),
        (error: unknown) => {
          if (error instanceof AxiosError) throw error
          const response = (error as { response?: { status?: number; data?: unknown } }).response
          const status = response?.status ?? 500
          throw new AxiosError(
            (error as { message?: string }).message,
            status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
            config,
            undefined,
            { data: response?.data, status, statusText: '', headers: {}, config }
          )
        }
      )
    },
    /** Test helper: every audit entry recorded so far, oldest first. */
    auditEvents: () => api.auditEvents(),
  }
}

export type SkillPresetsMockServer = ReturnType<typeof createSkillPresetsMockServer>
