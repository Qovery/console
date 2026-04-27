import { toast as sonnerToast } from 'sonner'
import { match } from 'ts-pattern'
import { CustomToast } from '../components/toast/toast'

export enum ToastEnum {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
}

export const toast = (
  status: ToastEnum | keyof typeof ToastEnum,
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

  return match(status)
    .with(ToastEnum.SUCCESS, ToastEnum.ERROR, ToastEnum.WARNING, (toastStatus) =>
      sonnerToast.custom((id) => (
        <CustomToast id={id} status={toastStatus} title={title} description={description} action={action} />
      ))
    )
    .exhaustive()
}

export default toast
