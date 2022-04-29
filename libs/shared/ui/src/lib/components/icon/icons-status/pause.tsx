import { IconProps } from '../icon'

export function PauseIcon(props: IconProps) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#A0AFC5"
        d="M5.833 4.375c.483 0 .875.392.875.875v3.5a.875.875 0 11-1.75 0v-3.5c0-.483.391-.875.875-.875zM9.041 5.25a.875.875 0 10-1.75 0v3.5a.875.875 0 101.75 0v-3.5z"
      ></path>
      <path
        fill="#A0AFC5"
        fillRule="evenodd"
        d="M.291 7a6.708 6.708 0 1113.417 0A6.708 6.708 0 01.29 7zm6.708-4.958a4.958 4.958 0 100 9.916 4.958 4.958 0 000-9.916z"
        clipRule="evenodd"
      ></path>
    </svg>
  )
}

export default PauseIcon
