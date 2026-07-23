import { type BlueprintUpdateResponse } from 'qovery-typescript-axios'
import { type PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { type AnyService } from '@qovery/domains/services/data-access'
import { toast } from '@qovery/shared/ui'
import {
  type BlueprintFieldValue,
  type BlueprintFieldValues,
  isFieldValid,
} from '../blueprint-field-utils/blueprint-field-utils'
import { useBlueprintUpdate } from '../hooks/use-blueprint-update/use-blueprint-update'
import { useDeployBlueprint } from '../hooks/use-deploy-blueprint/use-deploy-blueprint'
import { usePreviewBlueprintUpdate } from '../hooks/use-preview-blueprint-update/use-preview-blueprint-update'
import { useUpdateBlueprint } from '../hooks/use-update-blueprint/use-update-blueprint'
import { BlueprintUpdateFlowProvider } from './blueprint-update-context'
import { BlueprintUpdateFlowShell } from './blueprint-update-flow-shell'
import {
  type BlueprintUpdateEditableValue,
  type BlueprintUpdateSection,
  buildBlueprintUpdatePayload,
  getBlueprintUpdateFieldValue,
  getBlueprintUpdateTitle,
  getBlueprintUpdateVariableField,
  getFallbackServiceIcon,
  getFirstAvailableUpdateSection,
  updateSections,
} from './blueprint-update-utils'

export type { BlueprintUpdateFlowContextValue } from './blueprint-update-context'
export { useBlueprintUpdateFlowContext } from './blueprint-update-context'
export {
  BLUEPRINT_RELEASE_NOTES_URL,
  blueprintUpdateSteps,
  getBlueprintUpdateVersion,
  hasBlueprintUpdateReviewSections,
} from './blueprint-update-utils'
export { BlueprintUpdatePreviewStep } from './blueprint-update-preview-step'
export { BlueprintUpdateReviewStep } from './blueprint-update-review-step'

export interface BlueprintUpdateFlowProps extends PropsWithChildren {
  blueprintId: string
  clusterId?: string
  currentStep: 1 | 2
  environmentId: string
  onExit: () => void
  service: AnyService
}

export function BlueprintUpdateFlow({
  blueprintId,
  children,
  clusterId,
  currentStep,
  environmentId,
  onExit,
  service,
}: BlueprintUpdateFlowProps) {
  const { data: blueprintUpdate } = useBlueprintUpdate({ blueprintId, suspense: true })
  const { mutateAsync: previewBlueprintUpdate, isLoading: isPreviewLoading } = usePreviewBlueprintUpdate()
  const { mutateAsync: deployBlueprint, isLoading: isDeployLoading } = useDeployBlueprint({
    environmentId,
    serviceId: service.id,
    serviceType: service.service_type,
  })
  const { mutateAsync: updateBlueprint, isLoading: isUpdateLoading } = useUpdateBlueprint({
    environmentId,
    serviceId: service.id,
    serviceType: service.service_type,
  })
  const [activeSection, setActiveSection] = useState<BlueprintUpdateSection>(() =>
    blueprintUpdate ? getFirstAvailableUpdateSection(blueprintUpdate) : 'required'
  )
  const [completedSections, setCompletedSections] = useState<BlueprintUpdateSection[]>([])
  const [previewId, setPreviewId] = useState<string>()
  const previewPayloadKeyRef = useRef<string>()
  const [previewError, setPreviewError] = useState(false)
  const [values, setValues] = useState<BlueprintFieldValues>({})
  const [initializedBlueprintId, setInitializedBlueprintId] = useState<string>()

  useEffect(() => {
    if (blueprintUpdate && initializedBlueprintId !== blueprintId) {
      setValues(
        Object.fromEntries(
          blueprintUpdate.new_optional_values.map((value) => [
            value.name,
            getBlueprintUpdateFieldValue(value, value.default_value),
          ])
        )
      )
      setActiveSection(getFirstAvailableUpdateSection(blueprintUpdate))
      setInitializedBlueprintId(blueprintId)
      previewPayloadKeyRef.current = undefined
      setPreviewError(false)
    }
  }, [blueprintId, blueprintUpdate, initializedBlueprintId])

  const blueprintUpdateData = blueprintUpdate as BlueprintUpdateResponse
  const requiredValues = useMemo(
    () => [...blueprintUpdateData.new_required_values, ...blueprintUpdateData.now_required_values],
    [blueprintUpdateData.new_required_values, blueprintUpdateData.now_required_values]
  )
  const updatedValues = useMemo(
    () => [...blueprintUpdateData.updated_values, ...blueprintUpdateData.engine_diff.updated_values],
    [blueprintUpdateData.engine_diff.updated_values, blueprintUpdateData.updated_values]
  )
  const sectionHasContent = {
    required: requiredValues.length > 0,
    optional: blueprintUpdateData.new_optional_values.length > 0,
    modified: updatedValues.length > 0,
    removed: blueprintUpdateData.removed_values.length > 0,
  }
  const reviewSections = updateSections.filter(({ id }) => sectionHasContent[id])
  const activeSectionIndex = reviewSections.findIndex(({ id }) => id === activeSection)
  const isRequiredValid = requiredValues.every((value) =>
    isFieldValid(getBlueprintUpdateVariableField(value, true), values[value.name])
  )
  const isReviewComplete =
    reviewSections.every(({ id }) => completedSections.includes(id)) || reviewSections.length === 0
  const canContinueReview =
    reviewSections.length === 1 ? activeSection !== 'required' || isRequiredValid : isReviewComplete
  const title = getBlueprintUpdateTitle({
    serviceName: service.name,
    currentTag: blueprintUpdateData.current_tag,
    latestTag: blueprintUpdateData.latest_tag,
  })
  const payload = useMemo(
    () =>
      buildBlueprintUpdatePayload({
        icon: service.icon_uri ?? getFallbackServiceIcon(service.service_type),
        name: service.name,
        tag: blueprintUpdateData.latest_tag,
        values,
        optionalValues: blueprintUpdateData.new_optional_values,
        requiredValues,
        updatedValues,
      }),
    [
      blueprintUpdateData.latest_tag,
      blueprintUpdateData.new_optional_values,
      requiredValues,
      service,
      updatedValues,
      values,
    ]
  )

  const completeActiveSection = useCallback(() => {
    if (activeSection === 'required' && !isRequiredValid) return
    const nextCompletedSections = completedSections.includes(activeSection)
      ? completedSections
      : [...completedSections, activeSection]
    const nextSection = reviewSections[activeSectionIndex + 1]?.id

    setCompletedSections(nextCompletedSections)
    if (nextSection) setActiveSection(nextSection)
  }, [activeSection, activeSectionIndex, completedSections, isRequiredValid, reviewSections])

  const requestPreview = useCallback(async () => {
    if (initializedBlueprintId !== blueprintId) return

    const payloadKey = JSON.stringify(payload)
    if (previewPayloadKeyRef.current === payloadKey) return

    previewPayloadKeyRef.current = payloadKey
    setPreviewError(false)
    setPreviewId(undefined)

    try {
      const preview = await previewBlueprintUpdate({ blueprintId, payload })
      setPreviewId(preview?.preview_id)
    } catch {
      setPreviewError(true)
    }
  }, [blueprintId, initializedBlueprintId, payload, previewBlueprintUpdate])

  const retryPreview = useCallback(async () => {
    previewPayloadKeyRef.current = undefined
    await requestPreview()
  }, [requestPreview])

  const handleUpdate = useCallback(async () => {
    await updateBlueprint({ blueprintId, payload })
    await deployBlueprint({ blueprintId })
    toast('success', 'Blueprint update started')
    onExit()
  }, [blueprintId, deployBlueprint, onExit, payload, updateBlueprint])

  const contextValue = {
    activeSection,
    blueprintUpdate: blueprintUpdateData,
    canContinueReview,
    clusterId,
    completeActiveSection,
    completedSections,
    handleUpdate,
    isPreviewLoading,
    previewError,
    isRequiredValid,
    isUpdateLoading: isUpdateLoading || isDeployLoading,
    onChange: (name: string, value: BlueprintFieldValue) =>
      setValues((currentValues) => ({ ...currentValues, [name]: value })),
    previewId,
    removedValues: blueprintUpdateData.removed_values,
    requestPreview,
    retryPreview,
    requiredValues,
    reviewSections,
    service,
    setActiveSection,
    title,
    updatedValues: updatedValues as BlueprintUpdateEditableValue[],
    values,
  }

  return (
    <BlueprintUpdateFlowProvider value={contextValue}>
      <BlueprintUpdateFlowShell currentStep={currentStep} onExit={onExit}>
        {children}
      </BlueprintUpdateFlowShell>
    </BlueprintUpdateFlowProvider>
  )
}

export default BlueprintUpdateFlow
