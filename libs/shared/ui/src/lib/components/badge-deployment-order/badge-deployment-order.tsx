export interface BadgeDeploymentOrderProps {
  order?: number
  className?: string
}

export function BadgeDeploymentOrder(props: BadgeDeploymentOrderProps) {
  const { order = 0, className = '' } = props

  return (
    <div data-testid="badge" className={`relative drop-shadow-sm flex mr-2 ${className}`}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          data-testid="badge-svg"
          d="M0.75 7.4944V7.49434C0.749825 6.70932 0.956163 5.93795 1.34845 5.25727C1.74074 4.57661 2.30525 4.01043 2.98569 3.61534C2.98571 3.61533 2.98573 3.61532 2.98575 3.6153L7.73569 0.859176L7.73572 0.859157C8.42304 0.460203 9.20414 0.25 9.99947 0.25C10.7948 0.25 11.5759 0.460203 12.2632 0.859157L17.0132 3.6174L17.0132 3.61744C17.6933 4.01207 18.2577 4.57758 18.6501 5.25751C19.0426 5.93743 19.2494 6.70805 19.25 7.49249V12.5056V12.5057C19.2502 13.2907 19.0438 14.0621 18.6515 14.7427C18.2593 15.4234 17.6947 15.9896 17.0143 16.3847C17.0143 16.3847 17.0143 16.3847 17.0142 16.3847L12.2643 19.1408L12.2643 19.1408C11.577 19.5398 10.7959 19.75 10.0005 19.75C9.20521 19.75 8.42413 19.5398 7.73682 19.1409C7.73681 19.1409 7.73679 19.1409 7.73678 19.1408L2.98682 16.3826L2.98675 16.3826C2.30669 15.9879 1.74232 15.4224 1.34988 14.7425C0.957447 14.0626 0.750626 13.292 0.75 12.5075L0.75 12.5056V7.4944Z"
          fill="#009EDD"
          stroke="url(#paint0_linear_12619_562346)"
          strokeWidth="0.5"
        />
      </svg>
      <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-text-100 text-2xs">
        {order}
      </span>
    </div>
  )
}

export default BadgeDeploymentOrder
