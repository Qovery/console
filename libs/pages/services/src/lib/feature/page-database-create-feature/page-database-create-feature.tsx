import { createContext, useContext, useState } from 'react'
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import {
  SERVICES_DATABASE_CREATION_GENERAL_URL,
  SERVICES_DATABASE_CREATION_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { FunnelFlow } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import { ROUTER_SERVICE_DATABASE_CREATION } from '../../router/router'
import { GeneralData, ResourcesData } from './database-creation-flow.interface'

export interface DatabaseCreateContextInterface {
  currentStep: number
  setCurrentStep: (step: number) => void
  generalData: GeneralData | undefined
  setGeneralData: (data: GeneralData) => void
  resourcesData: ResourcesData | undefined
  setResourcesData: (data: ResourcesData) => void
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
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  // values and setters for context initialization
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [generalData, setGeneralData] = useState<GeneralData>()
  const [resourcesData, setResourcesData] = useState<ResourcesData | undefined>({
    memory: 512,
    cpu: [0.5],
    storage: 10,
  })

  const navigate = useNavigate()

  useDocumentTitle('Creation - Service')

  const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_DATABASE_CREATION_URL}`

  return (
    <DatabaseCreateContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        generalData,
        setGeneralData,
        resourcesData,
        setResourcesData,
      }}
    >
      <FunnelFlow
        onExit={() => {
          navigate(SERVICES_URL(organizationId, projectId, environmentId))
        }}
        totalSteps={3}
        currentStep={currentStep}
        currentTitle={steps[currentStep - 1].title}
        portal
      >
        <Routes>
          {ROUTER_SERVICE_DATABASE_CREATION.map((route) => (
            <Route key={route.path} path={route.path} element={route.component} />
          ))}
          <Route path="*" element={<Navigate replace to={pathCreate + SERVICES_DATABASE_CREATION_GENERAL_URL} />} />
        </Routes>
      </FunnelFlow>
    </DatabaseCreateContext.Provider>
  )
}

export default PageDatabaseCreateFeature
