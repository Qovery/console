import { useState } from 'react'
import { FieldError } from 'react-hook-form'
import { MemorySizeEnum } from '@qovery/shared/enums'
import { convertMemory } from '@qovery/shared/utils'
import InputSelect from '../input-select/input-select'
import InputText from '../input-text/input-text'

export interface InputSizeUnitProps {
  name: string
  value: number
  currentUnit?: string | MemorySizeEnum
  maxSize?: number
  minSize?: number
  currentSize?: number
  getUnit?: (value: string | MemorySizeEnum) => void
  onChange?: (...event: any[]) => void
  error?: FieldError
  showConsumption?: boolean
}

export const getSizeUnit = (memorySize: MemorySizeEnum | string, value: number | string) => {
  if (memorySize === MemorySizeEnum.GB) {
    return convertMemory(Number(value), MemorySizeEnum.MB)
  } else {
    return convertMemory(Number(value), MemorySizeEnum.GB)
  }
}

export function InputSizeUnit(props: InputSizeUnitProps) {
  const { name, maxSize, currentSize = 0, getUnit, currentUnit, error, value, onChange, showConsumption = true } = props

  const [memorySize, setMemorySize] = useState<string | MemorySizeEnum>(currentUnit || MemorySizeEnum.MB)

  const handleChangeMemoryUnit = (size: string | MemorySizeEnum) => {
    getUnit && getUnit(size)
    setMemorySize(size)

    if (size !== memorySize) {
      const currentSizeByUnit = getSizeUnit(size, value)
      onChange && onChange(currentSizeByUnit)
    }
  }

  return (
    <div key={`size-${name}-${memorySize}`} className="flex w-full gap-3">
      <div className="w-full">
        <InputText
          type="number"
          dataTestId={`input-memory-${name}`}
          name={name}
          onChange={onChange}
          value={value}
          label="Size"
          error={
            error?.type === 'required'
              ? 'Please enter a size.'
              : error?.type === 'max'
              ? `Maximum allowed ${name} is: ${maxSize} ${memorySize}.`
              : undefined
          }
        />
        {showConsumption && (
          <p data-testid="current-consumption" className="text-text-400 text-xs mt-1 ml-4">
            Current consumption:{' '}
            {currentSize < 1024 ? currentSize + ` ${MemorySizeEnum.MB}` : currentSize / 1024 + ` ${MemorySizeEnum.GB}`}
          </p>
        )}
      </div>
      <InputSelect
        className="w-full h-full"
        onChange={(e) => {
          handleChangeMemoryUnit(e as string)
        }}
        options={Object.values(MemorySizeEnum).map((size) => ({
          label: size,
          value: size,
        }))}
        value={memorySize}
        label="Unit"
      />
    </div>
  )
}

export default InputSizeUnit
