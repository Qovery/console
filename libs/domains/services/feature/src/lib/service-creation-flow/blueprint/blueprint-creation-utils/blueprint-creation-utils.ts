import {
  type BlueprintMajorVersion,
  type BlueprintManifestVariableField,
  type BlueprintVariableRequest,
} from 'qovery-typescript-axios'
import {
  type BlueprintFieldValues,
  type OverridableBlueprintManifestContextVariableField,
} from '../../../blueprint-field-utils/blueprint-field-utils'

export function sortBlueprintMajorVersions(versions: BlueprintMajorVersion[]) {
  return [...versions].sort((a, b) =>
    b.serviceVersion.localeCompare(a.serviceVersion, undefined, {
      numeric: true,
      sensitivity: 'base',
    })
  )
}

export function buildBlueprintVariables(
  fields: BlueprintFieldValues,
  blueprintFields: Array<BlueprintManifestVariableField | OverridableBlueprintManifestContextVariableField>
): BlueprintVariableRequest[] {
  const blueprintFieldsByName = new Map(blueprintFields.map((field) => [field.name, field]))

  return Object.entries(fields).flatMap(([name, value]) => {
    if (typeof value === 'string' && !value.trim()) return []
    const field = blueprintFieldsByName.get(name)

    return [
      {
        name,
        value: String(value),
        is_secret: field?.kind === 'variable' ? field.is_secret : false,
      },
    ]
  })
}
