import { DatabaseModeEnum } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import {
  SERVICES_DATABASE_CREATION_GENERAL_URL,
  SERVICES_DATABASE_CREATION_POST_URL,
  SERVICES_DATABASE_CREATION_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { FunnelFlowBody } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import StepResources from '../../../ui/page-database-create/step-resources/step-resources'
import { type ResourcesData } from '../database-creation-flow.interface'
import { useDatabaseCreateContext } from '../page-database-create-feature'

export function StepResourcesFeature() {
  useDocumentTitle('Resources - Create Database')
  const { setCurrentStep, resourcesData, setResourcesData, generalData, creationFlowUrl } = useDatabaseCreateContext()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    !generalData?.name &&
      navigate(
        `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_DATABASE_CREATION_URL}` +
          SERVICES_DATABASE_CREATION_GENERAL_URL
      )
  }, [generalData, navigate, environmentId, organizationId, projectId])

  useEffect(() => {
    setCurrentStep(2)
  }, [setCurrentStep])

  const methods = useForm<ResourcesData>({
    defaultValues: resourcesData,
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit((data) => {
    setResourcesData(data)
    navigate(creationFlowUrl + SERVICES_DATABASE_CREATION_POST_URL)
  })

  const onBack = () => {
    navigate(creationFlowUrl + SERVICES_DATABASE_CREATION_GENERAL_URL)
  }

  return (
    <FunnelFlowBody>
      <FormProvider {...methods}>
        <StepResources
          isManaged={generalData?.mode === DatabaseModeEnum.MANAGED}
          onBack={onBack}
          onSubmit={onSubmit}
          databaseType={generalData?.type}
        />
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepResourcesFeature
