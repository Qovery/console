import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import ButtonPrimitive from '../button-primitive/button-primitive'
import LoaderSpinner from '../loader-spinner/loader-spinner'
import { Icon } from '@qovery/shared/ui'

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
      className={twMerge(
        'transition-colors group',
        loading ? 'relative text-transparent' : '',
        className
      )}
    >
      {loading && (
        <LoaderSpinner className='absolute left-0 right-0 m-auto group-hover:opacity-0 transition-opacity' theme="dark" />
      )}
      {loading && (
        <Icon className='absolute left-0 right-0 m-auto group-hover:opacity-100 opacity-0' iconName="stop" iconStyle="light" />
      )}
      {props.children}
    </ButtonPrimitive>
  )
})

export default Button
