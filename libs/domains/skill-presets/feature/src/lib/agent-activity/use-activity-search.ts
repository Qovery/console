import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { useCallback } from 'react'
import { type ActivitySearch } from './activity-search'

const clean = (search: ActivitySearch): ActivitySearch =>
  Object.fromEntries(
    Object.entries(search).filter(([, value]) => value !== undefined && value !== '')
  ) as ActivitySearch

/** The Activity filters, read from and written to the URL (replace, so Back leaves the page). */
export function useActivitySearch() {
  const { organizationId = '' } = useParams({ strict: false })
  const search = useSearch({ strict: false }) as ActivitySearch
  const navigate = useNavigate()
  const setSearch = useCallback(
    (patch: Partial<ActivitySearch>) =>
      navigate({
        to: '/organization/$organizationId/agents/agent-activity',
        params: { organizationId },
        search: clean({ ...search, ...patch }),
        replace: true,
      }),
    [navigate, organizationId, search]
  )
  return [search, setSearch] as const
}
