import {
  type BlueprintUpdateNewRequiredValue,
  type BlueprintUpdateRemovedValue,
  type BlueprintUpdateResponse,
} from 'qovery-typescript-axios'
import { type ReactNode, createContext, useContext } from 'react'
import { type AnyService } from '@qovery/domains/services/data-access'
import { type BlueprintFieldValue, type BlueprintFieldValues } from '../../blueprint-field-utils/blueprint-field-utils'
import {
  type BlueprintUpdateEditableValue,
  type BlueprintUpdateReviewSection,
  type BlueprintUpdateSection,
} from './blueprint-update-utils'

export interface BlueprintUpdateFlowContextValue {
  activeSection: BlueprintUpdateSection
  blueprintUpdate: BlueprintUpdateResponse
  canContinueReview: boolean
  clusterId?: string
  completeActiveSection: () => void
  completedSections: BlueprintUpdateSection[]
  handleUpdate: () => Promise<void>
  isPreviewLoading: boolean
  isRequiredValid: boolean
  isUpdateLoading: boolean
  onChange: (name: string, value: BlueprintFieldValue) => void
  previewId?: string
  removedValues: BlueprintUpdateRemovedValue[]
  requestPreview: () => Promise<void>
  requiredValues: BlueprintUpdateNewRequiredValue[]
  reviewSections: BlueprintUpdateReviewSection[]
  service: AnyService
  setActiveSection: (section: BlueprintUpdateSection) => void
  title: string
  updatedValues: BlueprintUpdateEditableValue[]
  values: BlueprintFieldValues
}

const BlueprintUpdateFlowContext = createContext<BlueprintUpdateFlowContextValue | undefined>(undefined)

export function BlueprintUpdateFlowProvider({
  children,
  value,
}: {
  children: ReactNode
  value: BlueprintUpdateFlowContextValue
}) {
  return <BlueprintUpdateFlowContext.Provider value={value}>{children}</BlueprintUpdateFlowContext.Provider>
}

export function useBlueprintUpdateFlowContext() {
  const context = useContext(BlueprintUpdateFlowContext)
  if (!context) throw new Error('useBlueprintUpdateFlowContext must be used within BlueprintUpdateFlow')

  return context
}
