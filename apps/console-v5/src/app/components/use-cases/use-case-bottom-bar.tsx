import { useLocation, useMatches } from '@tanstack/react-router'
import { Icon, InputSelect, Tooltip } from '@qovery/shared/ui'
import { GIT_BRANCH, GIT_SHA } from '@qovery/shared/util-node-env'
import { useUseCases } from './use-case-context'

export function UseCaseBottomBar() {
  const location = useLocation()
  const matches = useMatches()
  const routeId = matches[matches.length - 1]?.routeId
  const scopeLabel = resolveScopeLabel(routeId)
  const pageName = resolvePageName(routeId, location.pathname)
  const pageLabel = `${scopeLabel} - ${pageName}`

  const { activePageId, optionsByPageId, selectionsByPageId, setSelection } = useUseCases()
  const useCaseOptions = activePageId ? optionsByPageId[activePageId] ?? [] : []
  const selectedFromState = activePageId ? selectionsByPageId[activePageId] : undefined
  const resolvedSelection =
    selectedFromState && useCaseOptions.some((option) => option.id === selectedFromState)
      ? selectedFromState
      : useCaseOptions[0]?.id

  const branchLabel = GIT_BRANCH || 'unknown'
  const commitLabel = GIT_SHA ? GIT_SHA.slice(0, 7) : undefined

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[calc(var(--modal-zindex)+1)]">
      <div className="pointer-events-auto border-t border-neutral bg-background">
        <div className="flex h-10 w-full items-center px-4 text-xs text-neutral">
          <div className="flex h-10 min-w-0 flex-1 items-center gap-2 border-r border-neutral pr-4">
            <Tooltip content="Git branch">
              <span className="inline-flex h-5 w-5 items-center justify-center text-neutral-subtle">
                <Icon iconName="code-branch" iconStyle="regular" />
              </span>
            </Tooltip>
            <span className="text-xs font-semibold uppercase text-neutral-subtle">Branch</span>
            <span className="min-w-0 truncate font-mono text-xs text-neutral">
              {branchLabel}
              {commitLabel ? ` (${commitLabel})` : ''}
            </span>
          </div>

          <div className="flex h-10 min-w-0 flex-1 items-center gap-2 border-r border-neutral px-4">
            <span className="text-xs font-semibold uppercase text-neutral-subtle">Page</span>
            <span title={routeId ?? pageLabel} className="min-w-0 truncate font-mono text-xs text-neutral">
              {pageLabel}
            </span>
          </div>

          <div className="flex h-10 min-w-0 flex-1 items-center gap-2 pl-4">
            {useCaseOptions.length > 0 && resolvedSelection ? (
              <>
                <span className="text-xs font-semibold uppercase text-neutral-subtle">Use case</span>
                <InputSelect
                  options={useCaseOptions.map((option) => ({
                    label: option.label,
                    value: option.id,
                  }))}
                  value={resolvedSelection}
                  onChange={(next) => {
                    if (activePageId && typeof next === 'string') {
                      setSelection(activePageId, next)
                    }
                  }}
                  className="min-w-0 flex-1 [&_.input-select__control]:!h-10 [&_.input-select__single-value]:!font-mono [&_.input-select__single-value]:!text-xs [&_.input-select__single-value]:!text-neutral [&_.react-select__dropdown-indicator]:!right-0"
                />
              </>
            ) : (
              <>
                <span className="text-xs font-semibold uppercase text-neutral-subtle">Use case</span>
                <span className="min-w-0 truncate font-mono text-xs text-neutral-subtle">No use case detected</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UseCaseBottomBar

function resolveScopeLabel(routeId?: string) {
  if (!routeId) {
    return 'Org'
  }

  if (routeId.includes('/service/$serviceId')) {
    return 'Service'
  }

  if (routeId.includes('/environment/$environmentId')) {
    return 'Env'
  }

  if (routeId.includes('/project/$projectId')) {
    return 'Project'
  }

  if (routeId.includes('/organization/$organizationId')) {
    return 'Org'
  }

  return 'Org'
}

function resolvePageName(routeId: string | undefined, pathname: string) {
  if (routeId) {
    const segments = routeId.split('/').filter(Boolean)
    let lastSegment = segments[segments.length - 1] ?? 'index'

    if (lastSegment.startsWith('$')) {
      lastSegment = segments[segments.length - 2] ?? lastSegment
    }

    if (lastSegment === '_index' || lastSegment === 'index') {
      return 'index'
    }

    return lastSegment
  }

  const pathSegments = pathname.split('/').filter(Boolean)
  return pathSegments[pathSegments.length - 1] ?? 'index'
}
