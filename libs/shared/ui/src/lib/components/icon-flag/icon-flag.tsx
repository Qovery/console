import ReactCountryFlag from 'react-country-flag'

export interface IconFlagProps {
  code: string
  className?: string
}

export function IconFlag(props: IconFlagProps) {
  const { code = 'US', className = '' } = props

  return (
    <ReactCountryFlag className={`rounded-sm drop-shadow !w-[14px] !h-[11px] ${className}`} countryCode={code} svg />
  )
}

export default IconFlag
