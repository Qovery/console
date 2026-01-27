import ReactCountryFlag from 'react-country-flag'

export interface IconFlagProps {
  code: string
  className?: string
}

export function IconFlag(props: IconFlagProps) {
  const { code = 'US', className = '' } = props

  return (
    <ReactCountryFlag
      className={`retina:border-[0.5px] !h-[11px] !w-[14px] rounded-sm border border-neutral ${className}`}
      countryCode={code}
      svg
    />
  )
}

export default IconFlag
