import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import ButtonPrimitive from '../button-primitive/button-primitive'
import LoaderSpinner from '../loader-spinner/loader-spinner'

export interface ButtonProps extends ComponentPropsWithoutRef<typeof ButtonPrimitive> {
  loading?: boolean
}

export const Button = forwardRef<ElementRef<typeof ButtonPrimitive>, ButtonProps>(function Button(
  { loading = false, className, ...props },
  forwardedRef
) {
  return (
    <ButtonPrimitive
      {...props}
      ref={forwardedRef}
      className={twMerge(loading ? 'pointer-events-none relative text-transparent' : '', className)}
    >
      {loading && <LoaderSpinner className="absolute left-0 right-0 m-auto" />}
      <div className={loading ? 'opacity-0' : ''}>{props.children}</div>
    </ButtonPrimitive>
  )
})

export default Button
