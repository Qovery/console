import { useMutation } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/services/data-access'

export function usePreviewBlueprintUpdate() {
  return useMutation(mutations.previewBlueprintUpdate, {
    meta: {
      notifyOnError: true,
    },
  })
}

export default usePreviewBlueprintUpdate
