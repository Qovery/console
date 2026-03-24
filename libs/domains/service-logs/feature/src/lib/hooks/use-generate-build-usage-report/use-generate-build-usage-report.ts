import { useMutation } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/environments/data-access'

export function useGenerateBuildUsageReport() {
  return useMutation(mutations.generateBuildUsageReport, {
    meta: {
      notifyOnSuccess: {
        title: 'Your build usage report has been generated',
      },
      notifyOnError: true,
    },
  })
}

export default useGenerateBuildUsageReport
