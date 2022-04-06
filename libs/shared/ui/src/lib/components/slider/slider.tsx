import { useRef, useState } from 'react'

export interface SliderProps {
  min: number
  max: number
  step: number
  defaultValue?: number
  label?: string
  valueLabel?: string
  className?: string
  getValue?: (value: number) => void
  brandColor?: string
  grayColor?: string
}

export function Slider(props: SliderProps) {
  const {
    min,
    max,
    step,
    defaultValue,
    label,
    valueLabel,
    className = '',
    getValue,
    brandColor = '#5b50d6',
    grayColor = '#C6D3E7',
  } = props
  const [value, setValue] = useState(defaultValue || min)

  const inputEl = useRef(null)

  const handleChange = (value: string) => {
    const valueInt = parseInt(value, 10)
    setValue(valueInt)
    if (getValue) getValue(valueInt)
  }

  return (
    <div className={`slider w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <p data-testid="label" className="text-text-500 text-sm">
              {label}
            </p>
          )}
          {valueLabel && (
            <p className="text-brand-500 font-medium">
              {value}
              {valueLabel}
            </p>
          )}
        </div>
      )}
      <input
        data-testid="input-range"
        style={{
          background: `linear-gradient(to right, ${brandColor} 0%, ${brandColor} ${
            ((value - min) / (max - min)) * 100
          }%, ${grayColor} ${((value - min) / (max - min)) * 100}%, ${grayColor} 100%)`,
        }}
        ref={inputEl}
        type="range"
        min={min}
        max={max}
        value={value}
        step={step}
        onChange={(event) => handleChange(event.target.value)}
      />
    </div>
  )
}

export default Slider
