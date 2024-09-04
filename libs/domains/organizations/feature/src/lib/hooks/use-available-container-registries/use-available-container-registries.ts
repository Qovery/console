import { useQuery } from '@tanstack/react-query'
import { type ContainerRegistryKindEnum } from 'qovery-typescript-axios'
import { queries } from '@qovery/state/util-queries'

export function useAvailableContainerRegistries() {
  return useQuery({
    ...queries.organizations.availableContainerRegistries,
    select(registries) {
      const sortOrder: (keyof typeof ContainerRegistryKindEnum)[] = [
        'ECR',
        'GCP_ARTIFACT_REGISTRY',
        'SCALEWAY_CR',
        'DOCKER_HUB',
        'GENERIC_CR',
        'GITHUB_CR',
        'GITLAB_CR',
        'PUBLIC_ECR',
        'DOCR',
      ]

      return registries?.sort((a, b) => {
        const indexA = sortOrder.indexOf(a.kind)
        const indexB = sortOrder.indexOf(b.kind)

        // If both kinds are found, sort by their order in sortOrder array
        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB
        }

        // If a.kind is not found in sortOrder, place it after b.kind
        if (indexA === -1) return 1

        // If b.kind is not found in sortOrder, place it after a.kind
        if (indexB === -1) return -1

        return 0
      })
    },
  })
}

export default useAvailableContainerRegistries
