import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { type Dispatch, type PropsWithChildren, type SetStateAction, createContext, useContext, useState } from 'react'
import { type UseFormReturn, useForm } from 'react-hook-form'
import { type HelmGeneralData } from '@qovery/domains/services/feature'
import { AssistantTrigger } from '@qovery/shared/assistant/feature'
import { FunnelFlow } from '@qovery/shared/ui'
import { type HelmValuesArgumentsData } from '../values-override-arguments-setting/values-override-arguments-setting'
import { type HelmValuesFileData } from '../values-override-files-setting/values-override-files-setting'
import { findHelmTemplateMatch } from './helm-create-utils/helm-create-utils'

export interface HelmCreateContextInterface {
  currentStep: number
  setCurrentStep: Dispatch<SetStateAction<number>>
  creationFlowUrl: string
  generalForm: UseFormReturn<HelmGeneralData>
  valuesOverrideFileForm: UseFormReturn<HelmValuesFileData>
  valuesOverrideArgumentsForm: UseFormReturn<HelmValuesArgumentsData>
}

export const HelmCreateContext = createContext<HelmCreateContextInterface | undefined>(undefined)

export const useHelmCreateContext = () => {
  const helmCreateContext = useContext(HelmCreateContext)

  if (!helmCreateContext) {
    throw new Error('useHelmCreateContext must be used within a HelmCreateContext')
  }

  return helmCreateContext
}

export const helmCreationSteps: { title: string }[] = [
  { title: 'General data' },
  { title: 'Values override as file' },
  { title: 'Values override as arguments' },
]

export interface HelmCreationFlowProps extends PropsWithChildren {
  creationFlowUrl: string
}

export function HelmCreationFlow({ children, creationFlowUrl }: HelmCreationFlowProps) {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  const { template } = useSearch({ strict: false })
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)

  const templateMatch = findHelmTemplateMatch(template)

  const generalForm = useForm<HelmGeneralData>({
    defaultValues: {
      name: template ?? '',
      icon_uri: templateMatch.iconUri ?? 'app://qovery-console/helm',
      arguments: '--wait --atomic --debug',
      timeout_sec: 600,
      labels_groups: [],
      annotations_groups: [],
    },
    mode: 'onChange',
  })

  const valuesOverrideFileForm = useForm<HelmValuesFileData>({
    defaultValues: {
      type: 'GIT_REPOSITORY',
    },
    mode: 'onChange',
  })

  const valuesOverrideArgumentsForm = useForm<HelmValuesArgumentsData>({
    defaultValues: {
      arguments: [],
    },
    mode: 'onChange',
  })

  return (
    <HelmCreateContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        creationFlowUrl,
        generalForm,
        valuesOverrideFileForm,
        valuesOverrideArgumentsForm,
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
        totalSteps={helmCreationSteps.length}
        currentStep={currentStep}
        currentTitle={helmCreationSteps[currentStep - 1]?.title}
      >
        {children}
        <AssistantTrigger defaultOpen />
      </FunnelFlow>
    </HelmCreateContext.Provider>
  )
}
