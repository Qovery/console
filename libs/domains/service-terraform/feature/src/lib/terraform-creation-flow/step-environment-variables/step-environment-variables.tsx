import { useNavigate, useParams } from '@tanstack/react-router'
import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FormProvider } from 'react-hook-form'
import { FlowCreateVariable } from '@qovery/domains/variables/feature'
import { type VariableData } from '@qovery/shared/interfaces'
import { FunnelFlowBody } from '@qovery/shared/ui'
import { computeAvailableScope } from '@qovery/shared/util-js'
import { useTerraformCreateContext } from '../../hooks/use-terraform-create-context/use-terraform-create-context'

export const TerraformStepEnvironmentVariables = () => {
  const navigate = useNavigate()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  const { setCurrentStep, variablesForm } = useTerraformCreateContext()
  const [variables, setVariables] = useState(variablesForm.getValues('variables'))
  const [availableScopes] = useState(() => computeAvailableScope(undefined, false, 'TERRAFORM'))

  useEffect(() => {
    setCurrentStep(3)
  }, [setCurrentStep])

  const onAdd = (isSecret = false) => {
    const variable: VariableData = {
      variable: '',
      value: '',
      scope: APIVariableScopeEnum.TERRAFORM,
      isSecret,
    }
    const nextVariables = [...variables, variable]
    setVariables(nextVariables)
    variablesForm.setValue('variables', nextVariables)
  }

  const onRemove = (index: number) => {
    const nextVariables = variablesForm.getValues('variables').filter((_, variableIndex) => variableIndex !== index)
    setVariables(nextVariables)
    variablesForm.reset({ ...variablesForm.getValues(), variables: nextVariables })
  }

  const onSubmit = variablesForm.handleSubmit(() => {
    navigate({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/terraform/input-variables',
      params: { organizationId, projectId, environmentId },
    })
  })

  return (
    <FunnelFlowBody>
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
        />
      </FormProvider>
    </FunnelFlowBody>
  )
}
