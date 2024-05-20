import { useFeatureFlagEnabled } from 'posthog-js/react'
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
import { type GeneralData, type ResourcesData } from './database-creation-flow.interface'

export interface DatabaseCreateContextInterface {
  currentStep: number
  setCurrentStep: (step: number) => void
  generalData: GeneralData | undefined
  setGeneralData: (data: GeneralData) => void
  resourcesData: ResourcesData | undefined
  setResourcesData: (data: ResourcesData) => void
  databaseURL?: string
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
  const [databaseURL, setDatabaseURL] = useState<string | undefined>()
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [generalData, setGeneralData] = useState<GeneralData>()
  const [resourcesData, setResourcesData] = useState<ResourcesData | undefined>({
    memory: 512,
    cpu: 500,
    storage: 10,
  })

  const navigate = useNavigate()

  useDocumentTitle('Creation - Service')

  useEffect(() => {
    const servicesUrl = SERVICES_URL(organizationId, projectId, environmentId)
    const path = slug && option ? SERVICES_DATABASE_TEMPLATE_CREATION_URL(slug, option) : SERVICES_DATABASE_CREATION_URL

    setDatabaseURL(servicesUrl + path)
  }, [slug, option, environmentId, projectId, organizationId])

  const flagEnabled = useFeatureFlagEnabled('service-template')

  return (
    <DatabaseCreateContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        generalData,
        setGeneralData,
        resourcesData,
        setResourcesData,
        databaseURL,
      }}
    >
      <FunnelFlow
        onExit={() => {
          const link = `${SERVICES_URL(organizationId, projectId, environmentId)}${
            flagEnabled ? SERVICES_NEW_URL : SERVICES_GENERAL_URL
          }`
          navigate(link)
        }}
        totalSteps={3}
        currentStep={currentStep}
        currentTitle={steps[currentStep - 1].title}
      >
        <Routes>
          {ROUTER_SERVICE_DATABASE_CREATION.map((route) => (
            <Route key={route.path} path={route.path} element={route.component} />
          ))}
          {databaseURL && (
            <Route path="*" element={<Navigate replace to={databaseURL + SERVICES_DATABASE_CREATION_GENERAL_URL} />} />
          )}
        </Routes>
        <AssistantTrigger defaultOpen />
      </FunnelFlow>
    </DatabaseCreateContext.Provider>
  )
}

export default PageDatabaseCreateFeature
