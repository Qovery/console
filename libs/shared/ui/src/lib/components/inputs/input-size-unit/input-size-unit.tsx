import { useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { MemorySizeEnum } from '@console/shared/enums'
import { convertMemory } from '@console/shared/utils'
import InputSelect from '../input-select/input-select'
import InputText from '../input-text/input-text'

export interface InputSizeUnitProps {
  name: string
  currentUnit?: string | MemorySizeEnum
  maxSize?: number
  minSize?: number
  currentSize?: number
  getUnit?: (value: string | MemorySizeEnum) => void
}

export const getSizeUnit = (memorySize: MemorySizeEnum | string, value: number | string) => {
  if (memorySize === MemorySizeEnum.GB) {
    return convertMemory(Number(value), MemorySizeEnum.MB)
  } else {
    return convertMemory(Number(value), MemorySizeEnum.GB)
  }
}

export function InputSizeUnit(props: InputSizeUnitProps) {
  const { name, maxSize, minSize = 0, currentSize = 0, getUnit, currentUnit } = props

  const { control, watch, setValue } = useFormContext()
  const [memorySize, setMemorySize] = useState<string | MemorySizeEnum>(currentUnit || MemorySizeEnum.MB)

  const pattern = {
    value: /^[0-9]+$/,
    message: 'Please enter a number.',
  }

  const handleChangeMemoryUnit = (size: string | MemorySizeEnum) => {
    getUnit && getUnit(size)
    setMemorySize(size)

    if (size !== memorySize) {
      const currentSizeByUnit = getSizeUnit(size, watch(name))
      setValue(name, currentSizeByUnit)
    }
  }

  return (
    <div key={`size-${name}-${memorySize}`} className="flex w-full gap-3">
      <div className="w-full">
        <Controller
          name={name}
          control={control}
          rules={{
            required: 'Please enter a size.',
            validate: (value: number) => (maxSize ? value <= maxSize : undefined),
            max: maxSize,
            min: minSize,
            pattern: pattern,
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              type="number"
              dataTestId={`input-memory-${name}`}
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              label="Size"
              error={
                error?.type === 'required'
                  ? 'Please enter a size.'
                  : error?.type === 'max'
                  ? `Maximum allowed ${name} is: ${maxSize} ${memorySize}.`
                  : undefined
              }
            />
          )}
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
