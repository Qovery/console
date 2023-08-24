import { type IconProps } from '../icon'

export function BitbucketIcon(props: IconProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      className={`svg-icon ${props.className || ''}`}
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <g clipPath="url(#clip0_19_67)">
        <path
          fill="#2684FF"
          d="M.779 1.171a.769.769 0 00-.77.892L3.275 21.88a1.046 1.046 0 001.023.872h15.66a.77.77 0 00.769-.645l3.264-20.04a.77.77 0 00-.769-.892L.78 1.171zm13.745 14.322H9.526l-1.354-7.07h7.563l-1.21 7.07z"
        ></path>
        <path
          fill="url(#paint0_linear_19_67)"
          d="M22.932 8.413h-7.21l-1.21 7.065H9.516l-5.897 7c.187.162.425.252.672.253h15.652a.768.768 0 00.768-.645l2.22-13.673z"
        ></path>
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_19_67"
          x1="24.6"
          x2="16.27"
          y1="10.392"
          y2="22.219"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.18" stopColor="#0052CC"></stop>
          <stop offset="1" stopColor="#2684FF"></stop>
        </linearGradient>
        <clipPath id="clip0_19_67">
          <path fill="#fff" d="M0 0H24V24H0z"></path>
        </clipPath>
      </defs>
    </svg>
  )
}

export default BitbucketIcon
