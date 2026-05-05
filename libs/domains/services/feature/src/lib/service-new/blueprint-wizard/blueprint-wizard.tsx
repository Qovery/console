import { createPortal } from 'react-dom'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { FunnelFlow, FunnelFlowBody } from '@qovery/shared/ui'
import { type BlueprintEntry } from '../blueprints'
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

export function BlueprintWizard({ blueprint, projectId, environmentId, onExit }: BlueprintWizardProps) {
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

  return createPortal(
    <div className="fixed inset-0 z-modal bg-background-secondary">
      <FunnelFlow
        onExit={handleExit}
        totalSteps={STEP_TITLES.length}
        currentStep={currentStep}
        currentTitle={STEP_TITLES[currentStep - 1] ?? ''}
        contentClassName="bg-background-secondary"
      >
        <FormProvider {...methods}>
          {currentStep === 1 ? (
            <StepConfiguration blueprint={blueprint} onNext={() => setCurrentStep(2)} />
          ) : (
            <FunnelFlowBody customContentWidth="max-w-[44rem]" contentClassName="bg-background-secondary">
              <StepSummary
                blueprint={blueprint}
                onBack={() => setCurrentStep(1)}
                onCreate={handleCreate}
                onCreateAndDeploy={handleCreateAndDeploy}
                isLoadingCreate={isLoadingCreate}
                isLoadingCreateAndDeploy={isLoadingCreateAndDeploy}
              />
            </FunnelFlowBody>
          )}
        </FormProvider>
      </FunnelFlow>
    </div>,
    document.body
  )
}

export default BlueprintWizard
