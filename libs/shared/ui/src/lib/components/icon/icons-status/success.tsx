import { IconProps } from '../icon'

export function SuccessIcon(props: IconProps) {
  return (
    <svg
      name={props.name}
      width={props.width}
      viewBox={props.viewBox}
      className={props.className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill={`${props.pathColor ? props.pathColor : '#44C979'}`}
        d="M5.908 2.16a4.958 4.958 0 013.11.308.875.875 0 10.713-1.599 6.708 6.708 0 103.978 6.132v-.538a.875.875 0 00-1.75 0V7a4.958 4.958 0 11-6.051-4.84z"
      ></path>
      <path
        fill={`${props.pathColor ? props.pathColor : '#44C979'}`}
        d="M13.453 2.952a.875.875 0 00-1.238-1.237L7 6.935 5.869 5.804a.875.875 0 10-1.237 1.237l1.75 1.75a.875.875 0 001.237 0l5.834-5.84z"
      ></path>
    </svg>
  )
}

export default SuccessIcon
