import { useQuery } from '@tanstack/react-query'
import { type CloudProviderEnum } from 'qovery-typescript-axios'
import { queries } from '@qovery/state/util-queries'

export interface UseCloudProviderDatabaseInstanceTypesProps {
  cloudProvider: Extract<CloudProviderEnum, 'AWS' | 'SCW'>
  databaseType: string
  region?: string
}

export function useCloudProviderDatabaseInstanceTypes({
  cloudProvider,
  databaseType,
  region,
}: UseCloudProviderDatabaseInstanceTypesProps) {
  return useQuery({
    ...queries.cloudProviders.listDatabaseInstanceTypes({ cloudProvider, databaseType, region }),
  })
}

export default useCloudProviderDatabaseInstanceTypes
