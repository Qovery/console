import { useDatabaseCreateContext } from 'libs/pages/services/src/lib/feature/page-database-create-feature/page-database-create-feature'
import {
  DatabaseTypeEnum,
  ManagedDatabaseInstanceTypeResponse,
  ManagedDatabaseInstanceTypeResponseList,
} from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { fetchDatabaseInstanceTypes } from '@qovery/domains/database'
import { getEnvironmentById, useFetchEnvironments } from '@qovery/domains/environment'
import { selectClusterById } from '@qovery/domains/organization'
import { ClusterEntity, Value } from '@qovery/shared/interfaces'
import { AppDispatch, RootState } from '@qovery/store'
import SettingResourcesInstanceTypes from '../../ui/settings-resources-instance-types/setting-resources-instance-types'

export interface SettingResourcesInstanceTypesFeatureInterface {
  databaseType?: DatabaseTypeEnum
}

export function SettingResourcesInstanceTypesFeature({ databaseType }: SettingResourcesInstanceTypesFeatureInterface) {
  const { projectId = '', environmentId = '' } = useParams()
  const { generalData } = useDatabaseCreateContext()

  const { data: environments } = useFetchEnvironments(projectId)
  const environment = getEnvironmentById(environmentId, environments)
  const cluster = useSelector<RootState, ClusterEntity | undefined>((state: RootState) =>
    selectClusterById(state, environment?.cluster_id || '')
  )
  const dispatch = useDispatch<AppDispatch>()
  const [databaseInstanceTypesLoading, setDatabaseInstanceTypesLoading] = useState(true)
  const [databaseInstanceTypes, setDatabaseInstanceTypes] = useState<Value[] | undefined>()

  useEffect(() => {
    if (cluster && (databaseType || generalData?.type)) {
      dispatch(
        fetchDatabaseInstanceTypes({
          provider: cluster.cloud_provider,
          region: cluster.region,
          databaseType: generalData?.type || databaseType,
        })
      )
        .unwrap()
        .then((data: ManagedDatabaseInstanceTypeResponseList) => {
          setDatabaseInstanceTypesLoading(false)
          setDatabaseInstanceTypes(
            data.results?.map((item: ManagedDatabaseInstanceTypeResponse) => ({ label: item.name, value: item.name }))
          )
        })
        .catch(() => setDatabaseInstanceTypesLoading(false))
    }
  }, [dispatch, cluster, databaseType])

  return (
    <SettingResourcesInstanceTypes
      databaseInstanceTypes={databaseInstanceTypes}
      loading={databaseInstanceTypesLoading}
    />
  )
}

export default SettingResourcesInstanceTypesFeature
