import { toast as sonnerToast } from 'sonner'
import { CustomToast } from '../components/toast/toast'

export enum ToastEnum {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
}

const TOAST_STATUS_BY_KEY: Record<keyof typeof ToastEnum, ToastEnum> = {
  SUCCESS: ToastEnum.SUCCESS,
  ERROR: ToastEnum.ERROR,
  WARNING: ToastEnum.WARNING,
}

export const toast = (
  status: keyof typeof ToastEnum,
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

  const toastStatus = TOAST_STATUS_BY_KEY[status]

  return sonnerToast.custom((id) => (
    <CustomToast id={id} status={toastStatus} title={title} description={description} action={action} />
  ))
}

export default toast
