import { match } from 'ts-pattern'
import { type ServiceType } from '@qovery/domains/services/data-access'

export const getEnvironmentBasePath = (organizationId: string, projectId: string, environmentId: string) =>
  `/organization/${organizationId}/project/${projectId}/environment/${environmentId}`

export const getServicesPath = (organizationId: string, projectId: string, environmentId: string, subPath: string) =>
  `${getEnvironmentBasePath(organizationId, projectId, environmentId)}${subPath}`

const CREATE_FLOW_SLUG_BY_TYPE: Partial<Record<ServiceType, string>> = {
  APPLICATION: 'application',
  CONTAINER: 'container',
  DATABASE: 'database',
  HELM: 'helm',
  JOB: 'lifecycle-job',
  LIFECYCLE_JOB: 'lifecycle-job',
  CRON_JOB: 'cron-job',
  TERRAFORM: 'terraform',
}

const CREATE_FLOW_SLUGS = new Set(Object.values(CREATE_FLOW_SLUG_BY_TYPE))

function getCreateFlowPathParams(
  type: ServiceType,
  parentSlug: string,
  slug: string
): { flowSlug: string; templateSlug: string | undefined } {
  if (slug === 'current') {
    const flowSlug = CREATE_FLOW_SLUGS.has(parentSlug) ? parentSlug : CREATE_FLOW_SLUG_BY_TYPE[type] ?? parentSlug
    const templateSlug = CREATE_FLOW_SLUGS.has(parentSlug) ? undefined : parentSlug
    return { flowSlug, templateSlug }
  }

  const flowSlug = CREATE_FLOW_SLUGS.has(parentSlug) ? parentSlug : slug
  const templateSlug = CREATE_FLOW_SLUGS.has(parentSlug) ? (CREATE_FLOW_SLUGS.has(slug) ? undefined : slug) : parentSlug
  return { flowSlug, templateSlug }
}

export function getCreateFlowPath(flowSlug: string, templateSlug?: string): string {
  const path = `/service/create/${flowSlug}`
  if (templateSlug && templateSlug !== 'current') {
    return `${path}?template=${encodeURIComponent(templateSlug)}`
  }
  return path
}

export function getBlueprintCreateFlowPath(provider: string, serviceFamily: string): string {
  return `/service/create/blueprint/${encodeURIComponent(provider)}/${encodeURIComponent(serviceFamily)}`
}

export function buildCreateFlowPathForType(type: ServiceType, parentSlug: string, slug: string): string | undefined {
  const flowSlug = CREATE_FLOW_SLUG_BY_TYPE[type]
  if (!flowSlug) return undefined

  if (type === 'DATABASE' || type === 'LIFECYCLE_JOB') {
    const templateSlug = parentSlug === flowSlug || parentSlug === 'current' ? undefined : parentSlug
    const optionSlug = slug === 'current' ? undefined : slug
    const path = getCreateFlowPath(flowSlug, templateSlug)

    if (optionSlug) {
      return `${path}${templateSlug ? '&' : '?'}option=${encodeURIComponent(optionSlug)}`
    }

    return path
  }

  const { flowSlug: resolvedFlowSlug, templateSlug } = getCreateFlowPathParams(type, parentSlug, slug)
  return getCreateFlowPath(resolvedFlowSlug, templateSlug)
}

export const servicePathSuffix = (type: ServiceType, parentSlug: string, slug: string) =>
  match(type)
    .with('APPLICATION', 'CONTAINER', 'DATABASE', 'HELM', 'TERRAFORM', 'LIFECYCLE_JOB', () =>
      buildCreateFlowPathForType(type, parentSlug, slug)
    )
    .with('JOB', 'CRON_JOB', () => undefined)
    .otherwise(() => buildCreateFlowPathForType(type, parentSlug, slug))
