import { forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'loader'
}

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(function Spinner(
  { size = 'md', variant = 'default', className, ...props },
  ref
) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  const containerClasses = {
    default: 'flex items-center justify-center rounded-md border border-neutral-200 bg-white p-1 shadow-sm',
    loader:
      'flex items-center justify-center rounded-md border border-neutral-200 bg-white p-2 text-base text-neutral-350',
  }

  const svgSizes = {
    sm: { width: 12, height: 12 },
    md: { width: 12, height: 12 },
    lg: { width: 20, height: 20 },
  }

  const svgSize = svgSizes[size]

  return (
    <div ref={ref} className={twMerge(sizeClasses[size], containerClasses[variant], className)} {...props}>
      <svg
        className="animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        width={svgSize.width}
        height={svgSize.height}
        fill="none"
        viewBox="0 0 20 20"
      >
        <g clipPath="url(#clip0_spinner)">
          <path
            fill="url(#paint0_linear_spinner)"
            d="M10.938.938A.935.935 0 0 0 10 0a.935.935 0 0 0-.937.938v3.125c0 .519.417.937.937.937s.938-.418.938-.937zm0 15A.935.935 0 0 0 10 15a.935.935 0 0 0-.937.938v3.124c0 .52.417.938.937.938s.938-.418.938-.937zM0 10c0 .52.418.938.938.938h3.125c.519 0 .937-.418.937-.938a.935.935 0 0 0-.937-.937H.938A.935.935 0 0 0 0 10m15.938-.937A.935.935 0 0 0 15 10c0 .52.418.938.938.938h3.124c.52 0 .938-.418.938-.938a.935.935 0 0 0-.937-.937zM17.07 2.93a.934.934 0 0 0-1.324 0l-2.21 2.21a.937.937 0 0 0 1.324 1.324l2.21-2.21a.934.934 0 0 0 0-1.324M6.465 14.86a.937.937 0 0 0-1.324-1.324l-2.211 2.21a.937.937 0 0 0 1.324 1.324zM2.93 2.93a.934.934 0 0 0 0 1.324l2.21 2.21A.937.937 0 0 0 6.465 5.14l-2.21-2.21a.934.934 0 0 0-1.324 0m11.933 10.605a.937.937 0 0 0-1.324 1.324l2.207 2.211a.937.937 0 0 0 1.324-1.324l-2.21-2.21z"
          />
        </g>
        <defs>
          <linearGradient
            id="paint0_linear_spinner"
            x1="0"
            x2="20.274"
            y1="0"
            y2="0.292"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#7062F5" />
            <stop offset="1" stopColor="#7A40BD" />
          </linearGradient>
          <clipPath id="clip0_spinner">
            <path fill="#fff" d="M0 0h20v20H0z" />
          </clipPath>
        </defs>
      </svg>
    </div>
  )
})
