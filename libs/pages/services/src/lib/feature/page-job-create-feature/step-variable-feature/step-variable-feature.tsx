import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { FlowCreateVariable } from '@qovery/shared/console-shared'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { FlowVariableData, VariableData } from '@qovery/shared/interfaces'
import {
  SERVICES_JOB_CREATION_GENERAL_URL,
  SERVICES_JOB_CREATION_POST_URL,
  SERVICES_JOB_CREATION_RESOURCES_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { FunnelFlowBody, FunnelFlowHelpCard } from '@qovery/shared/ui'
import { computeAvailableScope, useDocumentTitle } from '@qovery/shared/utils'
import { useJobContainerCreateContext } from '../page-job-create-feature'

export function StepVariableFeature() {
  useDocumentTitle('Environment Variable - Create Job')
  const { setCurrentStep, generalData, setVariableData, variableData, jobURL, jobType } = useJobContainerCreateContext()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const navigate = useNavigate()
  const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${jobURL}`
  const [availableScopes] = useState<APIVariableScopeEnum[]>(computeAvailableScope(undefined, false, jobType))

  useEffect(() => {
    !generalData?.name &&
      jobURL &&
      navigate(`${SERVICES_URL(organizationId, projectId, environmentId)}${jobURL}` + SERVICES_JOB_CREATION_GENERAL_URL)
  }, [generalData, navigate, environmentId, organizationId, projectId, jobURL])

  const funnelCardHelp = (
    <FunnelFlowHelpCard
      title={`${jobType === ServiceTypeEnum.CRON_JOB ? 'Cron' : 'Lifecycle'} job variables`}
      items={[
        'Define the environment variables required by your job',
        'Note: variables declared in this screen are injected together with the one already defined within your environment (see environment variables section)',
        'Any additional environment variable can be added later from the environment variable section',
      ]}
    />
  )
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
    setCurrentStep(4)
  }, [setCurrentStep, variableData])

  return (
    <FunnelFlowBody helpSection={funnelCardHelp}>
      <FormProvider {...methods}>
        <FlowCreateVariable
          availableScopes={availableScopes}
          onBack={onBack}
          onSubmit={onSubmit}
          onAdd={onAddPort}
          onRemove={removePort}
          variables={variables}
        />
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepVariableFeature
