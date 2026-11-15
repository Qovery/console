import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/skill-presets/data-access'
import { queries } from '@qovery/state/util-queries'

/** Errors are handled by the caller, which shows 409 and 422 next to the fields involved. */
export function useEditSkillPreset({ successMessage = 'Your skill preset has been saved' } = {}) {
  const queryClient = useQueryClient()

  return useMutation(mutations.editSkillPreset, {
    onSuccess(skillPreset) {
      queryClient.setQueryData(queries.skillPresets.details({ skillPresetId: skillPreset.id }).queryKey, skillPreset)
      queryClient.invalidateQueries({ queryKey: queries.skillPresets._def })
    },
    meta: {
      notifyOnSuccess: {
        title: successMessage,
      },
    },
  })
}
