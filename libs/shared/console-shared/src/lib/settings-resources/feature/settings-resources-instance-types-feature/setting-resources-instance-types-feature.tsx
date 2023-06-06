import { DatabaseTypeEnum, ManagedDatabaseInstanceTypeResponse } from 'qovery-typescript-axios'
import React from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { useFetchDatabaseInstanceTypes } from '@qovery/domains/database'
import { getEnvironmentById, useFetchEnvironments } from '@qovery/domains/environment'
import { selectClusterById } from '@qovery/domains/organization'
import { ClusterEntity } from '@qovery/shared/interfaces'
import { RootState } from '@qovery/store'
import SettingsResourcesInstanceTypes from '../../ui/settings-resources-instance-types/setting-resources-instance-types'

export interface SettingsResourcesInstanceTypesFeatureProps {
  databaseType: DatabaseTypeEnum
}

export function SettingsResourcesInstanceTypesFeatureMemo({
  databaseType,
}: SettingsResourcesInstanceTypesFeatureProps) {
  const { projectId = '', environmentId = '' } = useParams()

  const { data: environments } = useFetchEnvironments(projectId)

  const environment = getEnvironmentById(environmentId, environments)
  const cluster = useSelector<RootState, ClusterEntity | undefined>((state: RootState) =>
    selectClusterById(state, environment?.cluster_id || '')
  )
  const { isLoading, data: databaseInstanceTypes } = useFetchDatabaseInstanceTypes(
    cluster?.cloud_provider,
    databaseType,
    cluster?.region
  )

  return (
    <SettingsResourcesInstanceTypes
      databaseInstanceTypes={databaseInstanceTypes?.map((instanceType: ManagedDatabaseInstanceTypeResponse) => ({
        label: instanceType.name,
        value: instanceType.name,
      }))}
      loading={isLoading}
    />
  )
}

export const SettingsResourcesInstanceTypesFeature = React.memo(
  SettingsResourcesInstanceTypesFeatureMemo,
  (prevProps, nextProps) => {
    return prevProps.databaseType === nextProps.databaseType
  }
)

export default SettingsResourcesInstanceTypesFeature
