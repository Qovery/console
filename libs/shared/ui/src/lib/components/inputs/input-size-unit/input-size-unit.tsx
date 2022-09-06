import { useState } from 'react'
import { FieldError, FieldValues, UseFormSetValue } from 'react-hook-form'
import { MemorySizeEnum } from '@console/shared/enums'
import { convertMemory } from '@console/shared/utils'
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
  onChange?: () => void
  error?: FieldError
  setValue?: UseFormSetValue<FieldValues>
}

export const getSizeUnit = (memorySize: MemorySizeEnum | string, value: number | string) => {
  if (memorySize === MemorySizeEnum.GB) {
    return convertMemory(Number(value), MemorySizeEnum.MB)
  } else {
    return convertMemory(Number(value), MemorySizeEnum.GB)
  }
}

export function InputSizeUnit(props: InputSizeUnitProps) {
  const { name, maxSize, currentSize = 0, getUnit, currentUnit, error, value, onChange, setValue } = props

  const [memorySize, setMemorySize] = useState<string | MemorySizeEnum>(currentUnit || MemorySizeEnum.MB)

  const handleChangeMemoryUnit = (size: string | MemorySizeEnum) => {
    getUnit && getUnit(size)
    setMemorySize(size)

    if (size !== memorySize) {
      const currentSizeByUnit = getSizeUnit(size, value)
      setValue && setValue(name, currentSizeByUnit)
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
        <p data-testid="current-consumption" className="text-text-400 text-xs mt-1 ml-4">
          Current consumption:{' '}
          {currentSize < 1024 ? currentSize + ` ${MemorySizeEnum.MB}` : currentSize / 1024 + ` ${MemorySizeEnum.GB}`}
        </p>
      </div>
      <InputSelect
        className="w-full h-full"
        onChange={handleChangeMemoryUnit}
        items={Object.values(MemorySizeEnum).map((size) => ({
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
