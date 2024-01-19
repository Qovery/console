import { useMutation } from '@tanstack/react-query'
import download from 'downloadjs'
import { mutations } from '@qovery/domains/environments/data-access'

export function useExportTerraform() {
  return useMutation(mutations.exportTerraform, {
    onSuccess(data, { environmentId }) {
      download(data, `terraform-manifest-${environmentId}.zip`, 'application/zip')
    },
    meta: {
      notifyOnError: true,
    },
  })
}

export default useExportTerraform
