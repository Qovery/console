import { type ElementRef, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import ButtonPrimitive from '../button-primitive/button-primitive'
import LoaderSpinner from '../loader-spinner/loader-spinner'

export interface ButtonProps extends React.ComponentPropsWithoutRef<typeof ButtonPrimitive> {
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
      className={twMerge(loading ? 'relative pointer-events-none text-transparent' : '', className)}
    >
      {loading && <LoaderSpinner className="absolute m-auto left-0 right-0" theme="dark" />}
      {props.children}
    </ButtonPrimitive>
  )
})

export default Button
