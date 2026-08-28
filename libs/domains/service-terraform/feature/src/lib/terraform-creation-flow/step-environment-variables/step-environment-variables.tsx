import { useNavigate, useParams } from '@tanstack/react-router'
import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { FormProvider, useWatch } from 'react-hook-form'
import { FlowCreateVariable } from '@qovery/domains/variables/feature'
import { type VariableData } from '@qovery/shared/interfaces'
import { FunnelFlowBody } from '@qovery/shared/ui'
import { computeAvailableScope } from '@qovery/shared/util-js'
import { useTerraformCreateContext } from '../../hooks/use-terraform-create-context/use-terraform-create-context'

const availableScopes = computeAvailableScope(undefined, false, 'TERRAFORM')

export const TerraformStepEnvironmentVariables = () => {
  const navigate = useNavigate()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  const { setCurrentStep, variablesForm } = useTerraformCreateContext()
  const variables = useWatch({ control: variablesForm.control, name: 'variables' })

  useEffect(() => {
    setCurrentStep(3)
  }, [setCurrentStep])

  const onAdd = (isSecret = false) => {
    const currentVariables = variablesForm.getValues('variables')
    const variable: VariableData = {
      variable: '',
      value: '',
      scope: APIVariableScopeEnum.TERRAFORM,
      isSecret,
    }
    variablesForm.setValue(`variables.${currentVariables.length}`, variable)
  }

  const onRemove = (index: number) => {
    const nextVariables = variablesForm.getValues('variables').filter((_, variableIndex) => variableIndex !== index)
    variablesForm.setValue('variables', nextVariables, { shouldValidate: true })
  }

  const onSubmit = variablesForm.handleSubmit(() => {
    navigate({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/terraform/input-variables',
      params: { organizationId, projectId, environmentId },
    })
  })

  return (
    <FunnelFlowBody customContentWidth="max-w-[1024px]">
      <FormProvider {...variablesForm}>
        <FlowCreateVariable
          availableScopes={availableScopes}
          onBack={() =>
            navigate({
              to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/terraform/terraform-configuration',
              params: { organizationId, projectId, environmentId },
            })
          }
          onSubmit={onSubmit}
          onAdd={onAdd}
          onRemove={onRemove}
          variables={variables}
          templateType="TERRAFORM"
          allowEmpty
        />
      </FormProvider>
    </FunnelFlowBody>
  )
}
