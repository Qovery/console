import { useMutation } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/clusters/data-access'

export function useInstallationHelmValues() {
  return useMutation(mutations.installationHelmValues)
}

export default useInstallationHelmValues
