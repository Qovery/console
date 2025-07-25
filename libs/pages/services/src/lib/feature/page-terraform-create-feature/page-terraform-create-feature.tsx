import { type GitProviderEnum, type GitTokenResponse, type TerraformRequest } from 'qovery-typescript-axios'
import { createContext, useContext, useState } from 'react'
import { type UseFormReturn, useForm } from 'react-hook-form'
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { type TerraformValuesArgumentsData } from '@qovery/domains/service-terraform/feature'
import { AssistantTrigger } from '@qovery/shared/assistant/feature'
import {
  SERVICES_NEW_URL,
  SERVICES_TERRAFORM_CREATION_GENERAL_URL,
  SERVICES_TERRAFORM_CREATION_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { FunnelFlow } from '@qovery/shared/ui'
import { ROUTER_SERVICE_TERRAFORM_CREATION } from '../../router/router'
import { serviceTemplates } from '../page-new-feature/service-templates'

export const TERRAFORM_VERSIONS = [
  '1.12.1',
  '1.11.4',
  '1.10.5',
  '1.9.8',
  '1.8.5',
  '1.7.5',
  '1.6.6',
  '1.5.7',
  '1.4.7',
  '1.3.10',
  '1.2.9',
  '1.1.9',
  '1.0.11',
  '0.15.5',
  '0.14.11',
  '0.13.7',
  '0.12.31',
  '0.11.15',
  '0.10.8',
  '0.9.11',
  '0.8.8',
  '0.7.13',
  '0.6.16',
  '0.5.3',
  '0.4.2',
  '0.3.7',
  '0.2.2',
  '0.1.1',
]
export const steps: { title: string }[] = [
  { title: 'General information' },
  { title: 'Terraform configuration' },
  { title: 'Values override as arguments' },
  { title: 'Summary' },
]
export interface TerraformGeneralData
  extends Omit<TerraformRequest, 'source' | 'ports' | 'values_override' | 'arguments' | 'timeout_sec' | 'provider'> {
  source_provider: 'GIT'
  repository: string
  is_public_repository?: boolean
  provider?: keyof typeof GitProviderEnum
  git_token_id?: GitTokenResponse['id']
  branch?: string
  root_path?: string
  chart_name?: string
  chart_version?: string
  arguments: string
  timeout_sec: string
  state: 'kubernetes'
  provider_version: {
    read_from_terraform_block: boolean
    explicit_version: string
  }
}

interface TerraformCreateContextInterface {
  currentStep: number
  setCurrentStep: (step: number) => void
  generalForm: UseFormReturn<TerraformGeneralData>
  valuesOverrideArgumentsForm: UseFormReturn<TerraformValuesArgumentsData>
  creationFlowUrl?: string
}

export const TerraformCreateContext = createContext<TerraformCreateContextInterface | undefined>(undefined)

// this is to avoid to set initial value twice https://stackoverflow.com/questions/49949099/react-createcontext-point-of-defaultvalue
export const useTerraformCreateContext = () => {
  const terraformCreateContext = useContext(TerraformCreateContext)
  if (!terraformCreateContext) throw new Error('useTerraformCreateContext must be used within a TerraformCreateContext')
  return terraformCreateContext
}

export function PageTerraformCreateFeature() {
  const navigate = useNavigate()
  const { organizationId = '', projectId = '', environmentId = '', slug } = useParams()
  const [currentStep, setCurrentStep] = useState<number>(1)

  const dataTemplate = serviceTemplates.find((service) => service.slug === slug)

  const generalForm = useForm<TerraformGeneralData>({
    mode: 'onChange',
    defaultValues: {
      name: dataTemplate?.slug ?? '',
      icon_uri: dataTemplate?.icon_uri ?? 'app://qovery-console/terraform',
      source_provider: 'GIT',
      state: 'kubernetes',
      provider_version: {
        read_from_terraform_block: false,
        explicit_version: TERRAFORM_VERSIONS[0],
      },
      job_resources: {
        cpu_milli: 500,
        ram_mib: 256,
        storage_gib: 1,
      },
      terraform_variables_source: {
        tf_vars: [],
        tf_var_file_paths: [],
      },
      timeout_sec: '60',
      use_cluster_credentials: true,
    },
  })

  const valuesOverrideArgumentsForm = useForm<TerraformValuesArgumentsData>({
    mode: 'onChange',
    defaultValues: {
      tf_vars: [],
      tf_var_file_paths: [],
    },
  })

  const creationFlowUrl = SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_TERRAFORM_CREATION_URL

  return (
    <TerraformCreateContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        generalForm,
        valuesOverrideArgumentsForm,
        creationFlowUrl,
      }}
    >
      <FunnelFlow
        onExit={() => {
          if (window.confirm('Do you really want to leave?')) {
            const link = `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_NEW_URL}`
            navigate(link)
          }
        }}
        totalSteps={steps.length}
        currentStep={currentStep}
        currentTitle={steps[currentStep - 1].title}
      >
        <Routes>
          {ROUTER_SERVICE_TERRAFORM_CREATION.map((route) => (
            <Route key={route.path} path={route.path} element={route.component} />
          ))}
          {creationFlowUrl && (
            <Route
              path="*"
              element={<Navigate replace to={`${creationFlowUrl}${SERVICES_TERRAFORM_CREATION_GENERAL_URL}`} />}
            />
          )}
        </Routes>
        <AssistantTrigger defaultOpen />
      </FunnelFlow>
    </TerraformCreateContext.Provider>
  )
}

export default PageTerraformCreateFeature
