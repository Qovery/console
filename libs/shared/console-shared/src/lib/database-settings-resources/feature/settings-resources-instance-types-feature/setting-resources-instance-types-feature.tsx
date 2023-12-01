import { type DatabaseTypeEnum, type ManagedDatabaseInstanceTypeResponse } from 'qovery-typescript-axios'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useCluster } from '@qovery/domains/clusters/feature'
import { useFetchDatabaseInstanceTypes } from '@qovery/domains/database'
import { useFetchEnvironment } from '@qovery/domains/environment'
import SettingsResourcesInstanceTypes from '../../ui/settings-resources-instance-types/setting-resources-instance-types'

export interface SettingsResourcesInstanceTypesFeatureProps {
  databaseType: DatabaseTypeEnum
  displayWarning: boolean
}

export function SettingsResourcesInstanceTypesFeature({
  databaseType,
  displayWarning,
}: SettingsResourcesInstanceTypesFeatureProps) {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()

  const { data: environment } = useFetchEnvironment(projectId, environmentId)
  const { data: cluster } = useCluster({ organizationId, clusterId: environment?.cluster_id ?? '' })

  const { data: databaseInstanceTypes } = useFetchDatabaseInstanceTypes(
    cluster?.cloud_provider,
    databaseType,
    cluster?.region
  )

  const formatDatabaseInstanceTypes = useMemo(
    () =>
      databaseInstanceTypes?.map((instanceType: ManagedDatabaseInstanceTypeResponse) => ({
        label: instanceType.name,
        value: instanceType.name,
      })),
    [databaseInstanceTypes]
  )

  return (
    <SettingsResourcesInstanceTypes
      databaseInstanceTypes={formatDatabaseInstanceTypes}
      displayWarning={displayWarning}
    />
  )
}

export default SettingsResourcesInstanceTypesFeature
