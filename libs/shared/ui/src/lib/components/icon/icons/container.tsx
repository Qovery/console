import { type IconProps } from '../icon'

export function ContainerIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      {...props}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        fill="#2196F3"
        d="M12.025 3l8.946 3.992-8.946 3.962-9.062-3.962L12.026 3zM12.22 11.503L21 7.653v9.154l-8.78 4.157v-9.46zM11.588 11.434L2.963 7.652v9.155l8.625 4.202v-9.575z"
      ></path>
    </svg>
  )
}

export default ContainerIcon
