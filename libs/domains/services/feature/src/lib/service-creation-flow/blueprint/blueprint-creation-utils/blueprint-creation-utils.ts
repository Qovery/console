import {
  type BlueprintDetailsResponse,
  type BlueprintMajorVersion,
  type BlueprintManifestVariableField,
  type BlueprintVariableRequest,
} from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import {
  type BlueprintFieldValues,
  type OverridableBlueprintManifestContextVariableField,
} from '../../../blueprint-field-utils/blueprint-field-utils'

export type BlueprintCreationOutcome =
  | { status: 'created' }
  | { status: 'failed'; errorMessage?: string }
  | { status: 'pending' }

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

/**
 * A blueprint dispatch that fails emits no `service-created` event, so the absence of one proves
 * nothing. Only the blueprint itself can say whether the service exists — and anything that is
 * neither a materialized service nor a terminal failure of *our* dispatch stays `pending`, never
 * success.
 *
 * `deploymentId` is the `deployment_id` the creation returned. The blueprint reports whichever
 * dispatch ran last, so without pinning it a later re-dispatch's failure would be read as ours.
 */
export function resolveBlueprintCreationOutcome(
  blueprint: BlueprintDetailsResponse,
  deploymentId?: string
): BlueprintCreationOutcome {
  if (blueprint.service_id) {
    return { status: 'created' }
  }

  const deployment = blueprint.latest_deployment

  if (!deployment || (deploymentId && deployment.id !== deploymentId)) {
    return { status: 'pending' }
  }

  return match(deployment.status)
    .with(
      'FAILED',
      'INTERNAL_ERROR',
      'CANCELED',
      (): BlueprintCreationOutcome => ({
        status: 'failed',
        // A blank message is as good as none — left as-is it renders nothing and the failure passes silently
        errorMessage: deployment.error_message?.trim() || undefined,
      })
    )
    .otherwise((): BlueprintCreationOutcome => ({ status: 'pending' }))
}
