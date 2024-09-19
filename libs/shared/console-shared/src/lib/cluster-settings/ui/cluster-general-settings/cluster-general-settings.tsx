import { Controller, useFormContext } from 'react-hook-form'
import { type ClusterGeneralData } from '@qovery/shared/interfaces'
import { InputText, InputTextArea, InputToggle } from '@qovery/shared/ui'

export interface ClusterGeneralSettingsProps {
  fromDetail?: boolean
}

export function ClusterGeneralSettings(props: ClusterGeneralSettingsProps) {
  const { fromDetail } = props
  const { control, setValue } = useFormContext<ClusterGeneralData>()

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
            onChange={(e) => {
              if (!fromDetail && e.target.value.toLowerCase().includes('prod')) {
                setValue('production', true)
              }
              field.onChange(e)
            }}
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
                ? 'mb-3 rounded border border-neutral-250 bg-neutral-100 p-4'
                : 'relative pt-5 before:absolute before:-left-5 before:top-0 before:block before:h-[1px] before:w-[calc(100%+40px)] before:bg-neutral-250 before:content-[""]'
            }`}
          >
            <InputToggle
              dataTestId="input-production-toggle"
              value={field.value}
              onChange={field.onChange}
              title="Production cluster"
              description="Actions on productions clusters will be more restricted"
              forceAlignTop
              small
            />
          </div>
        )}
      />
    </div>
  )
}

export default ClusterGeneralSettings
