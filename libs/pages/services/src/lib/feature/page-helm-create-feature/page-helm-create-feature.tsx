import { type GitProviderEnum, type HelmRequest } from 'qovery-typescript-axios'
import { createContext, useContext, useState } from 'react'
import { type UseFormReturn, useForm } from 'react-hook-form'
import { Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { SERVICES_URL } from '@qovery/shared/routes'
import { FunnelFlow } from '@qovery/shared/ui'
import { ROUTER_SERVICE_HELM_CREATION } from '../../router/router'

export const steps: { title: string }[] = [{ title: 'General data' }, { title: 'Values' }, { title: 'Summary' }]

export interface HelmGeneralData
  extends Omit<HelmRequest, 'source' | 'ports' | 'allow_cluster_wide_resources' | 'values_override'> {
  source_provider: 'HELM_REPOSITORY' | 'GIT'
  repository: string
  provider?: GitProviderEnum
  branch?: string
  root_path?: string
  chart_name?: string
  chart_version?: string
}

export type HelmGeneralDataa = {
  name: string
  description?: string
  auto_preview: boolean
  auto_deploy?: boolean
  timeout_sec: number
  arguments: string[]
  // source_provider: 'HELM_REPOSITORY' | 'GIT'
  // repository: string
  // provider?: GitProviderEnum
  // branch?: string
  // root_path?: string
  // chart_name?: string
  // chart_version?: string
}

interface HelmCreateContextInterface {
  currentStep: number
  setCurrentStep: (step: number) => void
  generalForm: UseFormReturn<HelmGeneralData>
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

  return (
    <HelmCreateContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        generalForm,
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
        </Routes>
      </FunnelFlow>
    </HelmCreateContext.Provider>
  )
}

export default PageHelmCreateFeature
