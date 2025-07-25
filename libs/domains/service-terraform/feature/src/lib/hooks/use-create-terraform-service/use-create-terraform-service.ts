import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/service-terraform/data-access'
import { queries } from '@qovery/state/util-queries'

export function useCreateTerraformService() {
  const queryClient = useQueryClient()

  return useMutation(mutations.createTerraformService, {
    onSuccess(_, { environmentId }) {
      queryClient.invalidateQueries({
        queryKey: queries.services.list(environmentId).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your Terraform service has been created',
      },
      notifyOnError: true,
    },
  })
}

export default useCreateTerraformService
