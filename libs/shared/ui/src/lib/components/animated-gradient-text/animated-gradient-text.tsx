import { type CSSProperties, type PropsWithChildren } from 'react'
import { twMerge } from '@qovery/shared/util-js'

export interface AnimatedGradientTextProps extends PropsWithChildren {
  className?: string
  shimmerWidth?: number
}

// Inspired by https://magicui.design/docs/components/animated-shiny-text
export function AnimatedGradientText({ children, className, shimmerWidth = 100 }: AnimatedGradientTextProps) {
  return (
    <span
      style={
        {
          '--shiny-width': `${shimmerWidth}px`,
        } as CSSProperties
      }
      className={twMerge(
        'relative inline-flex animate-[shiny-text_3s_linear_infinite] items-center bg-gradient-to-r from-brand-500 via-brand-200 via-60% to-brand-500 bg-clip-text text-transparent [background-position:0_0] [background-size:var(--shimmer-width)_100%]',
        className
      )}
    >
      {children}
    </span>
  )
}

export default AnimatedGradientText
