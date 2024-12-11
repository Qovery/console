import { useFeatureFlagEnabled } from 'posthog-js/react'
import { createContext, useContext, useEffect, useState } from 'react'
import { type UseFormReturn, useForm } from 'react-hook-form'
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { AssistantTrigger } from '@qovery/shared/assistant/feature'
import {
  type ApplicationGeneralData,
  type ApplicationResourcesData,
  type FlowPortData,
  type FlowVariableData,
} from '@qovery/shared/interfaces'
import {
  SERVICES_APPLICATION_CREATION_URL,
  SERVICES_APPLICATION_TEMPLATE_CREATION_URL,
  SERVICES_CREATION_GENERAL_URL,
  SERVICES_GENERAL_URL,
  SERVICES_NEW_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { FunnelFlow } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { ROUTER_SERVICE_CREATION } from '../../router/router'
import { findTemplateData } from '../page-job-create-feature/page-job-create-feature'

export interface ApplicationContainerCreateContextInterface {
  currentStep: number
  setCurrentStep: (step: number) => void
  generalData: ApplicationGeneralData | undefined
  setGeneralData: (data: ApplicationGeneralData) => void
  resourcesData: ApplicationResourcesData | undefined
  setResourcesData: (data: ApplicationResourcesData) => void
  portData: FlowPortData | undefined
  setPortData: (data: FlowPortData) => void
  creationFlowUrl?: string

  /* 
    XXX: Using a new format for storage steps (need to refactor other steps)
    Similar to the Helm creation flow context
  */
  variablesForm: UseFormReturn<FlowVariableData>
}

export const ApplicationContainerCreateContext = createContext<ApplicationContainerCreateContextInterface | undefined>(
  undefined
)

// this is to avoid to set initial value twice https://stackoverflow.com/questions/49949099/react-createcontext-point-of-defaultvalue
export const useApplicationContainerCreateContext = () => {
  const applicationContainerCreateContext = useContext(ApplicationContainerCreateContext)
  if (!applicationContainerCreateContext)
    throw new Error('useApplicationContainerCreateContext must be used within a ApplicationContainerCreateContext')
  return applicationContainerCreateContext
}

export const steps: { title: string }[] = [
  { title: 'Create new application' },
  { title: 'Set resources' },
  { title: 'Set port' },
  { title: 'Set health checks' },
  { title: 'Set variables' },
  { title: 'Ready to install' },
]

export function PageApplicationCreateFeature() {
  const { organizationId = '', projectId = '', environmentId = '', slug, option } = useParams()

  // Deprecated: `values and setters for context initialization`, using directly `useForm` to init form
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [generalData, setGeneralData] = useState<ApplicationGeneralData | undefined>()
  const [resourcesData, setResourcesData] = useState<ApplicationResourcesData | undefined>({
    memory: 512,
    cpu: 500,
    min_running_instances: 1,
    max_running_instances: 2,
  })

  const variablesForm = useForm<FlowVariableData>({
    defaultValues: {
      variables: [],
    },
    mode: 'onChange',
  })

  const [portData, setPortData] = useState<FlowPortData | undefined>({
    ports: [],
    healthchecks: undefined,
  })

  const navigate = useNavigate()

  useDocumentTitle('Creation - Service')

  const path =
    slug && option ? SERVICES_APPLICATION_TEMPLATE_CREATION_URL(slug, option) : SERVICES_APPLICATION_CREATION_URL
  const creationFlowUrl = SERVICES_URL(organizationId, projectId, environmentId) + path

  const flagEnabled = useFeatureFlagEnabled('service-dropdown-list')
  const templateData = findTemplateData(slug, option)

  // Sync general data with frontend template data
  useEffect(() => {
    if (templateData) {
      setGeneralData((generalData) => ({
        ...(generalData ?? {}),
        auto_deploy: true,
        description: '',
        name: templateData.slug ?? '',
        serviceType: option === 'container' ? 'CONTAINER' : 'APPLICATION',
        icon_uri: templateData.icon_uri,
      }))
    }
  }, [templateData, setGeneralData])

  return (
    <ApplicationContainerCreateContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        generalData,
        setGeneralData,
        resourcesData,
        setResourcesData,
        portData,
        setPortData,
        creationFlowUrl,
        variablesForm,
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
          {ROUTER_SERVICE_CREATION.map((route) => (
            <Route key={route.path} path={route.path} element={route.component} />
          ))}
          {creationFlowUrl && (
            <Route path="*" element={<Navigate replace to={creationFlowUrl + SERVICES_CREATION_GENERAL_URL} />} />
          )}
        </Routes>
        <AssistantTrigger defaultOpen />
      </FunnelFlow>
    </ApplicationContainerCreateContext.Provider>
  )
}

export default PageApplicationCreateFeature
