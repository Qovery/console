import { Controller, useFormContext } from 'react-hook-form'
import { ClusterGeneralData } from '@qovery/shared/interfaces'
import { InputText, InputTextArea, InputToggle } from '@qovery/shared/ui'

export interface ClusterGeneralSettingsProps {
  fromDetail?: boolean
}

export function ClusterGeneralSettings(props: ClusterGeneralSettingsProps) {
  const { fromDetail } = props
  const { control } = useFormContext<ClusterGeneralData>()

  return (
    <div>
      <Controller
        name="name"
        control={control}
        rules={{
          required: 'Please enter a name.',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            className="mb-3"
            dataTestId="input-name"
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            label="Cluster name"
            error={error?.message}
          />
        )}
      />
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <InputTextArea
            className={`${!fromDetail ? 'mb-3' : 'mb-5'}`}
            dataTestId="input-description"
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            label="Description"
          />
        )}
      />
      <Controller
        name="production"
        control={control}
        render={({ field }) => (
          <div
            className={`${
              !fromDetail
                ? 'rounded border border-zinc-200 p-4 mb-3'
                : 'relative pt-5 before:content-[""] before:block before:w-[calc(100%+40px)] before:h-[1px] before:bg-element-light-lighter-500 before:absolute before:top-0 before:-left-5'
            }`}
          >
            <InputToggle
              dataTestId="input-production-toggle"
              value={field.value}
              onChange={field.onChange}
              title="Production cluster"
              description="Actions on productions clusters will be more restricted"
              small
            />
          </div>
        )}
      />
    </div>
  )
}

export default ClusterGeneralSettings
