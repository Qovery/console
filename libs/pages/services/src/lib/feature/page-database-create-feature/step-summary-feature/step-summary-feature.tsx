import { DatabaseModeEnum, DatabaseRequest } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { createDatabase, postDatabaseActionsDeploy } from '@qovery/domains/database'
import {
  SERVICES_DATABASE_CREATION_GENERAL_URL,
  SERVICES_DATABASE_CREATION_RESOURCES_URL,
  SERVICES_DATABASE_CREATION_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { FunnelFlowBody } from '@qovery/shared/ui'
import { convertCpuToVCpu, useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch } from '@qovery/store'
import StepSummary from '../../../ui/page-database-create/step-summary/step-summary'
import { useDatabaseCreateContext } from '../page-database-create-feature'

export function StepSummaryFeature() {
  useDocumentTitle('Summary - Create Database')
  const { generalData, resourcesData, setCurrentStep } = useDatabaseCreateContext()
  const navigate = useNavigate()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_DATABASE_CREATION_URL}`
  const [loadingCreate, setLoadingCreate] = useState(false)
  const [loadingCreateAndDeploy, setLoadingCreateAndDeploy] = useState(false)

  const gotoGlobalInformations = () => {
    navigate(pathCreate + SERVICES_DATABASE_CREATION_GENERAL_URL)
  }

  const gotoResources = () => {
    navigate(pathCreate + SERVICES_DATABASE_CREATION_RESOURCES_URL)
  }

  const onBack = () => {
    if (generalData?.mode === DatabaseModeEnum.MANAGED) {
      gotoGlobalInformations()
    } else {
      gotoResources()
    }
  }

  useEffect(() => {
    !generalData?.name && gotoGlobalInformations()
  }, [generalData, navigate, environmentId, organizationId, projectId, gotoGlobalInformations])

  const dispatch = useDispatch<AppDispatch>()

  const onSubmit = (withDeploy: boolean) => {
    if (generalData && resourcesData) {
      if (withDeploy) setLoadingCreateAndDeploy(true)
      else setLoadingCreate(true)

      const memory = Number(resourcesData['memory'])
      const storage = Number(resourcesData['storage'])
      const cpu = convertCpuToVCpu(resourcesData['cpu'][0], true)

      const databaseRequest: DatabaseRequest = {
        name: generalData.name,
        description: generalData.description || '',
        type: generalData.type,
        version: generalData.version,
        accessibility: generalData.accessibility,
        mode: generalData.mode,
      }

      if (databaseRequest.mode !== DatabaseModeEnum.MANAGED) {
        databaseRequest.cpu = cpu
        databaseRequest.memory = memory
        databaseRequest.storage = storage
      }

      dispatch(
        createDatabase({
          environmentId: environmentId,
          databaseRequest,
        })
      )
        .unwrap()
        .then((database) => {
          if (withDeploy) {
            dispatch(
              postDatabaseActionsDeploy({
                environmentId,
                databaseId: database.id,
              })
            )
          }
          navigate(SERVICES_URL(organizationId, projectId, environmentId))
        })
        .catch((e) => console.error(e))
        .finally(() => {
          if (withDeploy) setLoadingCreateAndDeploy(false)
          else setLoadingCreate(false)
        })
    }
  }

  useEffect(() => {
    setCurrentStep(3)
  }, [setCurrentStep])

  return (
    <FunnelFlowBody>
      {generalData && resourcesData && (
        <StepSummary
          isLoadingCreate={loadingCreate}
          isLoadingCreateAndDeploy={loadingCreateAndDeploy}
          onSubmit={onSubmit}
          onPrevious={onBack}
          generalData={generalData}
          resourcesData={resourcesData}
          gotoResources={gotoResources}
          gotoGlobalInformation={gotoGlobalInformations}
        />
      )}
    </FunnelFlowBody>
  )
}

export default StepSummaryFeature
