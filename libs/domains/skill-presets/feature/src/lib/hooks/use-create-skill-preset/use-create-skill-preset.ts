import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/skill-presets/data-access'
import { queries } from '@qovery/state/util-queries'

/** Errors are handled by the editor, which shows 409 and 422 next to the fields involved. */
export function useCreateSkillPreset() {
  const queryClient = useQueryClient()

  return useMutation(mutations.createSkillPreset, {
    onSuccess(_, { organizationId }) {
      queryClient.invalidateQueries({ queryKey: queries.skillPresets._def })
      queryClient.invalidateQueries({ queryKey: queries.skillPresets.list({ organizationId }).queryKey })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your skill preset has been created',
      },
    },
  })
}
