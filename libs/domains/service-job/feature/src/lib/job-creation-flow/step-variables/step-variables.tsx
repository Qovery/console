import { useNavigate } from '@tanstack/react-router'
import { useParams } from '@tanstack/react-router'
import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { FlowCreateVariable } from '@qovery/domains/variables/feature'
import { type FlowVariableData, type VariableData } from '@qovery/shared/interfaces'
import { FunnelFlowBody } from '@qovery/shared/ui'
import { computeAvailableScope } from '@qovery/shared/util-js'
import { useJobCreateContext } from '../job-creation-flow'

export function StepVariables() {
  const { setCurrentStep, generalData, setVariableData, variableData, jobURL, jobType, templateType } =
    useJobCreateContext()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  const navigate = useNavigate()
  const [availableScopes] = useState<APIVariableScopeEnum[]>(computeAvailableScope(undefined, false, jobType))

  useEffect(() => {
    !generalData?.name &&
      jobURL &&
      navigate({
        to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/lifecycle-job/general',
        params: { organizationId, projectId, environmentId },
      })
  }, [generalData, navigate, environmentId, organizationId, projectId, jobURL])

  const methods = useForm<FlowVariableData>({
    defaultValues: variableData,
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit((data) => {
    setVariableData(data)
    navigate({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/lifecycle-job/summary',
      params: { organizationId, projectId, environmentId },
    })
  })

  const onBack = () => {
    navigate({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/lifecycle-job/resources',
      params: { organizationId, projectId, environmentId },
    })
  }

  const [variables, setVariables] = useState(methods.getValues().variables)

  const onAddPort = () => {
    const newVariableRow: VariableData = {
      variable: '',
      isSecret: false,
      value: '',
      scope: APIVariableScopeEnum.JOB,
    }
    if (variables.length) {
      setVariables([...variables, newVariableRow])
      methods.setValue(`variables.${variables.length}`, newVariableRow)
    } else {
      setVariables([newVariableRow])
      methods.setValue(`variables.0`, newVariableRow)
    }
  }

  const removePort = (index: number) => {
    const newVariables = methods.getValues().variables
    newVariables.splice(index, 1)
    setVariables(newVariables)
    methods.reset({ variables: newVariables })
  }

  useEffect(() => {
    setCurrentStep(5)
  }, [setCurrentStep, variableData])

  return (
    <FunnelFlowBody>
      <FormProvider {...methods}>
        <FlowCreateVariable
          availableScopes={availableScopes}
          onBack={onBack}
          onSubmit={onSubmit}
          onAdd={onAddPort}
          onRemove={removePort}
          variables={variables}
          templateType={templateType}
        />
      </FormProvider>
    </FunnelFlowBody>
  )
}
