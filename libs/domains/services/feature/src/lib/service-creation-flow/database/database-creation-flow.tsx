import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { type Dispatch, type PropsWithChildren, type SetStateAction, createContext, useContext, useState } from 'react'
import { type UseFormReturn, useForm } from 'react-hook-form'
import { AssistantTrigger } from '@qovery/shared/assistant/feature'
import { FunnelFlow } from '@qovery/shared/ui'
import {
  type DatabaseCreateGeneralData,
  type DatabaseCreateResourcesData,
  findDatabaseTemplateMatch,
} from './database-create-utils/database-create-utils'

export interface DatabaseCreateContextInterface {
  currentStep: number
  setCurrentStep: Dispatch<SetStateAction<number>>
  creationFlowUrl: string
  generalForm: UseFormReturn<DatabaseCreateGeneralData>
  resourcesForm: UseFormReturn<DatabaseCreateResourcesData>
}

export const DatabaseCreateContext = createContext<DatabaseCreateContextInterface | undefined>(undefined)

export const useDatabaseCreateContext = () => {
  const databaseCreateContext = useContext(DatabaseCreateContext)

  if (!databaseCreateContext) {
    throw new Error('useDatabaseCreateContext must be used within a DatabaseCreateContext')
  }

  return databaseCreateContext
}

export const databaseCreationSteps: { title: string }[] = [
  { title: 'Create new database' },
  { title: 'Set resources' },
  { title: 'Ready to install' },
]

export const defaultDatabaseResourcesData: DatabaseCreateResourcesData = {
  memory: 512,
  cpu: 500,
  storage: 20,
}

export interface DatabaseCreationFlowProps extends PropsWithChildren {
  creationFlowUrl: string
}

export function DatabaseCreationFlow({ children, creationFlowUrl }: DatabaseCreationFlowProps) {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  const { template, option } = useSearch({ strict: false })
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)

  const templateMatch = findDatabaseTemplateMatch(template, option)

  const generalForm = useForm<DatabaseCreateGeneralData>({
    defaultValues: {
      name: template ?? '',
      description: '',
      accessibility: 'PRIVATE',
      icon_uri: templateMatch.iconUri ?? 'app://qovery-console/database',
      mode: templateMatch.mode,
      type: templateMatch.type,
      version: '',
      labels_groups: [],
      annotations_groups: [],
    },
    mode: 'onChange',
  })

  const resourcesForm = useForm<DatabaseCreateResourcesData>({
    defaultValues: defaultDatabaseResourcesData,
    mode: 'onChange',
  })

  return (
    <DatabaseCreateContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        creationFlowUrl,
        generalForm,
        resourcesForm,
      }}
    >
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
        totalSteps={databaseCreationSteps.length}
        currentStep={currentStep}
        currentTitle={databaseCreationSteps[currentStep - 1]?.title}
      >
        {children}
        <AssistantTrigger defaultOpen />
      </FunnelFlow>
    </DatabaseCreateContext.Provider>
  )
}

export default DatabaseCreationFlow
