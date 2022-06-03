import { IconProps } from '../icon'

export function ErrorIcon(props: IconProps) {
  return (
    <svg
      name={props.name}
      width={props.width}
      viewBox={props.viewBox}
      className={props.className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill={props.pathColor ? props.pathColor : '#FF6240'}
        d="M7 .583A6.417 6.417 0 1013.416 7 6.424 6.424 0 007 .583zm-.03 2.57a.611.611 0 01.64.64l-.21 4.41a.401.401 0 01-.801 0l-.21-4.41a.611.611 0 01.582-.64zm.598 7.223a.804.804 0 11-.569-1.37.803.803 0 01.569 1.37z"
      ></path>
    </svg>
  )
}

export default ErrorIcon
