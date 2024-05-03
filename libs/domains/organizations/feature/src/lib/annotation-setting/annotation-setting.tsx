import { Controller, useFormContext } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { Icon, InputSelect, Tooltip, useModal } from '@qovery/shared/ui'
import { AnnotationCreateEditModal } from '../annotation-create-edit-modal/annotation-create-edit-modal'
import { useAnnotationsGroups } from '../hooks/use-annotations-groups/use-annotations-groups'

export function AnnotationSetting() {
  const { control } = useFormContext()
  const { organizationId = '' } = useParams()
  const { data: annotationsGroups = [] } = useAnnotationsGroups({ organizationId })
  const { openModal, closeModal } = useModal()

  return (
    <Controller
      name="annotations_groups"
      control={control}
      render={({ field, fieldState: { error } }) => (
        <InputSelect
          label="Annotation Groups (optional)"
          options={annotationsGroups.map((group) => ({
            label: (
              <span className="flex items-center gap-3">
                <span>{group.name}</span>
                <Tooltip
                  classNameContent="z-10"
                  content={
                    <ul>
                      {group.annotations.map(({ key, value }) => (
                        <li key={key}>
                          {key}: {value}
                        </li>
                      ))}
                    </ul>
                  }
                >
                  <span>
                    <Icon iconName="circle-info" iconStyle="regular" className="text-base" />
                  </span>
                </Tooltip>
              </span>
            ),
            value: group.id,
          }))}
          menuListButton={{
            title: 'Select annotation groups',
            label: 'New annotation groups',
            onClick: () => {
              openModal({
                content: (
                  <AnnotationCreateEditModal
                    organizationId={organizationId}
                    onClose={(response) => {
                      response && field.onChange(response.id)
                      closeModal()
                    }}
                  />
                ),
              })
            },
          }}
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
