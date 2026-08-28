import { isBlueprintRcTag, isBlueprintTag } from '../../service-blueprint-update-flow/blueprint-update-utils'
import { useBlueprintUpdate } from '../use-blueprint-update/use-blueprint-update'

export interface UseBlueprintUpdateStateProps {
  blueprintId: string
  // The tag as read off the service itself, when it carries one, so a prerelease stays
  // recognisable while the update check has not answered.
  localTag?: string
  suspense?: boolean
  throwOnError?: boolean
}

// The update check is the only endpoint that reports a blueprint's tag, and it answers 404 for any
// tag the catalog does not publish — a prerelease, but a retired major too.
export function useBlueprintUpdateState({
  blueprintId,
  localTag,
  suspense,
  throwOnError,
}: UseBlueprintUpdateStateProps) {
  const { data, isLoading, isError } = useBlueprintUpdate({ blueprintId, suspense, throwOnError })

  // react-query keeps the last successful `data` when a refetch fails, so a service repointed to a
  // tag the catalog cannot resolve — which is what `update-service-rc` does to a live service —
  // would keep answering from the tag it used to be on: a stale update action, and no prerelease
  // recognised. Dropping it hands the question back to `localTag`, the only current answer left.
  const blueprintUpdate = isError ? undefined : data
  // `localTag` is read off the service rather than handed over by the API, so it is only trusted
  // once it looks like a tag: everything downstream reads a tag by position and would otherwise
  // report something confidently wrong.
  const tag = blueprintUpdate?.current_tag ?? (isBlueprintTag(localTag) ? localTag : undefined)

  return {
    blueprintUpdate,
    isLoading,
    isError,
    tag,
    isRc: isBlueprintRcTag(tag),
  }
}

export default useBlueprintUpdateState
