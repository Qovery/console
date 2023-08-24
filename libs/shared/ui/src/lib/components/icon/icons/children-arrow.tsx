import { type IconProps } from '../icon'

function ChildrenArrow(props: IconProps) {
  return (
    <svg
      {...props}
      width="9"
      height="6"
      fill="none"
      viewBox="0 0 9 6"
      xmlns="http://www.w3.org/2000/svg"
      className={`svg-icon ${props.className || ''}`}
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <path fill="#BABEEC" d="M5.305.4v2H1.768V0H0v3.2c0 .444.393.8.884.8h4.421v2L8.4 3.2 5.305.4z"></path>
    </svg>
  )
}

export default ChildrenArrow
