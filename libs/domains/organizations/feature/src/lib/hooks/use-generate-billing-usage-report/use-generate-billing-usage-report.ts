import { useMutation } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'

export function useGenerateBillingUsageReport() {
  return useMutation(mutations.generateBillingUsageReport, {
    meta: {
      notifyOnSuccess: {
        title: 'Your usage report has been generated',
      },
      notifyOnError: true,
    },
  })
}

export default useGenerateBillingUsageReport
