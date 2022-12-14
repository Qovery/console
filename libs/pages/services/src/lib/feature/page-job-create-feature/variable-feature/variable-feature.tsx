import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { FlowCreateVariable } from '@qovery/shared/console-shared'
import { FlowVariableData, VariableData } from '@qovery/shared/interfaces'
import {
  SERVICES_CREATION_GENERAL_URL,
  SERVICES_JOB_CREATION_POST_URL,
  SERVICES_JOB_CREATION_RESOURCES_URL,
  SERVICES_URL,
} from '@qovery/shared/router'
import { FunnelFlowBody, FunnelFlowHelpCard } from '@qovery/shared/ui'
import { computeAvailableScope, useDocumentTitle } from '@qovery/shared/utils'
import { useJobContainerCreateContext } from '../page-job-create-feature'

export function VariableFeature() {
  useDocumentTitle('Environment Variable - Create Job')
  const { setCurrentStep, generalData, setVariableData, variableData, jobURL } = useJobContainerCreateContext()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const navigate = useNavigate()
  const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${jobURL}`
  const [availableScopes] = useState<APIVariableScopeEnum[]>(computeAvailableScope())

  useEffect(() => {
    return

    !generalData?.name && navigate(pathCreate + SERVICES_CREATION_GENERAL_URL)
  }, [generalData, navigate, environmentId, organizationId, projectId, pathCreate])

  const funnelCardHelp = (
    <FunnelFlowHelpCard
      title="Configuring the application port"
      items={[
        'Declare the ports used internally by your application',
        'Declared ports are accessible from other applications within the same environment',
        'You can also expose them on the internet by making them public.',
        'Declared ports are also used to check the liveness/readiness of your application.',
      ]}
      helpSectionProps={{
        description: 'This is still a description',
        links: [
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/application/#ports',
            linkLabel: 'How to configure my application',
            external: true,
          },
          { link: 'https://discuss.qovery.com/', linkLabel: 'Still need help? Ask on our Forum', external: true },
        ],
      }}
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
    const newVariableRow: VariableData = { variable: undefined, isSecret: false, value: undefined, scope: undefined }
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
    if (variableData?.variables?.length === 0) {
      onAddPort()
    }
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

export default VariableFeature
