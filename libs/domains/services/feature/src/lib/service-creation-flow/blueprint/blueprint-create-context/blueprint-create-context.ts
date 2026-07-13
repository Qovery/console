import { type BlueprintItem } from 'qovery-typescript-axios'
import { type Dispatch, type PropsWithChildren, type SetStateAction, createContext, useContext } from 'react'
import { type UseFormReturn } from 'react-hook-form'
import { type BlueprintFieldValues } from '../../../blueprint-field-utils/blueprint-field-utils'

export interface BlueprintCreateFormData {
  serviceName: string
  versionTag: string
  loadedVersionTag?: string
  fields: BlueprintFieldValues
}

export interface BlueprintCreateContextInterface {
  blueprint: BlueprintItem
  organizationId: string
  creationFlowUrl: string
  currentStep: number
  setCurrentStep: Dispatch<SetStateAction<number>>
  form: UseFormReturn<BlueprintCreateFormData>
  onViewDetails: () => void
  serviceVersion: string
}

export interface BlueprintCreationFlowProps extends PropsWithChildren {
  blueprint: BlueprintItem
  onExit: () => void
}

export const BlueprintCreateContext = createContext<BlueprintCreateContextInterface | undefined>(undefined)

export const useBlueprintCreateContext = () => {
  const blueprintCreateContext = useContext(BlueprintCreateContext)

  if (!blueprintCreateContext) {
    throw new Error('useBlueprintCreateContext must be used within a BlueprintCreateContext')
  }

  return blueprintCreateContext
}
