import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { FlowCreateVariable } from '@qovery/domains/variables/feature'
import { type FlowVariableData, type VariableData } from '@qovery/shared/interfaces'
import {
  SERVICES_JOB_CREATION_GENERAL_URL,
  SERVICES_JOB_CREATION_POST_URL,
  SERVICES_JOB_CREATION_RESOURCES_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { FunnelFlowBody } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { computeAvailableScope } from '@qovery/shared/util-js'
import { useJobContainerCreateContext } from '../page-job-create-feature'

export function StepVariableFeature() {
  useDocumentTitle('Environment Variable - Create Job')
  const { setCurrentStep, generalData, setVariableData, variableData, jobURL, jobType, templateType } =
    useJobContainerCreateContext()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const navigate = useNavigate()
  const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${jobURL}`
  const [availableScopes] = useState<APIVariableScopeEnum[]>(computeAvailableScope(undefined, false, jobType))

  useEffect(() => {
    !generalData?.name &&
      jobURL &&
      navigate(`${SERVICES_URL(organizationId, projectId, environmentId)}${jobURL}` + SERVICES_JOB_CREATION_GENERAL_URL)
  }, [generalData, navigate, environmentId, organizationId, projectId, jobURL])

  const methods = useForm<FlowVariableData>({
    defaultValues: variableData,
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit((data) => {
    setVariableData(data)
    navigate(pathCreate + SERVICES_JOB_CREATION_POST_URL)
  })

  const onBack = () => {
    navigate(pathCreate + SERVICES_JOB_CREATION_RESOURCES_URL)
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

export default StepVariableFeature
