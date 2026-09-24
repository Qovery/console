import { Controller, FormProvider, useForm } from 'react-hook-form'
import { CatalogVariableInput } from '@qovery/shared/console-shared'
import { ModalCrud } from '@qovery/shared/ui'
import {
  type CatalogVariableValue,
  getCatalogFieldValidationError,
  getCatalogVariableValue,
  isCatalogFieldValueFulfilled,
} from '@qovery/shared/util-js'
import {
  type PlatformFieldDescriptor,
  toCatalogVariableField,
  toPlatformConfigurationValue,
} from '../platform-configuration/platform-configuration-utils'

export interface ProfileArrayItemModalProps {
  title: string
  description?: string | null
  fields: PlatformFieldDescriptor[]
  values: Record<string, unknown>
  isEdit: boolean
  onClose: () => void
  onSubmit: (values: Record<string, unknown>) => void
}

// Field keys can contain dots, which react-hook-form reads as nested paths: register them by position instead.
const getFormName = (index: number) => `field${index}`

export function ProfileArrayItemModal({
  title,
  description,
  fields,
  values,
  isEdit,
  onClose,
  onSubmit,
}: ProfileArrayItemModalProps) {
  const methods = useForm<Record<string, CatalogVariableValue | undefined>>({
    mode: 'onChange',
    defaultValues: Object.fromEntries(
      fields.map((field, index) => [getFormName(index), getCatalogVariableValue(field, values[field.key])])
    ),
  })

  const handleSubmit = methods.handleSubmit((data) => {
    onSubmit(
      Object.fromEntries(
        fields.flatMap((field, index) => {
          const formValue = data[getFormName(index)]
          const value = formValue === undefined ? undefined : toPlatformConfigurationValue(field, formValue)
          return value === '' || value === undefined ? [] : [[field.key, value]]
        })
      )
    )
    onClose()
  })

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title={title}
        description={description ?? undefined}
        isEdit={isEdit}
        submitLabel={isEdit ? 'Save' : 'Add'}
        onClose={onClose}
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col gap-4">
          {fields.map((field, index) => {
            const catalogField = toCatalogVariableField(field)
            return (
              <Controller
                key={field.key}
                name={getFormName(index)}
                control={methods.control}
                rules={{
                  validate: (value) => {
                    if (catalogField.required && !isCatalogFieldValueFulfilled(value)) return 'Please enter a value.'
                    return getCatalogFieldValidationError(catalogField, value) ?? true
                  },
                }}
                render={({ field: { value, onChange }, fieldState: { error } }) => (
                  <CatalogVariableInput
                    autoFocus={index === 0}
                    field={catalogField}
                    value={value}
                    error={error?.message}
                    onChange={onChange}
                  />
                )}
              />
            )
          })}
        </div>
      </ModalCrud>
    </FormProvider>
  )
}
