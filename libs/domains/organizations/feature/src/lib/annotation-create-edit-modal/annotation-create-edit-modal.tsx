import {
  type OrganizationAnnotationsGroupResponse,
  OrganizationAnnotationsGroupScopeEnum,
} from 'qovery-typescript-axios'
import { Controller, FormProvider, useFieldArray, useForm } from 'react-hook-form'
import { Button, Checkbox, Icon, InputText, InputTextSmall, ModalCrud } from '@qovery/shared/ui'
import { useCreateAnnotationsGroup } from '../hooks/use-create-annotations-group/use-create-annotations-group'
import { useEditAnnotationsGroup } from '../hooks/use-edit-annotations-group/use-edit-annotations-group'

type ScopeEnum = keyof typeof OrganizationAnnotationsGroupScopeEnum

// Convert scope for default values
export function convertScopeEnumToObject(scopes: OrganizationAnnotationsGroupScopeEnum[]): { [key: string]: boolean } {
  return Object.keys(OrganizationAnnotationsGroupScopeEnum).reduce((acc, key) => {
    acc[key] = scopes.includes(OrganizationAnnotationsGroupScopeEnum[key as ScopeEnum])
    return acc
  }, {} as { [key: string]: boolean })
}

export function convertScopeObjectToEnum(obj: { [key: string]: boolean }): OrganizationAnnotationsGroupScopeEnum[] {
  return Object.keys(obj)
    .filter((key) => obj[key])
    .map((key) => OrganizationAnnotationsGroupScopeEnum[key as ScopeEnum])
}

export interface AnnotationCreateEditModalProps {
  onClose: (response?: OrganizationAnnotationsGroupResponse) => void
  organizationId: string
  isEdit?: boolean
  annotationsGroup?: OrganizationAnnotationsGroupResponse
}

export function AnnotationCreateEditModal({
  isEdit,
  annotationsGroup,
  organizationId,
  onClose,
}: AnnotationCreateEditModalProps) {
  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      name: annotationsGroup?.name ?? '',
      annotations: annotationsGroup?.annotations ?? [
        {
          key: '',
          value: '',
        },
      ],
      scopes: convertScopeEnumToObject(annotationsGroup?.scopes ?? []),
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: 'annotations',
  })

  const { mutateAsync: editAnnotationsGroup, isLoading: isLoadingEditAnnotationsGroup } = useEditAnnotationsGroup()
  const { mutateAsync: createAnnotationsGroup, isLoading: isLoadingCreateAnnotationsGroup } =
    useCreateAnnotationsGroup()

  const onSubmit = methods.handleSubmit(async (data) => {
    try {
      if (isEdit) {
        const response = await editAnnotationsGroup({
          organizationId,
          annotationsGroupId: annotationsGroup?.id ?? '',
          annotationsGroupRequest: {
            ...data,
            scopes: convertScopeObjectToEnum(data.scopes),
          },
        })
        onClose(response)
      } else {
        const response = await createAnnotationsGroup({
          organizationId,
          annotationsGroupRequest: {
            ...data,
            scopes: convertScopeObjectToEnum(data.scopes),
          },
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
        title={isEdit ? 'Edit annotation group' : 'Create annotation group'}
        description="You will have the possibility to modify the parameters once created."
        onClose={onClose}
        onSubmit={onSubmit}
        loading={isLoadingEditAnnotationsGroup || isLoadingCreateAnnotationsGroup}
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
        <span className="block text-neutral-400 text-sm mb-2">Add annotation key value</span>
        <div className="bg-neutral-100 border border-neutral-250 px-4 py-3 rounded">
          <ul>
            <li className="grid grid-cols-[6fr_6fr_1fr] gap-x-2 mb-3">
              <span className="text-sm text-neutral-350 font-medium">Annotation keys</span>
              <span className="text-sm text-neutral-350 font-medium">Value</span>
              <span></span>
            </li>
            {fields.map((field, index) => (
              <li key={field.id} className="mb-3 last:mb-0">
                <div className="grid grid-cols-[6fr_6fr_1fr] gap-x-2 items-center">
                  <Controller
                    name={`annotations.${index}.key`}
                    control={methods.control}
                    rules={{
                      required: true,
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <InputTextSmall
                        dataTestId={`annotations.${index}.key`}
                        name={field.name}
                        value={field.value}
                        onChange={field.onChange}
                        error={error?.message}
                      />
                    )}
                  />
                  <Controller
                    name={`annotations.${index}.value`}
                    control={methods.control}
                    rules={{
                      required: true,
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <InputTextSmall
                        dataTestId={`annotations.${index}.value`}
                        name={field.name}
                        value={field.value}
                        onChange={field.onChange}
                        error={error?.message}
                      />
                    )}
                  />
                  <Button size="md" variant="plain" type="button" onClick={() => remove(index)}>
                    <Icon iconName="trash" className="text-neutral-400" />
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
              })
            }
          >
            Add annotation
            <Icon iconName="plus" className="ml-2" />
          </Button>
        </div>
        <span className="block text-neutral-400 text-sm mb-2 mt-4">Select scope (Kubernetes objects)</span>
        <div className="bg-neutral-100 border border-neutral-250 px-4 py-3 rounded h-[194px] overflow-y-auto">
          {Object.keys(OrganizationAnnotationsGroupScopeEnum)
            .sort()
            .map((key) => (
              <Controller
                key={key}
                name={`scopes.${key}`}
                control={methods.control}
                render={({ field }) => (
                  <div className="flex items-center mb-2 last:mb-0">
                    <Checkbox
                      id={key}
                      className="mr-3 w-4 h-4"
                      name={field.name}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <label className="text-neutral-400 font-medium text-sm" htmlFor={key}>
                      {key}
                    </label>
                  </div>
                )}
              />
            ))}
        </div>
      </ModalCrud>
    </FormProvider>
  )
}

export default AnnotationCreateEditModal
