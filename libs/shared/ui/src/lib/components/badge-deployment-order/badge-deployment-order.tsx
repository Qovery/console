import { twMerge } from '@qovery/shared/util-js'

export interface BadgeDeploymentOrderProps {
  order?: number
  className?: string
}

export function BadgeDeploymentOrder({ order = 0, className }: BadgeDeploymentOrderProps) {
  return (
    <div data-testid="badge" className={twMerge('relative mr-2 flex drop-shadow-sm', className)}>
      <svg data-testid="badge-svg" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
        <path
          fill="#009EDD"
          stroke="#3AB0E9"
          strokeWidth="0.667"
          d="M1 5.996v0c0-.607.154-1.203.446-1.728A3.398 3.398 0 012.66 3.005L6.327.8h0A3.242 3.242 0 017.999.333 3.242 3.242 0 019.672.8l3.667 2.207h0c.503.302.922.737 1.214 1.261.292.525.446 1.12.447 1.726v4.01c0 .607-.154 1.203-.446 1.728-.292.525-.711.96-1.215 1.263L9.673 15.2h0A3.242 3.242 0 018 15.667c-.587 0-1.164-.161-1.672-.467L2.66 12.993h0a3.398 3.398 0 01-1.214-1.261A3.556 3.556 0 011 10.006v-4.01z"
        ></path>
      </svg>
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform text-xs font-medium text-neutral-50 dark:text-neutral-700">
        {order}
      </span>
    </div>
  )
}

export default BadgeDeploymentOrder
