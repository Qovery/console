import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { FunnelFlow, FunnelFlowBody } from '@qovery/shared/ui'
import { type BlueprintEntry, CATEGORY_LABELS, ENGINE_LABELS, PROVIDER_CONFIG } from '../blueprints'
import { StepConfiguration } from './step-configuration'
import { StepSummary } from './step-summary'
import { type BlueprintWizardFormData, getDefaultFormData } from './types'

export interface BlueprintWizardProps {
  blueprint: BlueprintEntry
  organizationId: string
  projectId: string
  environmentId: string
  onExit: () => void
}

const STEP_TITLES = ['Configuration', 'Summary']

export function BlueprintWizard({
  blueprint,
  organizationId,
  projectId,
  environmentId,
  onExit,
}: BlueprintWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoadingCreate, setIsLoadingCreate] = useState(false)
  const [isLoadingCreateAndDeploy, setIsLoadingCreateAndDeploy] = useState(false)

  const methods = useForm<BlueprintWizardFormData>({
    mode: 'onChange',
    defaultValues: getDefaultFormData(blueprint, { projectId, environmentId }),
  })

  const handleExit = () => {
    if (window.confirm('Discard this configuration and exit?')) {
      onExit()
    }
  }

  const handleNext = () => setCurrentStep((s) => Math.min(s + 1, STEP_TITLES.length))
  const handleBack = () => setCurrentStep((s) => Math.max(s - 1, 1))

  const handleCreate = async () => {
    setIsLoadingCreate(true)
    try {
      // TODO: wire create-service API
      onExit()
    } finally {
      setIsLoadingCreate(false)
    }
  }

  const handleCreateAndDeploy = async () => {
    setIsLoadingCreateAndDeploy(true)
    try {
      // TODO: wire create-and-deploy API
      onExit()
    } finally {
      setIsLoadingCreateAndDeploy(false)
    }
  }

  return (
    <FunnelFlow
      portal
      onExit={handleExit}
      totalSteps={STEP_TITLES.length}
      currentStep={currentStep}
      currentTitle={STEP_TITLES[currentStep - 1] ?? ''}
    >
      <FormProvider {...methods}>
        <FunnelFlowBody>
          {currentStep === 1 && <StepConfiguration blueprint={blueprint} onNext={handleNext} />}
          {currentStep === 2 && (
            <StepSummary
              blueprint={blueprint}
              onBack={handleBack}
              onCreate={handleCreate}
              onCreateAndDeploy={handleCreateAndDeploy}
              isLoadingCreate={isLoadingCreate}
              isLoadingCreateAndDeploy={isLoadingCreateAndDeploy}
            />
          )}
        </FunnelFlowBody>
      </FormProvider>
    </FunnelFlow>
  )
}

export default BlueprintWizard

// Re-export metadata helpers for downstream consumers
export { CATEGORY_LABELS, ENGINE_LABELS, PROVIDER_CONFIG }
