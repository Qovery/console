import { useRef, useState } from 'react'

export interface SliderProps {
  min: number
  max: number
  step: number
  defaultValue?: number
  label?: string
  valueLabel?: string
  className?: string
}

export function Slider(props: SliderProps) {
  const { min, max, step, defaultValue, label, valueLabel, className = '' } = props
  const [value, setValue] = useState(defaultValue || min)

  const inputEl = useRef(null)

  const handleChange = (value: string) => {
    const valueInt = parseInt(value, 10)
    setValue(valueInt)
  }

  return (
    <div className={`slider ${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          {label && <p className="text-text-500 text-sm">{label}</p>}
          {valueLabel && (
            <p className="text-brand-500 font-medium">
              {value}
              {valueLabel}
            </p>
          )}
        </div>
      )}
      <input
        style={{
          background: `linear-gradient(to right, #5b50d6 0%, #5b50d6 ${((value - min) / (max - min)) * 100}%, #C6D3E7 ${
            ((value - min) / (max - min)) * 100
          }%, #C6D3E7 100%)`,
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
