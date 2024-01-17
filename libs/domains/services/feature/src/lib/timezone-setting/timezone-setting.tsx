import { Controller, useFormContext } from 'react-hook-form'
import { InputSelect } from '@qovery/shared/ui'
import { useListTimezone } from '../hooks/use-list-timezone/use-list-timezone'

export function TimezoneSetting({ className = '' }: { className?: string }) {
  const { control } = useFormContext()
  const { data = [] } = useListTimezone()

  return (
    <div className={className}>
      <Controller
        name="timezone"
        control={control}
        defaultValue="Etc/UTC"
        rules={{
          required: 'Please select a timezone.',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputSelect
            isSearchable
            label="Timezone"
            onChange={field.onChange}
            options={data.map((tz) => ({
              label: tz,
              value: tz,
            }))}
            value={field.value}
            error={error?.message}
          />
        )}
      />
    </div>
  )
}

export default TimezoneSetting
