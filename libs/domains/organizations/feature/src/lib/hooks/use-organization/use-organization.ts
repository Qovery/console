import { useQuery } from '@tanstack/react-query'
import { type Organization } from 'qovery-typescript-axios'
import { queries } from '@qovery/state/util-queries'

export interface UseOrganizationProps {
  organizationId: string
  enabled?: boolean
}

export const organizationQuery = ({ organizationId }: { organizationId: string }) => ({
  ...queries.organizations.details({ organizationId }),
  select(data?: Organization) {
    return data
  },
})

export function useOrganization({ organizationId, enabled }: UseOrganizationProps) {
  return useQuery({
    ...organizationQuery({ organizationId }),
    enabled,
  })
}

export default useOrganization
