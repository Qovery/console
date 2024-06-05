import {
  type OrganizationLabelsGroupEnrichedResponse,
  type OrganizationLabelsGroupResponse,
} from 'qovery-typescript-axios'
import { Controller, FormProvider, useFieldArray, useForm } from 'react-hook-form'
import { Button, Icon, InputText, InputTextSmall, InputToggle, ModalCrud, Tooltip, useModal } from '@qovery/shared/ui'
import { useCreateLabelsGroup } from '../hooks/use-create-labels-group/use-create-labels-group'
import { useEditLabelsGroup } from '../hooks/use-edit-labels-group/use-edit-labels-group'

export interface LabelCreateEditModalProps {
  onClose: (response?: OrganizationLabelsGroupResponse) => void
  organizationId: string
  isEdit?: boolean
  labelsGroup?: OrganizationLabelsGroupEnrichedResponse
}

export function LabelCreateEditModal({ isEdit, labelsGroup, organizationId, onClose }: LabelCreateEditModalProps) {
  const { enableAlertClickOutside } = useModal()
  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      name: labelsGroup?.name ?? '',
      labels: labelsGroup?.labels ?? [
        {
          key: '',
          value: '',
          propagate_to_cloud_provider: false,
        },
      ],
    },
  })

  methods.watch(() => enableAlertClickOutside(methods.formState.isDirty))

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: 'labels',
  })

  const { mutateAsync: editLabelsGroup, isLoading: isLoadingEditLabelsGroup } = useEditLabelsGroup()
  const { mutateAsync: createLabelsGroup, isLoading: isLoadingCreateLabelsGroup } = useCreateLabelsGroup()

  const onSubmit = methods.handleSubmit(async (data) => {
    try {
      if (isEdit) {
        const response = await editLabelsGroup({
          organizationId,
          labelsGroupId: labelsGroup?.id ?? '',
          labelsGroupRequest: data,
        })
        onClose(response)
      } else {
        const response = await createLabelsGroup({
          organizationId,
          labelsGroupRequest: data,
        })
        onClose(response)
      }
    } catch (error) {
      console.error(error)
    }
  })

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title={isEdit ? 'Edit label group' : 'Create label group'}
        description="You will have the possibility to modify the parameters once created."
        onClose={onClose}
        onSubmit={onSubmit}
        loading={isLoadingEditLabelsGroup || isLoadingCreateLabelsGroup}
        isEdit={isEdit}
      >
        <Controller
          name="name"
          control={methods.control}
          rules={{
            required: 'Please enter a group name.',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              className="mb-5"
              label="Group name"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
            />
          )}
        />
        <span className="mb-2 block text-sm text-neutral-400">Add label key value</span>
        <div className="rounded border border-neutral-250 bg-neutral-100 px-4 py-3">
          <ul>
            <li className="mb-3 grid grid-cols-[6fr_6fr_1fr_1fr] gap-x-2">
              <span className="text-sm font-medium text-neutral-350">Label keys</span>
              <span className="pl-10 text-sm font-medium text-neutral-350">Value</span>
              <span className="relative left-7 flex items-center gap-1 whitespace-nowrap text-sm font-medium text-neutral-350">
                Propagate as tag
                <Tooltip content="Allows you to propagate the label as a tag in your cloud provider side if the format is compliant.">
                  <span>
                    <Icon iconName="circle-info" />
                  </span>
                </Tooltip>
              </span>
              <span></span>
            </li>
            {fields.map((field, index) => (
              <li key={field.id} className="mb-3 last:mb-0">
                <div className="grid grid-cols-[6fr_6fr_1fr_1fr] items-center gap-x-2">
                  <Controller
                    name={`labels.${index}.key`}
                    control={methods.control}
                    rules={{
                      required: true,
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <InputTextSmall
                        dataTestId={`labels.${index}.key`}
                        name={field.name}
                        value={field.value}
                        onChange={field.onChange}
                        error={error?.message}
                      />
                    )}
                  />
                  <Controller
                    name={`labels.${index}.value`}
                    control={methods.control}
                    rules={{
                      required: true,
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <InputTextSmall
                        dataTestId={`labels.${index}.value`}
                        name={field.name}
                        value={field.value}
                        onChange={field.onChange}
                        error={error?.message}
                      />
                    )}
                  />
                  <Controller
                    name={`labels.${index}.propagate_to_cloud_provider`}
                    control={methods.control}
                    render={({ field }) => <InputToggle value={field.value} onChange={field.onChange} small />}
                  />
                  <Button size="md" variant="plain" type="button" onClick={() => remove(index)}>
                    <Icon iconName="trash" className="text-sm text-neutral-400" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <Button
            size="sm"
            type="button"
            className="mt-3"
            onClick={() =>
              append({
                key: '',
                value: '',
                propagate_to_cloud_provider: false,
              })
            }
          >
            Add label
            <Icon iconName="plus" className="ml-2" />
          </Button>
        </div>
      </ModalCrud>
    </FormProvider>
  )
}

export default LabelCreateEditModal
