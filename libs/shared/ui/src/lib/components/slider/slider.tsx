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
        <div className="mb-2 flex items-center justify-between">
          {label && (
            <p data-testid="label" className="text-sm text-neutral-400">
              {label}
            </p>
          )}
          {valueLabel && value && (
            <p className="font-medium text-brand-500">
              {value.map((currentValue, index) => `${currentValue}${index < value.length - 1 ? ', ' : ''}`)}
              {valueLabel}
            </p>
          )}
        </div>
      )}
      <Root
        onValueChange={(value) => handleChange(value)}
        className="relative flex h-1 w-full cursor-pointer rounded bg-neutral-300"
        value={value}
        min={min}
        max={max}
        step={step}
      >
        <Track className="relative flex h-1 flex-grow rounded-full bg-neutral-300">
          <Range className="absolute h-full rounded-full bg-brand-500" />
        </Track>
        {value?.map((v, index) => (
          <Thumb
            key={index}
            className="duration-600 -mt-1.5 block h-4 w-4 cursor-grab rounded-full bg-brand-500 transition-all ease-in-out hover:bg-brand-600 focus:shadow-2xl focus-visible:cursor-grabbing focus-visible:outline-none"
          />
        ))}
      </Root>
    </div>
  )
}

export default Slider
