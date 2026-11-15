import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/skill-presets/data-access'
import { queries } from '@qovery/state/util-queries'

export function useDeleteSkillPreset() {
  const queryClient = useQueryClient()

  return useMutation(mutations.deleteSkillPreset, {
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: queries.skillPresets._def })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your skill preset has been deleted',
      },
      notifyOnError: true,
    },
  })
}
