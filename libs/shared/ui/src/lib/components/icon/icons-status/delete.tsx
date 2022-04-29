import { IconProps } from '../icon'

export function DeleteIcon(props: IconProps) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#A0AFC5"
        d="M9.368 4.631a.875.875 0 010 1.238L8.237 7l1.131 1.131A.875.875 0 118.131 9.37L6.999 8.237 5.87 9.37A.875.875 0 114.63 8.13L5.76 7l-1.13-1.131A.875.875 0 115.868 4.63L7 5.763 8.131 4.63a.875.875 0 011.237 0z"
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

export default DeleteIcon
