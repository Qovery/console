import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import {
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'
import { type UseFormReturn, useForm } from 'react-hook-form'
import type {
  ApplicationGeneralData,
  ApplicationResourcesData,
  FlowPortData,
  FlowVariableData,
} from '@qovery/shared/interfaces'
import { FunnelFlow } from '@qovery/shared/ui'

export interface ApplicationContainerCreateContextInterface {
  currentStep: number
  setCurrentStep: Dispatch<SetStateAction<number>>
  creationFlowUrl: string
  generalForm: UseFormReturn<ApplicationGeneralData>
  resourcesForm: UseFormReturn<ApplicationResourcesData>
  portForm: UseFormReturn<FlowPortData>
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

export const defaultResourcesData: ApplicationResourcesData = {
  memory: 512,
  cpu: 500,
  gpu: 0,
  min_running_instances: 1,
  max_running_instances: 1,
  autoscaling_mode: 'NONE',
  hpa_metric_type: 'CPU',
  hpa_cpu_average_utilization_percent: 60,
}

export const defaultPortData: FlowPortData = {
  ports: [],
  healthchecks: undefined,
}

export interface ApplicationContainerCreationFlowProps extends PropsWithChildren {
  creationFlowUrl: string
  defaultServiceType?: ApplicationGeneralData['serviceType']
}

export function ApplicationContainerCreationFlow({
  children,
  creationFlowUrl,
  defaultServiceType,
}: ApplicationContainerCreationFlowProps) {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  const { template } = useSearch({ strict: false })

  const [currentStep, setCurrentStep] = useState<number>(1)
  const generalForm = useForm<ApplicationGeneralData>({
    defaultValues: {
      name: template ?? '',
      icon_uri: `app://qovery-console/${template ?? 'application'}`,
      auto_deploy: true,
    },
    mode: 'onChange',
  })
  const resourcesForm = useForm<ApplicationResourcesData>({
    defaultValues: defaultResourcesData,
    mode: 'onChange',
  })
  const portForm = useForm<FlowPortData>({
    defaultValues: defaultPortData,
    mode: 'onChange',
  })

  const variablesForm = useForm<FlowVariableData>({
    defaultValues: {
      variables: [],
      externalSecrets: [],
    },
    mode: 'onChange',
  })

  const navigate = useNavigate()

  // Set the default service type APPLICATION or CONTAINER if it is not set
  useEffect(() => {
    if (defaultServiceType) {
      const currentServiceType = generalForm.getValues('serviceType')
      if (!currentServiceType) {
        generalForm.setValue('serviceType', defaultServiceType, { shouldValidate: true })
      }
    }
  }, [defaultServiceType, generalForm])

  return (
    <ApplicationContainerCreateContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        creationFlowUrl,
        generalForm,
        resourcesForm,
        portForm,
        variablesForm,
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
        totalSteps={steps.length}
        currentStep={currentStep}
        currentTitle={steps[currentStep - 1]?.title}
      >
        {children}
      </FunnelFlow>
    </ApplicationContainerCreateContext.Provider>
  )
}

export default ApplicationContainerCreationFlow
