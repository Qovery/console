import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { type PropsWithChildren, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { FunnelFlow } from '@qovery/shared/ui'
import { TerraformCreateContext } from '../hooks/use-terraform-create-context/use-terraform-create-context'
import { type TerraformGeneralData } from '../terraform-general-data/terraform-general-data'
import { TerraformVariablesProvider } from '../terraform-variables-context'
import { findTerraformTemplateMatch } from './terraform-create-utils/terraform-create-utils'

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
  const { template } = useSearch({ strict: false })
  const templateMatch = findTerraformTemplateMatch(template)

  const generalForm = useForm<TerraformGeneralData>({
    defaultValues: {
      name: templateMatch.templateTitle ?? '',
      description: '',
      icon_uri: templateMatch.iconUri ?? 'app://qovery-console/terraform',
      source_provider: 'GIT',
      dockerfile_fragment_source: 'none',
      auto_deploy: false,
      timeout_sec: '3600',
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
        </FormProvider>
      </FunnelFlow>
    </TerraformCreateContext.Provider>
  )
}
