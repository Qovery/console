import { type APIVariableScopeEnum } from 'qovery-typescript-axios'
import { useEffect, useMemo } from 'react'
import { FormProvider, useFieldArray } from 'react-hook-form'
import { match } from 'ts-pattern'
import { FlowCreateVariable } from '@qovery/domains/variables/feature'
import { FunnelFlowBody } from '@qovery/shared/ui'
import { computeAvailableScope } from '@qovery/shared/util-js'
import { useApplicationContainerCreateContext } from '../../application-container-creation-flow'

export interface ApplicationContainerStepVariablesProps {
  onBack: () => void
  onSubmit: () => void | Promise<void>
}

export function ApplicationContainerStepVariables({ onBack, onSubmit }: ApplicationContainerStepVariablesProps) {
  const { setCurrentStep, variablesForm, generalForm } = useApplicationContainerCreateContext()

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

  const handleSubmit = variablesForm.handleSubmit(async () => onSubmit())

  return (
    <FunnelFlowBody>
      <FormProvider {...variablesForm}>
        <FlowCreateVariable
          availableScopes={availableScopes}
          onBack={onBack}
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
