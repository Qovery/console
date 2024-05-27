import { Controller, useFormContext } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { Icon, InputSelect, Tooltip, useModal } from '@qovery/shared/ui'
import { useLabelsGroups } from '../hooks/use-labels-groups/use-labels-groups'
import { LabelCreateEditModal } from '../label-create-edit-modal/label-create-edit-modal'

export function LabelSetting() {
  const { control } = useFormContext()
  const { organizationId = '' } = useParams()
  const { data: labelsGroups = [] } = useLabelsGroups({ organizationId })
  const { openModal, closeModal } = useModal()

  return (
    <Controller
      name="labels_groups"
      control={control}
      render={({ field, fieldState: { error } }) => (
        <InputSelect
          label="Label Groups (optional)"
          options={labelsGroups.map((group) => ({
            label: (
              <span className="flex items-center gap-3">
                <span>{group.name}</span>
                <Tooltip
                  classNameContent="z-10"
                  content={
                    <ul>
                      {group.labels.map(({ key, value }) => (
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
            title: 'Select label groups',
            label: 'New label groups',
            onClick: () => {
              openModal({
                content: (
                  <LabelCreateEditModal
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
          isMulti
        />
      )}
    />
  )
}

export default LabelSetting
