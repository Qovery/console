import { Controller, useFormContext } from 'react-hook-form'
import { InputSelect, LoaderSpinner } from '@qovery/shared/ui'
import { useListTimezone } from '../hooks/use-list-timezone/use-list-timezone'

export function TimezoneSetting({ className = '' }: { className?: string }) {
  const { control } = useFormContext()
  const { data = [], isLoading } = useListTimezone()

  return (
    <div className={className}>
      {isLoading ? (
        <div className="py-2">
          <LoaderSpinner className="w-5" />
        </div>
      ) : (
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
      )}
    </div>
  )
}

export default TimezoneSetting
