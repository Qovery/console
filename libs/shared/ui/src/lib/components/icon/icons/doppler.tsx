import { type IconProps } from '../icon'

export function DopplerIcon(props: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} fill="none" viewBox="0 0 11 12">
      <path
        fill="url(#paint0_linear_13638_482988)"
        fillRule="evenodd"
        d="M.202.5a.11.11 0 00-.093.171l1.972 3.087c.164.255.445.41.748.41h2.667c.978 0 1.589.864 1.585 1.832-.003.968-.655 1.824-1.585 1.824H2.648a.295.295 0 00-.295.296v3.084c0 .164.132.296.295.296h3.638C9.433 11.5 10.998 8.514 11 6 11.002 3.486 9.455.5 6.286.5H.202zm1.294 7.332H.788c-.435 0-.788.41-.788.917v2.67c0 .044.036.08.08.08h.708c.435 0 .787-.41.787-.917v-2.67a.08.08 0 00-.08-.08z"
        clipRule="evenodd"
      ></path>
      <defs>
        <linearGradient
          id="paint0_linear_13638_482988"
          x1="8.78"
          x2="1.006"
          y1="0.134"
          y2="10.56"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.036" stopColor="#409FF8"></stop>
          <stop offset="0.5" stopColor="#1673FF"></stop>
          <stop offset="1" stopColor="#516FF7"></stop>
        </linearGradient>
      </defs>
    </svg>
  )
}

export default DopplerIcon
