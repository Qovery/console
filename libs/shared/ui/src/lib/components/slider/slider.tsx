import { Range, Root, Thumb, Track } from '@radix-ui/react-slider'

export interface SliderProps {
  min: number
  max: number
  step: number
  value?: number[]
  onChange: (value: number[]) => void
  label?: string
  valueLabel?: string
  className?: string
  dataTestId?: string
}

export function Slider(props: SliderProps) {
  const { min, max, step, value, label, valueLabel, className = '', onChange, dataTestId } = props

  const handleChange = (value: number[]) => {
    if (onChange) onChange(value)
  }

  return (
    <div data-testid={dataTestId || 'input-slider'} className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <p data-testid="label" className="text-text-500 text-sm">
              {label}
            </p>
          )}
          {valueLabel && value && (
            <p className="text-brand-500 font-medium">
              {value.map((currentValue, index) => `${currentValue}${index < value.length - 1 ? ', ' : ''}`)}
              {valueLabel}
            </p>
          )}
        </div>
      )}
      <Root
        onValueChange={(value) => handleChange(value)}
        className="relative flex w-full h-1 bg-element-light-lighter-600 rounded cursor-pointer"
        value={value}
        min={min}
        max={max}
        step={step}
      >
        <Track className="relative flex flex-grow h-1 bg-element-light-lighter-600 rounded-full">
          <Range className="absolute bg-brand-500 rounded-full h-full" />
        </Track>
        {value?.map((v, index) => (
          <Thumb
            key={index}
            className="block h-4 w-4 -mt-1.5 bg-brand-500 transition-all ease-in-out duration-600 hover:bg-brand-600 focus:shadow-2xl focus-visible:outline-none rounded-full cursor-grab focus-visible:cursor-grabbing"
          />
        ))}
      </Root>
    </div>
  )
}

export default Slider
