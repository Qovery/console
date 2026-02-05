import { type APIVariableScopeEnum } from 'qovery-typescript-axios'
import { useEffect, useMemo } from 'react'
import { FormProvider, useFieldArray } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { FlowCreateVariable } from '@qovery/domains/variables/feature'
import {
  SERVICES_APPLICATION_CREATION_URL,
  SERVICES_CREATION_HEALTHCHECKS_URL,
  SERVICES_CREATION_PORTS_URL,
  SERVICES_CREATION_POST_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { FunnelFlowBody } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { computeAvailableScope } from '@qovery/shared/util-js'
import { useApplicationContainerCreateContext } from '../page-application-create-feature'

export function StepVariableFeature() {
  useDocumentTitle('Environment Variable - Create Application')
  const { setCurrentStep, variablesForm, portData, generalData } = useApplicationContainerCreateContext()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const navigate = useNavigate()
  const pathCreate = SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_APPLICATION_CREATION_URL

  // Compute available scopes based on the service type (APPLICATION or CONTAINER)
  const serviceType = generalData?.serviceType === 'APPLICATION' ? 'APPLICATION' : 'CONTAINER'
  const availableScopes = useMemo<APIVariableScopeEnum[]>(
    () => computeAvailableScope(undefined, false, serviceType),
    [serviceType]
  )

  useEffect(() => {
    setCurrentStep(5)
  }, [setCurrentStep])
  const { fields, append, remove } = useFieldArray({
    control: variablesForm.control,
    name: 'variables',
  })

  const onAddPort = () => {
    // Determine scope: if serviceType is APPLICATION use APPLICATION, otherwise use CONTAINER
    const isApplication = generalData?.serviceType === 'APPLICATION'
    const scope = isApplication ? 'APPLICATION' : 'CONTAINER'

    append({
      variable: '',
      isSecret: false,
      value: '',
      scope,
    })
  }

  const onSubmit = variablesForm.handleSubmit(() => navigate(pathCreate + SERVICES_CREATION_POST_URL))

  const onBack = () => {
    if (portData?.ports && portData.ports.length > 0) {
      navigate(pathCreate + SERVICES_CREATION_HEALTHCHECKS_URL)
    } else {
      navigate(pathCreate + SERVICES_CREATION_PORTS_URL)
    }
  }

  return (
    <FunnelFlowBody>
      <FormProvider {...variablesForm}>
        <FlowCreateVariable
          availableScopes={availableScopes}
          onBack={onBack}
          onSubmit={onSubmit}
          onAdd={onAddPort}
          onRemove={(index) => remove(index)}
          variables={fields}
        />
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepVariableFeature
