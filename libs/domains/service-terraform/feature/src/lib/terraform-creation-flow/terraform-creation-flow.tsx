import { useNavigate, useParams } from '@tanstack/react-router'
import { type PropsWithChildren, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { type TerraformGeneralData } from '@qovery/domains/service-settings/feature'
import { AssistantTrigger } from '@qovery/shared/assistant/feature'
import { FunnelFlow } from '@qovery/shared/ui'
import { TerraformCreateContext } from '../hooks/use-terraform-create-context/use-terraform-create-context'
import { TerraformVariablesProvider } from '../terraform-variables-context'

export interface TerraformCreationFlowProps extends PropsWithChildren {
  creationFlowUrl: string
}

export const terraformCreationSteps: { title: string }[] = [
  { title: 'General information' },
  { title: 'Terraform configuration' },
  { title: 'Terraform variables' },
  { title: 'Summary' },
]

export const TerraformCreationFlow = ({ children, creationFlowUrl }: TerraformCreationFlowProps) => {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)

  const generalForm = useForm<TerraformGeneralData>({
    defaultValues: {
      name: '',
      description: '',
      icon_uri: 'app://qovery-console/terraform',
      source_provider: 'GIT',
      dockerfile_fragment_source: 'none',
      auto_deploy: false,
      timeout_sec: '60',
      backend: {
        kubernetes: {},
      },
      terraform_variables_source: {
        tf_var_file_paths: [],
        tf_vars: [],
      },
      engine: 'TERRAFORM',
      provider_version: {
        read_from_terraform_block: false,
        explicit_version: '1.13',
      },
      job_resources: {
        cpu_milli: 500,
        ram_mib: 256,
        storage_gib: 5,
        gpu: 0,
      },
      use_cluster_credentials: true,
      action_extra_arguments: {},
    },
    mode: 'onChange',
  })

  return (
    <TerraformCreateContext.Provider value={{ currentStep, setCurrentStep, generalForm, creationFlowUrl }}>
      <FunnelFlow
        onExit={() => {
          if (window.confirm('Do you really want to leave?')) {
            navigate({
              to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/new',
              params: {
                organizationId,
                projectId,
                environmentId,
              },
            })
          }
        }}
        totalSteps={terraformCreationSteps.length}
        currentStep={currentStep}
        currentTitle={terraformCreationSteps[currentStep - 1]?.title}
      >
        <FormProvider {...generalForm}>
          <TerraformVariablesProvider>{children}</TerraformVariablesProvider>
          <AssistantTrigger defaultOpen />
        </FormProvider>
      </FunnelFlow>
    </TerraformCreateContext.Provider>
  )
}
