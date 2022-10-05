import { FormEventHandler, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { SettingResources } from '@qovery/shared/console-shared'
import { MemorySizeEnum } from '@qovery/shared/enums'
import { Button, ButtonSize, ButtonStyle } from '@qovery/shared/ui'
import { ResourcesData } from '../../../feature/page-database-create-feature/database-creation-flow.interface'

export interface PageDatabaseCreateResourcesProps {
  onBack: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
}

export function PageDatabaseCreateResources(props: PageDatabaseCreateResourcesProps) {
  const { formState, setValue, getValues } = useFormContext<ResourcesData>()

  const [memorySize, setMemorySize] = useState<MemorySizeEnum | string>(getValues().memory_unit || MemorySizeEnum.MB)
  const [storageSize, setStorageSize] = useState<MemorySizeEnum | string>(getValues().storage_unit || MemorySizeEnum.MB)

  const getMemoryUnit = (value: string) => {
    setMemorySize(value)
    setValue('memory_unit', value)
    return value
  }

  const getStorageUnit = (value: string) => {
    setStorageSize(value)
    setValue('storage_unit', value)
    return value
  }

  return (
    <>
      <div className="mb-10">
        <h3 className="text-text-700 text-lg mb-2">Set resources</h3>
      </div>

      <form onSubmit={props.onSubmit}>
        <SettingResources
          isDatabase={true}
          getMemoryUnit={getMemoryUnit}
          memorySize={memorySize}
          displayWarningCpu={false}
          storageSize={storageSize}
          getStorageUnit={getStorageUnit}
        />

        <div className="flex justify-between">
          <Button
            onClick={props.onBack}
            className="btn--no-min-w"
            type="button"
            size={ButtonSize.XLARGE}
            style={ButtonStyle.STROKED}
          >
            Back
          </Button>
          <Button
            dataTestId="button-submit"
            type="submit"
            disabled={!formState.isValid}
            size={ButtonSize.XLARGE}
            style={ButtonStyle.BASIC}
          >
            Continue
          </Button>
        </div>
      </form>
    </>
  )
}

export default PageDatabaseCreateResources
