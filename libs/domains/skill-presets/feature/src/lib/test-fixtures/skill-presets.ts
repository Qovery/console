import { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import {
  type SkillPresetManifestResponse,
  type SkillPresetResolvedSkillResponse,
  type SkillPresetResponse,
} from 'qovery-typescript-axios'
import { P, match } from 'ts-pattern'
import { agentActivityResponse, policyTokens } from './agent-activity'

type SkillPresetsScenario =
  | 'typical'
  | 'empty'
  | 'errors'
  | 'member'
  | 'member-no-preset'
  | 'ai-features-off'
  | 'agent-activity'
  | 'agent-activity-empty'
  | 'agent-activity-timeout'
  | 'agent-experience-active'
  | 'agent-experience-empty'

const createdAt = '2025-01-06T09:00:00Z'
const backendPreset: SkillPresetResponse = {
  id: '0193f1c2-5a7e-7b10-9a0e-3d1f2c4b5a01',
  name: 'Backend team',
  description: 'Shared backend instructions',
  is_template: false,
  base: 'FULL',
  created_at: createdAt,
  updated_at: createdAt,
  revision: 1,
  skills: [],
  assigned_to: { organization_default: true },
}
const platformPreset: SkillPresetResponse = {
  ...backendPreset,
  id: '0193f1c2-5a7e-7b10-9a0e-3d1f2c4b5a02',
  name: 'Platform (CLI-first)',
  base: 'LEAN',
  assigned_to: {},
}
const sha = 'a'.repeat(64)
const manifest: SkillPresetManifestResponse = {
  source: 'ORGANIZATION',
  skill_preset: {
    id: backendPreset.id,
    name: backendPreset.name,
    base: backendPreset.base,
    revision: backendPreset.revision,
    updated_at: backendPreset.updated_at,
    team_context: { approx_tokens: 20, sha256: sha },
    skills: [
      {
        skill_name: 'qovery-deploy',
        mode: 'OVERLAY',
        content: { approx_tokens: 10, sha256: sha },
      },
    ],
  },
}
const deploySkill: SkillPresetResolvedSkillResponse = {
  source: manifest.source,
  skill_preset: { id: backendPreset.id, name: backendPreset.name, revision: backendPreset.revision },
  skill_name: 'qovery-deploy',
  mode: 'OVERLAY',
  content: 'Deploy to the `staging` environment first.',
  content_sha256: sha,
}

let scenario: SkillPresetsScenario
let presets: SkillPresetResponse[]
let tokens: typeof policyTokens
let listFailed: boolean
let aiEnabled: boolean
let copilotEnabled: boolean

export function setSkillPresetsScenario(next: SkillPresetsScenario = 'typical') {
  scenario = next
  presets = next === 'empty' ? [] : [backendPreset, platformPreset]
  tokens = next === 'agent-experience-active' ? [...policyTokens] : []
  listFailed = false
  aiEnabled = next !== 'ai-features-off'
  copilotEnabled = aiEnabled
}

export function isSkillPresetsTestMember() {
  return scenario === 'member' || scenario === 'member-no-preset'
}

export function buildSkillPresetApiError(status: number, detail: string, extra: Record<string, unknown> = {}) {
  return {
    message: detail,
    name: String(status),
    code: String(status),
    response: { status, data: { status, detail, ...extra } },
  }
}

function fail(config: InternalAxiosRequestConfig, status: number, detail: string): never {
  throw new AxiosError(
    detail,
    status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
    config,
    undefined,
    {
      data: { status, detail },
      status,
      statusText: '',
      headers: {},
      config,
    }
  )
}

export function installSkillPresetsFixtures(instance: AxiosInstance, service: 'api' | 'copilot') {
  const previous = instance.defaults.adapter

  instance.defaults.adapter = async (config) => {
    const url = new URL(config.url ?? '', config.baseURL || 'http://localhost')
    const query = new URLSearchParams({ ...Object.fromEntries(url.searchParams), ...config.params })
    const path = url.pathname.replace(/^.*?(?=\/(?:organization|skillPreset)(?:\/|$))/, '')
    const route = path.replace(/^\/organization\/[^/]+/, '/organization')
    const data = match([service, config.method, route] as const)
      .with(['api', 'get', '/organization'], () => ({
        id: path.split('/')[2],
        name: 'Test organization',
        ai_features_enabled: aiEnabled,
      }))
      .with(['api', 'put', '/organization/aiFeatures'], () => ({ enabled: (aiEnabled = true) }))
      .with(['api', 'get', '/organization/skillPreset'], () => {
        if (scenario === 'errors' && !listFailed) {
          listFailed = true
          return fail(config, 500, 'Internal server error')
        }
        return { results: query.get('isTemplate') === 'true' ? [] : presets }
      })
      .with(['api', 'get', '/organization/skillPreset/resolved'], () =>
        scenario === 'member-no-preset' ? { source: 'QOVERY_DEFAULT', skill_preset: null } : manifest
      )
      .with(['api', 'get', '/organization/skillPreset/resolved/skill/qovery-deploy'], () => deploySkill)
      .with(['api', 'delete', P.string.regex(/^\/skillPreset\/[^/]+$/)], () => {
        presets = presets.filter(({ id }) => id !== path.split('/').at(-1))
      })
      .with(
        [
          'api',
          'get',
          P.union('/organization/skillPreset/revision', '/organization/member', '/organization/availableRole'),
        ],
        () => ({ results: [] })
      )
      .with(['api', 'get', '/organization/policyApiToken'], () => ({ results: tokens }))
      .with(['api', 'delete', P.string.regex(/^\/organization\/policyApiToken\/[^/]+$/)], () => {
        tokens = tokens.filter(({ id }) => id !== path.split('/').at(-1))
      })
      .with(['api', 'get', P.union('/organization/agentActivity', '/organization/agentActivity/me')], () => {
        const range = Date.parse(query.get('to') ?? '') - Date.parse(query.get('from') ?? '')
        if (scenario === 'agent-activity-timeout' && range > 7 * 86_400_000 + 60_000) {
          return fail(
            config,
            503,
            'This range holds too much activity to read in time. Narrow the range, or filter by member or skill.'
          )
        }
        return agentActivityResponse(query, {
          empty: scenario === 'agent-activity-empty' || scenario === 'agent-experience-empty',
          member: route.endsWith('/me'),
        })
      })
      .with(['copilot', 'get', '/organization/config'], () => ({
        org_config: { enabled: copilotEnabled, read_only: true, instructions: '', token_mode: 'jwt' },
        role_configs: [],
      }))
      .with(['copilot', 'put', '/organization/config/org'], () => {
        copilotEnabled = true
        return { org_config: { enabled: copilotEnabled, read_only: true, instructions: '', token_mode: 'jwt' } }
      })
      .with(['copilot', 'get', '/organization/recurring-tasks'], () => ({ tasks: [] }))
      .otherwise(() => fail(config, 404, `Unexpected test request: ${config.method} ${route}`))

    return { data, status: 200, statusText: 'OK', headers: {}, config }
  }

  return () => {
    instance.defaults.adapter = previous
  }
}
