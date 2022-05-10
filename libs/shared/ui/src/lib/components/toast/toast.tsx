import * as ToastPrimitive from '@radix-ui/react-toast'

export interface ToastProps {
  trigger: React.ReactElement
}

export function Toast(props: ToastProps) {
  const { trigger } = props

  return (
    <ToastPrimitive.Provider {...props}>
      {trigger}
      <ToastPrimitive.Root type="foreground">
        <div>
          <h3>Hello world</h3>
          <p>hello world</p>
          <ToastPrimitive.Close aria-label="Close">
            <span aria-hidden>×</span>
          </ToastPrimitive.Close>
        </div>
      </ToastPrimitive.Root>

      <ToastPrimitive.Viewport />
    </ToastPrimitive.Provider>
  )
}

export default Toast
