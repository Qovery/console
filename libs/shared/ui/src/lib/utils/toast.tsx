import { toast as sonnerToast } from 'sonner'
import { CustomToast } from '../components/toast/toast'

export type ToastStatus = 'success' | 'error' | 'warning'

export const toast = (
  status: ToastStatus,
  title: string,
  description?: string,
  callback?: () => void,
  labelAction?: string
) => {
  const action = labelAction
    ? {
        label: labelAction,
        onClick: callback,
      }
    : undefined

  return sonnerToast.custom((id) => (
    <CustomToast id={id} status={status} title={title} description={description} action={action} />
  ))
}

export default toast
