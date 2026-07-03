import { useParams } from '@tanstack/react-router'
import {
  type BlueprintManifestResponseResultsInner,
  type BlueprintManifestVariableField,
} from 'qovery-typescript-axios'
import { type PropsWithChildren, createContext, useContext, useEffect, useMemo } from 'react'
import { useBlueprintCatalogServiceManifest } from '../../../hooks/use-blueprint-catalog-service-manifest/use-blueprint-catalog-service-manifest'
import { useBlueprintCreateContext } from '../blueprint-create-context/blueprint-create-context'
import {
  type OverridableBlueprintManifestContextVariableField,
  getDefaultBlueprintFieldValues,
  isOptionalVariableField,
  isOverridableContextVariableField,
  isRequiredVariableField,
} from '../blueprint-creation-utils/blueprint-creation-utils'

interface BlueprintManifestContextInterface {
  blueprintManifestFields: BlueprintManifestResponseResultsInner[]
  requiredBlueprintFields: BlueprintManifestVariableField[]
  optionalBlueprintFields: BlueprintManifestVariableField[]
  overridableContextBlueprintFields: OverridableBlueprintManifestContextVariableField[]
}

const BlueprintManifestContext = createContext<BlueprintManifestContextInterface | undefined>(undefined)

export function BlueprintManifestFieldsProvider({ children }: PropsWithChildren) {
  const { blueprint, form, organizationId, serviceVersion } = useBlueprintCreateContext()
  const { environmentId = '', serviceFamily = blueprint.serviceFamily ?? '' } = useParams({ strict: false })
  const versionTag = form.watch('versionTag')
  const { data: blueprintManifestFields = [] } = useBlueprintCatalogServiceManifest({
    organizationId,
    provider: blueprint.provider,
    serviceFamily,
    serviceVersion,
    environmentId,
    suspense: true,
  })

  const requiredBlueprintFields = useMemo(
    () => blueprintManifestFields.filter(isRequiredVariableField),
    [blueprintManifestFields]
  )
  const optionalBlueprintFields = useMemo(
    () => blueprintManifestFields.filter(isOptionalVariableField),
    [blueprintManifestFields]
  )
  const overridableContextBlueprintFields = useMemo(
    () => blueprintManifestFields.filter(isOverridableContextVariableField),
    [blueprintManifestFields]
  )

  useEffect(() => {
    const formValues = form.getValues()

    if (formValues.loadedVersionTag === versionTag) {
      return
    }

    form.reset({
      ...formValues,
      loadedVersionTag: versionTag,
      fields: getDefaultBlueprintFieldValues(blueprintManifestFields),
    })
  }, [blueprintManifestFields, form, versionTag])

  return (
    <BlueprintManifestContext.Provider
      value={{
        blueprintManifestFields,
        requiredBlueprintFields,
        optionalBlueprintFields,
        overridableContextBlueprintFields,
      }}
    >
      {children}
    </BlueprintManifestContext.Provider>
  )
}

export function useBlueprintManifestFields() {
  const blueprintManifestContext = useContext(BlueprintManifestContext)

  if (!blueprintManifestContext) {
    throw new Error('useBlueprintManifestFields must be used within a BlueprintManifestFieldsProvider')
  }

  return blueprintManifestContext
}
