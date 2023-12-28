import { type GitProviderEnum, type HelmPortRequestPortsInner, type HelmRequest } from 'qovery-typescript-axios'
import { createContext, useContext, useState } from 'react'
import { type UseFormReturn, useForm } from 'react-hook-form'
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { type HelmValuesArgumentsData, type HelmValuesFileData } from '@qovery/domains/service-helm/feature'
import { SERVICES_HELM_CREATION_GENERAL_URL, SERVICES_HELM_CREATION_URL, SERVICES_URL } from '@qovery/shared/routes'
import { FunnelFlow } from '@qovery/shared/ui'
import { ROUTER_SERVICE_HELM_CREATION } from '../../router/router'

export const steps: { title: string }[] = [
  { title: 'General data' },
  { title: 'Values override as file' },
  { title: 'Values override as arguments' },
  { title: 'Networking' },
  { title: 'Summary' },
]
export interface HelmGeneralData extends Omit<HelmRequest, 'source' | 'ports' | 'values_override' | 'arguments'> {
  source_provider: 'HELM_REPOSITORY' | 'GIT'
  repository: string
  provider?: GitProviderEnum
  branch?: string
  root_path?: string
  chart_name?: string
  chart_version?: string
  arguments: string
}

export interface HelmNetworkingData {
  ports: HelmPortRequestPortsInner[]
}

interface HelmCreateContextInterface {
  currentStep: number
  setCurrentStep: (step: number) => void
  generalForm: UseFormReturn<HelmGeneralData>
  valuesOverrideFileForm: UseFormReturn<HelmValuesFileData>
  valuesOverrideArgumentsForm: UseFormReturn<HelmValuesArgumentsData>
  networkingForm: UseFormReturn<HelmNetworkingData>
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
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const [currentStep, setCurrentStep] = useState<number>(1)

  const generalForm = useForm<HelmGeneralData>({
    mode: 'onChange',
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

  const networkingForm = useForm<HelmNetworkingData>({
    mode: 'onChange',
    defaultValues: {
      ports: [],
    },
  })

  const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_HELM_CREATION_URL}`

  return (
    <HelmCreateContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        generalForm,
        valuesOverrideFileForm,
        valuesOverrideArgumentsForm,
        networkingForm,
      }}
    >
      <FunnelFlow
        onExit={() => navigate(SERVICES_URL(organizationId, projectId, environmentId))}
        totalSteps={steps.length}
        currentStep={currentStep}
        currentTitle={steps[currentStep - 1].title}
        portal
      >
        <Routes>
          {ROUTER_SERVICE_HELM_CREATION.map((route) => (
            <Route key={route.path} path={route.path} element={route.component} />
          ))}
          <Route path="*" element={<Navigate replace to={pathCreate + SERVICES_HELM_CREATION_GENERAL_URL} />} />
        </Routes>
      </FunnelFlow>
    </HelmCreateContext.Provider>
  )
}

export default PageHelmCreateFeature
