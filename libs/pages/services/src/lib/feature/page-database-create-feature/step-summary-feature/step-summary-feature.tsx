import { DatabaseModeEnum, type DatabaseRequest } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAnnotationsGroups } from '@qovery/domains/organizations/feature'
import { useCreateService, useDeployService } from '@qovery/domains/services/feature'
import {
  SERVICES_DATABASE_CREATION_GENERAL_URL,
  SERVICES_DATABASE_CREATION_RESOURCES_URL,
  SERVICES_DATABASE_CREATION_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { FunnelFlowBody } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
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
  const { data: annotationsGroup = [] } = useAnnotationsGroups({ organizationId })

  const { mutateAsync: createDatabase } = useCreateService()
  const { mutate: deployDatabase } = useDeployService({ environmentId })

  const gotoGlobalInformations = () => {
    navigate(pathCreate + SERVICES_DATABASE_CREATION_GENERAL_URL)
  }

  const gotoResources = () => {
    navigate(pathCreate + SERVICES_DATABASE_CREATION_RESOURCES_URL)
  }

  useEffect(() => {
    !generalData?.name && gotoGlobalInformations()
  }, [generalData, navigate, environmentId, organizationId, projectId, gotoGlobalInformations])

  const onSubmit = async (withDeploy: boolean) => {
    if (generalData && resourcesData) {
      if (withDeploy) setLoadingCreateAndDeploy(true)
      else setLoadingCreate(true)

      const memory = Number(resourcesData['memory'])
      const storage = Number(resourcesData['storage'])
      const cpu = resourcesData['cpu']

      const databaseRequest: DatabaseRequest = {
        name: generalData.name,
        description: generalData.description || '',
        type: generalData.type,
        version: generalData.version,
        accessibility: generalData.accessibility,
        mode: generalData.mode,
        storage: storage,
        annotations_groups: annotationsGroup.filter((group) => generalData.annotations_groups?.includes(group.id)),
      }

      if (databaseRequest.mode !== DatabaseModeEnum.MANAGED) {
        databaseRequest.cpu = cpu
        databaseRequest.memory = memory
      } else {
        databaseRequest.instance_type = resourcesData.instance_type
      }

      try {
        const database = await createDatabase({
          environmentId: environmentId,
          payload: {
            serviceType: 'DATABASE',
            ...databaseRequest,
          },
        })

        if (withDeploy) {
          deployDatabase({
            serviceId: database.id,
            serviceType: 'DATABASE',
          })
          setLoadingCreateAndDeploy(false)
        }
        setLoadingCreate(false)
        navigate(SERVICES_URL(organizationId, projectId, environmentId))
      } catch (error) {
        console.error(error)
        setLoadingCreateAndDeploy(false)
        setLoadingCreate(false)
      }
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
          onPrevious={gotoResources}
          generalData={generalData}
          resourcesData={resourcesData}
          gotoResources={gotoResources}
          gotoGlobalInformation={gotoGlobalInformations}
          annotationsGroup={annotationsGroup}
          isManaged={generalData.mode === DatabaseModeEnum.MANAGED}
        />
      )}
    </FunnelFlowBody>
  )
}

export default StepSummaryFeature
