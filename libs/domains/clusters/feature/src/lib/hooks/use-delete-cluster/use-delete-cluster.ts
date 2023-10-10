import { useMutation } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/clusters/data-access'

export function useDeleteCluster() {
  return useMutation(mutations.deleteCluster, {
    meta: {
      notifyOnSuccess: {
        title: 'Your cluster is being deleted',
      },
      notifyOnError: true,
    },
  })
}

export default useDeleteCluster
