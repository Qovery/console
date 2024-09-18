import { useFeatureFlagEnabled } from 'posthog-js/react'
import { type DatabaseTypeEnum } from 'qovery-typescript-axios'
import { createContext, useContext, useEffect, useState } from 'react'
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { AssistantTrigger } from '@qovery/shared/assistant/feature'
import {
  SERVICES_DATABASE_CREATION_GENERAL_URL,
  SERVICES_DATABASE_CREATION_URL,
  SERVICES_DATABASE_TEMPLATE_CREATION_URL,
  SERVICES_GENERAL_URL,
  SERVICES_NEW_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { FunnelFlow } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { ROUTER_SERVICE_DATABASE_CREATION } from '../../router/router'
import { findTemplateData } from '../page-job-create-feature/page-job-create-feature'
import { type GeneralData, type ResourcesData } from './database-creation-flow.interface'

export interface DatabaseCreateContextInterface {
  currentStep: number
  setCurrentStep: (step: number) => void
  generalData: GeneralData | undefined
  setGeneralData: (data: GeneralData) => void
  resourcesData: ResourcesData | undefined
  setResourcesData: (data: ResourcesData) => void
  creationFlowUrl?: string
}

export const DatabaseCreateContext = createContext<DatabaseCreateContextInterface | undefined>(undefined)

// this is to avoid to set initial value twice https://stackoverflow.com/questions/49949099/react-createcontext-point-of-defaultvalue
export const useDatabaseCreateContext = () => {
  const databaseCreateContext = useContext(DatabaseCreateContext)
  if (!databaseCreateContext) throw new Error('useDatabaseCreateContext must be used within a DatabaseCreateContext')
  return databaseCreateContext
}

export const steps: { title: string }[] = [
  { title: 'Create new database' },
  { title: 'Set resources' },
  { title: 'Install new database' },
]

export function PageDatabaseCreateFeature() {
  const { organizationId = '', projectId = '', environmentId = '', slug, option } = useParams()
  // values and setters for context initialization
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [generalData, setGeneralData] = useState<GeneralData>()
  const [resourcesData, setResourcesData] = useState<ResourcesData | undefined>({
    memory: 512,
    cpu: 500,
    storage: 10,
  })

  const navigate = useNavigate()

  useDocumentTitle('Creation - Service')

  const path = slug && option ? SERVICES_DATABASE_TEMPLATE_CREATION_URL(slug, option) : SERVICES_DATABASE_CREATION_URL
  const creationFlowUrl = SERVICES_URL(organizationId, projectId, environmentId) + path

  const flagEnabled = useFeatureFlagEnabled('service-dropdown-list')
  const templateData = findTemplateData(slug, option)

  // Sync general data with frontend template data
  useEffect(() => {
    if (templateData) {
      setGeneralData((generalData) => ({
        ...(generalData ?? {}),
        description: '',
        name: templateData.slug ?? '',
        type: slug?.toUpperCase() as DatabaseTypeEnum,
        mode: templateData.slug === 'managed' ? 'MANAGED' : 'CONTAINER',
        version: '',
        icon_uri: templateData.icon_uri,
      }))
    }
  }, [templateData, setGeneralData])

  return (
    <DatabaseCreateContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        generalData,
        setGeneralData,
        resourcesData,
        setResourcesData,
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
        totalSteps={3}
        currentStep={currentStep}
        currentTitle={steps[currentStep - 1].title}
      >
        <Routes>
          {ROUTER_SERVICE_DATABASE_CREATION.map((route) => (
            <Route key={route.path} path={route.path} element={route.component} />
          ))}
          {creationFlowUrl && (
            <Route
              path="*"
              element={<Navigate replace to={creationFlowUrl + SERVICES_DATABASE_CREATION_GENERAL_URL} />}
            />
          )}
        </Routes>
        <AssistantTrigger defaultOpen />
      </FunnelFlow>
    </DatabaseCreateContext.Provider>
  )
}

export default PageDatabaseCreateFeature
