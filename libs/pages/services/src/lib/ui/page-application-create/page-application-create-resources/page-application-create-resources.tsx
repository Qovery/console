import { FormEventHandler, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { SettingResources } from '@qovery/shared/console-shared'
import { MemorySizeEnum } from '@qovery/shared/enums'
import { Button, ButtonSize, ButtonStyle } from '@qovery/shared/ui'
import { ResourcesData } from '../../../feature/page-application-create-feature/interfaces.interface'

export interface PageApplicationCreateResourcesProps {
  onBack: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
}

export function PageApplicationCreateResources(props: PageApplicationCreateResourcesProps) {
  const { formState, watch } = useFormContext<ResourcesData>()

  watch((data) => {
    console.log(data)
  })

  const [memorySize, setMemorySize] = useState<MemorySizeEnum | string>(MemorySizeEnum.MB)

  const getMemoryUnit = (value: string) => {
    setMemorySize(value)
    return value
  }

  return (
    <div>
      <div className="mb-10">
        <h3 className="text-text-700 text-lg mb-2">Application General Data</h3>
      </div>

      <form onSubmit={props.onSubmit}>
        <SettingResources getMemoryUnit={getMemoryUnit} memorySize={memorySize} displayWarningCpu={false} />

        <div className="flex justify-between">
          <Button onClick={props.onBack} type="button" size={ButtonSize.XLARGE} style={ButtonStyle.STROKED}>
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
    </div>
  )
}

export default PageApplicationCreateResources
