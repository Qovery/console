import { Controller, useFormContext } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { Icon, InputSelect, Tooltip, useModal } from '@qovery/shared/ui'
import { useLabelsGroups } from '../hooks/use-labels-groups/use-labels-groups'
import { LabelCreateEditModal } from '../label-create-edit-modal/label-create-edit-modal'

export interface LabelSettingProps {
  filterPropagateToCloudProvider?: boolean
}

export function LabelSetting({ filterPropagateToCloudProvider = false }: LabelSettingProps = {}) {
  const { control } = useFormContext()
  const { organizationId = '' } = useParams()
  const { data: labelsGroups = [] } = useLabelsGroups({ organizationId })
  const { openModal, closeModal } = useModal()

  // Filter labels groups based on propagate_to_cloud_provider if needed
  const filteredLabelsGroups = labelsGroups
    .map((group) => ({
      ...group,
      labels: group.labels.filter((label) => !filterPropagateToCloudProvider || label.propagate_to_cloud_provider),
    }))
    .filter((group) => !filterPropagateToCloudProvider || group.labels.length > 0)

  return (
    <Controller
      name="labels_groups"
      control={control}
      render={({ field, fieldState: { error } }) => (
        <InputSelect
          label="Label Groups (optional)"
          options={filteredLabelsGroups.map((group) => ({
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
                      if (response) {
                        const currentValues = field.value || []
                        field.onChange([...currentValues, response.id])
                      }
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
