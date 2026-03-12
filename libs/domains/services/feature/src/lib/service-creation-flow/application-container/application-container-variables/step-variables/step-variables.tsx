import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { type APIVariableScopeEnum } from 'qovery-typescript-axios'
import { useEffect, useMemo } from 'react'
import { FormProvider, useFieldArray } from 'react-hook-form'
import { match } from 'ts-pattern'
import { FlowCreateVariable } from '@qovery/domains/variables/feature'
import { FunnelFlowBody } from '@qovery/shared/ui'
import { computeAvailableScope } from '@qovery/shared/util-js'
import { useApplicationContainerCreateContext } from '../../application-container-creation-flow'

export function ApplicationContainerStepVariables() {
  const { setCurrentStep, variablesForm, portForm, generalForm, creationFlowUrl } =
    useApplicationContainerCreateContext()
  const { environmentId = '' } = useParams({ strict: false })
  const search = useSearch({ strict: false })
  const navigate = useNavigate()

  const serviceType = generalForm.getValues('serviceType') === 'APPLICATION' ? 'APPLICATION' : 'CONTAINER'
  const availableScopes = useMemo<APIVariableScopeEnum[]>(
    () => computeAvailableScope(undefined, false, serviceType),
    [serviceType]
  )

  const { fields, append, remove } = useFieldArray({
    control: variablesForm.control,
    name: 'variables',
  })

  useEffect(() => {
    setCurrentStep(5)
  }, [setCurrentStep])

  const handleAddVariable = () => {
    const scope = match(generalForm.getValues('serviceType'))
      .with('APPLICATION', () => 'APPLICATION' as const)
      .otherwise(() => 'CONTAINER' as const)

    append({
      variable: '',
      isSecret: false,
      value: '',
      scope,
    })
  }

  const handleSubmit = variablesForm.handleSubmit(() => {
    navigate({ to: `${creationFlowUrl}/summary`, search })
  })

  const handleBack = () => {
    const hasPorts = Boolean(portForm.getValues('ports')?.length)
    navigate({ to: `${creationFlowUrl}/${hasPorts ? 'health-checks' : 'ports'}`, search })
  }

  return (
    <FunnelFlowBody>
      <FormProvider {...variablesForm}>
        <FlowCreateVariable
          availableScopes={availableScopes}
          onBack={handleBack}
          onSubmit={handleSubmit}
          onAdd={handleAddVariable}
          onRemove={remove}
          variables={fields}
        />
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default ApplicationContainerStepVariables
