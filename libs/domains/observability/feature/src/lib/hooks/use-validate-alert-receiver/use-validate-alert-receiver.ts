import { useMutation } from '@tanstack/react-query'
import type { AlertReceiverCreationValidationRequest, AlertReceiverValidationRequest } from 'qovery-typescript-axios'
import { mutations } from '@qovery/domains/observability/data-access'

export function useValidateAlertReceiver() {
  return useMutation(
    (
      params:
        | { alertReceiverId: string; payload: AlertReceiverValidationRequest }
        | { payload: AlertReceiverCreationValidationRequest }
    ) => {
      if ('alertReceiverId' in params) {
        return mutations.validateEditAlertReceiver({
          alertReceiverId: params.alertReceiverId,
          payload: params.payload,
        })
      }
      return mutations.validateNewAlertReceiver({ payload: params.payload })
    },
    {
      meta: {
        notifyOnSuccess: {
          title: 'Test sent successfully',
        },
        notifyOnError: true,
      },
    }
  )
}
