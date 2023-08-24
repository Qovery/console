import { type IconProps } from '../icon'

function DOIcon(props: IconProps) {
  return (
    <svg {...props} width="14" height="15" fill="none" viewBox="0 0 14 15">
      <path
        fill="#0080FF"
        d="M7.001 14.63v-2.714c2.873 0 5.104-2.85 4-5.874a4.065 4.065 0 00-2.42-2.413c-3.025-1.095-5.874 1.127-5.874 4H0C0 3.05 4.43-.521 9.231.98a6.778 6.778 0 014.422 4.42c1.5 4.803-2.072 9.232-6.652 9.232z"
      ></path>
      <path
        fill="#0080FF"
        fillRule="evenodd"
        d="M7.009 11.931H4.302V9.225H7.01v2.706zM4.302 14.003H2.23v-2.071h2.072v2.071zM2.23 11.932H.493v-1.739h1.739v1.739z"
        clipRule="evenodd"
      ></path>
    </svg>
  )
}

export default DOIcon
