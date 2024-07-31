import { useFeatureFlagEnabled } from 'posthog-js/react'
import { type GitProviderEnum, type GitTokenResponse, type HelmRequest } from 'qovery-typescript-axios'
import { createContext, useContext, useState } from 'react'
import { type UseFormReturn, useForm } from 'react-hook-form'
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { type HelmValuesArgumentsData, type HelmValuesFileData } from '@qovery/domains/service-helm/feature'
import { AssistantTrigger } from '@qovery/shared/assistant/feature'
import {
  SERVICES_GENERAL_URL,
  SERVICES_HELM_CREATION_GENERAL_URL,
  SERVICES_HELM_CREATION_URL,
  SERVICES_HELM_TEMPLATE_CREATION_URL,
  SERVICES_NEW_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { FunnelFlow } from '@qovery/shared/ui'
import { ROUTER_SERVICE_HELM_CREATION } from '../../router/router'
import { serviceTemplates } from '../page-new-feature/service-templates'

export const steps: { title: string }[] = [
  { title: 'General data' },
  { title: 'Values override as file' },
  { title: 'Values override as arguments' },
  { title: 'Summary' },
]
export interface HelmGeneralData
  extends Omit<HelmRequest, 'source' | 'ports' | 'values_override' | 'arguments' | 'timeout_sec'> {
  source_provider: 'HELM_REPOSITORY' | 'GIT'
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
}

interface HelmCreateContextInterface {
  currentStep: number
  setCurrentStep: (step: number) => void
  generalForm: UseFormReturn<HelmGeneralData>
  valuesOverrideFileForm: UseFormReturn<HelmValuesFileData>
  valuesOverrideArgumentsForm: UseFormReturn<HelmValuesArgumentsData>
  creationFlowUrl?: string
}

export const HelmCreateContext = createContext<HelmCreateContextInterface | undefined>(undefined)

// this is to avoid to set initial value twice https://stackoverflow.com/questions/49949099/react-createcontext-point-of-defaultvalue
export const useHelmCreateContext = () => {
  const helmCreateContext = useContext(HelmCreateContext)
  if (!helmCreateContext) throw new Error('useHelmCreateContext must be used within a HelmCreateContext')
  return helmCreateContext
}

export function PageHelmCreateFeature() {
  const navigate = useNavigate()
  const { organizationId = '', projectId = '', environmentId = '', slug, option } = useParams()
  const [currentStep, setCurrentStep] = useState<number>(1)

  const dataTemplate = serviceTemplates.find((service) => service.slug === slug)

  const generalForm = useForm<HelmGeneralData>({
    mode: 'onChange',
    defaultValues: {
      name: dataTemplate?.slug ?? '',
      icon_uri: dataTemplate?.icon_uri ?? 'app://qovery-console/helm',
    },
  })

  const valuesOverrideFileForm = useForm<HelmValuesFileData>({
    mode: 'onChange',
    defaultValues: {
      type: 'GIT_REPOSITORY',
    },
  })

  const valuesOverrideArgumentsForm = useForm<HelmValuesArgumentsData>({
    mode: 'onChange',
  })

  const path = slug && option ? SERVICES_HELM_TEMPLATE_CREATION_URL(slug, option) : SERVICES_HELM_CREATION_URL
  const creationFlowUrl = SERVICES_URL(organizationId, projectId, environmentId) + path

  const flagEnabled = useFeatureFlagEnabled('service-dropdown-list')

  return (
    <HelmCreateContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        generalForm,
        valuesOverrideFileForm,
        valuesOverrideArgumentsForm,
        creationFlowUrl,
      }}
    >
      <FunnelFlow
        onExit={() => {
          if (window.confirm('Do you really want to leave?')) {
            const link = `${SERVICES_URL(organizationId, projectId, environmentId)}${
              flagEnabled ? SERVICES_GENERAL_URL : SERVICES_NEW_URL
            }`
            navigate(link)
          }
        }}
        totalSteps={steps.length}
        currentStep={currentStep}
        currentTitle={steps[currentStep - 1].title}
      >
        <Routes>
          {ROUTER_SERVICE_HELM_CREATION.map((route) => (
            <Route key={route.path} path={route.path} element={route.component} />
          ))}
          {creationFlowUrl && (
            <Route path="*" element={<Navigate replace to={creationFlowUrl + SERVICES_HELM_CREATION_GENERAL_URL} />} />
          )}
        </Routes>
        <AssistantTrigger defaultOpen />
      </FunnelFlow>
    </HelmCreateContext.Provider>
  )
}

export default PageHelmCreateFeature
