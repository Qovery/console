import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/skill-presets/data-access'
import { queries } from '@qovery/state/util-queries'

/** Owners and admins turn AI features on from the skill presets page: the Console has no other toggle. */
export function useEnableAiFeatures() {
  const queryClient = useQueryClient()

  return useMutation(mutations.enableAiFeatures, {
    onSuccess(_, { organizationId }) {
      queryClient.invalidateQueries({ queryKey: queries.organizations.details({ organizationId }).queryKey })
      queryClient.invalidateQueries({ queryKey: queries.skillPresets.mockAiFeatures({ organizationId }).queryKey })
    },
    meta: {
      notifyOnSuccess: {
        title: 'AI features are on. You can now create and edit presets.',
      },
      notifyOnError: true,
    },
  })
}
