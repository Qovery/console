import { type ElementRef, forwardRef } from 'react'
import ButtonPrimitive from '../button-primitive/button-primitive'
import LoaderSpinner from '../loader-spinner/loader-spinner'

export interface ButtonProps extends React.ComponentPropsWithoutRef<typeof ButtonPrimitive> {
  loading?: boolean
}

export const Button = forwardRef<ElementRef<typeof ButtonPrimitive>, ButtonProps>(function Button(
  { loading = false, ...props },
  forwardedRef
) {
  return (
    <ButtonPrimitive {...props} ref={forwardedRef} loading={loading}>
      {loading && <LoaderSpinner className="absolute m-auto left-0 right-0" theme="dark" />}
      <span className={loading ? 'opacity-0' : undefined}>{props.children}</span>
    </ButtonPrimitive>
  )
})

export default Button
