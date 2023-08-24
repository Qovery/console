import { type IconProps } from '../icon'

export function CronJobStrokeIcon(props: IconProps) {
  return (
    <svg width={16} height={16} fill="none" xmlns="http://www.w3.org/2000/svg" {...props} viewBox="0 0 16 18">
      <circle cx={8} cy={8} r={7} stroke="#5B50D6" strokeWidth={2} />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.686 3.948a.667.667 0 0 0-.667.666v4l2.967 2.967a.667.667 0 0 0 .942-.943L8.352 8.062V4.614a.667.667 0 0 0-.666-.666Z"
        fill="#5B50D6"
      />
    </svg>
  )
}

export default CronJobStrokeIcon
