import { DatabaseTypeEnum, ManagedDatabaseInstanceTypeResponse } from 'qovery-typescript-axios'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { useFetchDatabaseInstanceTypes } from '@qovery/domains/database'
import { useFetchEnvironment } from '@qovery/domains/environment'
import { selectClusterById } from '@qovery/domains/organization'
import { ClusterEntity } from '@qovery/shared/interfaces'
import { RootState } from '@qovery/state/store'
import SettingsResourcesInstanceTypes from '../../ui/settings-resources-instance-types/setting-resources-instance-types'

export interface SettingsResourcesInstanceTypesFeatureProps {
  databaseType: DatabaseTypeEnum
  displayWarning: boolean
}

export function SettingsResourcesInstanceTypesFeature({
  databaseType,
  displayWarning,
}: SettingsResourcesInstanceTypesFeatureProps) {
  const { projectId = '', environmentId = '' } = useParams()

  const { data: environment } = useFetchEnvironment(projectId, environmentId)
  const cluster = useSelector<RootState, ClusterEntity | undefined>((state: RootState) =>
    selectClusterById(state, environment?.cluster_id || '')
  )

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
