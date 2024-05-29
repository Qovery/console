import { useMutation } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/environments/data-access'

export function useCheckDockerfile() {
  return useMutation(mutations.checkDockerfile, {
    meta: {
      notifyOnError: true,
    },
  })
}

export default useCheckDockerfile
