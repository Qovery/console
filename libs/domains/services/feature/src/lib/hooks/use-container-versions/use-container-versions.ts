import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export function sortVersions(versions?: string[]) {
  const semanticVersioning = /^[v]?\d+\.\d+\.\d+/
  return versions?.sort((a, b) => {
    if (a.match(semanticVersioning) && b.match(semanticVersioning)) {
      return b.replace(/^v/i, '').localeCompare(a.replace(/^v/i, ''), undefined, { numeric: true })
    }
    if (a.match(semanticVersioning) && !b.match(semanticVersioning)) {
      return -1
    }
    if (!a.match(semanticVersioning) && b.match(semanticVersioning)) {
      return 1
    }
    if (!a.match(semanticVersioning) && !b.match(semanticVersioning)) {
      return a.localeCompare(b)
    }
    return 0
  })
}

export interface UseContainerVersionsProps {
  organizationId: string
  containerRegistryId: string
  imageName: string
}

export function useContainerVersions({ organizationId, containerRegistryId, imageName }: UseContainerVersionsProps) {
  return useQuery({
    ...queries.organizations.containerVersions({ organizationId, containerRegistryId, imageName }),
    select(data) {
      return data?.map(({ image_name, versions }) => ({
        image_name,
        versions: sortVersions(versions),
      }))
    },
    refetchOnWindowFocus: false,
  })
}

export default useContainerVersions
