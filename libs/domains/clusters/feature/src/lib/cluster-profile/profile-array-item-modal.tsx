import { useEffect } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import {
  CatalogVariableInput,
  type CatalogVariableValue,
  getCatalogFieldValidationError,
  getCatalogVariableValue,
  isCatalogFieldValueFulfilled,
} from '@qovery/domains/catalog/feature'
import { ModalCrud } from '@qovery/shared/ui'
import {
  type PlatformFieldDescriptor,
  toCatalogVariableField,
  toPlatformConfigurationValue,
} from '../utils/platform-configuration-utils'

export interface ProfileArrayItemModalProps {
  title: string
  description?: string | null
  fields: PlatformFieldDescriptor[]
  values: Record<string, unknown>
  isEdit: boolean
  onClose: () => void
  onMountedChange?: (isMounted: boolean) => void
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
  onMountedChange,
  onSubmit,
}: ProfileArrayItemModalProps) {
  useEffect(() => {
    onMountedChange?.(true)
    return () => onMountedChange?.(false)
  }, [onMountedChange])

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
                    disabled={field.readOnly}
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
