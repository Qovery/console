import { useMutation } from '@tanstack/react-query'
import download from 'downloadjs'
import { mutations } from '@qovery/domains/clusters/data-access'

export function useDownloadKubeconfig() {
  return useMutation(mutations.kubeconfig, {
    onSuccess(data, { clusterId }) {
      download(data, `cluster-kubeconfig-${clusterId}.yaml`, 'text/plain')
    },
    meta: {
      notifyOnError: true,
    },
  })
}

export default useDownloadKubeconfig
