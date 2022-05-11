import { Toaster } from 'react-hot-toast'

export interface ToastProps {
  trigger: React.ReactElement
}

export function Toast(props: ToastProps) {
  return <Toaster containerClassName="toaster" position="bottom-right" />
}

export default Toast
