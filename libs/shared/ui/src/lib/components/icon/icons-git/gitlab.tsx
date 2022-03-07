import { IconProps } from '../icon'

export function GitlabIcon(props: IconProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      className={`svg-icon ${props.className || ''}`}
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <g clipPath="url(#clip0_19_61)">
        <path fill="#E24329" d="M12.007 24.008l4.416-14.743H7.591l4.416 14.743z"></path>
        <path fill="#FC6D26" d="M12.007 24.007L7.591 9.265H1.402l10.605 14.742z"></path>
        <path
          fill="#FCA326"
          d="M1.402 9.265L.06 13.745c-.06.2-.06.414 0 .613.06.2.176.373.332.496l11.614 9.154L1.402 9.264z"
        ></path>
        <path fill="#E24329" d="M1.402 9.265h6.189L4.93.385a.447.447 0 00-.87 0l-2.659 8.88z"></path>
        <path fill="#FC6D26" d="M12.007 24.007l4.416-14.742h6.189L12.007 24.007z"></path>
        <path
          fill="#FCA326"
          d="M22.612 9.265l1.342 4.48c.06.2.06.414 0 .613a.992.992 0 01-.332.496l-11.615 9.154L22.612 9.264z"
        ></path>
        <path fill="#E24329" d="M22.612 9.265h-6.189l2.66-8.88a.447.447 0 01.87 0l2.659 8.88z"></path>
      </g>
      <defs>
        <clipPath id="clip0_19_61">
          <path fill="#fff" d="M0 0H24V24H0z"></path>
        </clipPath>
      </defs>
    </svg>
  )
}

export default GitlabIcon
