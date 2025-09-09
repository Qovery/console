import { createContext, useContext, useState } from 'react'
import { type UseFormReturn, useForm } from 'react-hook-form'
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { TERRAFORM_VERSIONS, type TerraformGeneralData } from '@qovery/domains/service-terraform/feature'
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

export const steps: { title: string }[] = [
  { title: 'General information' },
  { title: 'Terraform configuration' },
  { title: 'Values override as arguments' },
  { title: 'Summary' },
]

export interface TerraformInputVariablesData {
  tf_vars: {
    key: string
    value: string
    secret: boolean
  }[]
  tf_var_file_paths: string[]
}

interface TerraformCreateContextInterface {
  currentStep: number
  setCurrentStep: (step: number) => void
  generalForm: UseFormReturn<TerraformGeneralData>
  inputVariablesForm: UseFormReturn<TerraformInputVariablesData>
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
        ram_mib: 512,
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

  const inputVariablesForm = useForm<TerraformInputVariablesData>({
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
        inputVariablesForm,
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
