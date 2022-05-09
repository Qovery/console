export interface InputTextSmallProps {
  name: string
  type?: string
  onChange?: () => void
  value?: string
  placeholder?: string
  error?: string
  className?: string
}

export function InputTextSmall(props: InputTextSmallProps) {
  const { name, value, placeholder, error, onChange, type = 'text', className = '' } = props

  const hasError = error && error.length > 0 ? 'input--error' : ''
  const hasValue = value && value.length > 0 ? 'input--focused' : ''

  return (
    <div className={className}>
      <div data-testid="input" className={`input input--small ${hasError} ${hasValue}`}>
        <input
          className="absolute text-sm top-0 left-0 h-full w-full text-text-600 placeholder:text-text-400 rounded px-4"
          name={name}
          type={type}
          placeholder={placeholder}
          defaultValue={value}
          onChange={onChange}
        />
      </div>
      {error && <p className="px-4 mt-1 font-medium text-xs text-error-500">{error}</p>}
    </div>
  )
}

export default InputTextSmall
