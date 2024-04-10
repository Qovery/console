import { Controller, useFormContext } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { InputSelect } from '@qovery/shared/ui'
import { useAnnotationsGroups } from '../hooks/use-annotations-groups/use-annotations-groups'

export function AnnotationSetting() {
  const { control } = useFormContext()
  const { organizationId = '' } = useParams()
  const { data: annotationsGroups = [] } = useAnnotationsGroups({ organizationId })

  return (
    <Controller
      name="annotations_groups"
      control={control}
      render={({ field, fieldState: { error } }) => (
        <InputSelect
          label="Annotation Groups (optional)"
          options={annotationsGroups.map((group) => ({
            label: group.name,
            value: group.id,
          }))}
          value={field.value}
          onChange={field.onChange}
          error={error?.message}
          isSearchable
          isMulti
        />
      )}
    />
  )
}

export default AnnotationSetting
