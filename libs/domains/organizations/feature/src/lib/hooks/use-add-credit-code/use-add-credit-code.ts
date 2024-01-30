import { useMutation } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'

export function useAddCreditCode() {
  return useMutation(mutations.addCreditCode, {
    meta: {
      notifyOnSuccess: {
        title: 'Your code has been added',
      },
      notifyOnError: true,
    },
  })
}

export default useAddCreditCode
