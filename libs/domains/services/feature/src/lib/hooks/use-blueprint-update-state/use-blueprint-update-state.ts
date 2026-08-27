import { isBlueprintRcTag } from '../../service-blueprint-update-flow/blueprint-update-utils'
import { useBlueprintUpdate } from '../use-blueprint-update/use-blueprint-update'

export interface UseBlueprintUpdateStateProps {
  blueprintId: string
  // The tag as read off the service itself, when it carries one, so a prerelease stays
  // recognisable while the update check has not answered.
  localTag?: string
}

// The update check is the only endpoint that reports a blueprint's tag, and it answers 404 for any
// tag the catalog does not publish — a prerelease, but a retired major too.
export function useBlueprintUpdateState({ blueprintId, localTag }: UseBlueprintUpdateStateProps) {
  const { data: blueprintUpdate, isLoading, isError } = useBlueprintUpdate({ blueprintId })

  return {
    blueprintUpdate,
    isLoading,
    isError,
    isRc: isBlueprintRcTag(blueprintUpdate?.current_tag ?? localTag),
  }
}

export default useBlueprintUpdateState
