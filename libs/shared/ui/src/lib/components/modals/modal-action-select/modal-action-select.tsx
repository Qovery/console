import { type PropsWithChildren, type ReactNode } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { twMerge } from '@qovery/shared/util-js'
import Button from '../../button/button'
import { Callout } from '../../callout/callout'
import { Icon } from '../../icon/icon'
import InputTextSmall from '../../inputs/input-text-small/input-text-small'
import useModal from '../../modal/use-modal/use-modal'
import { RadioGroup } from '../../radio-group/radio-group'
import { type ActionSelectItem } from './use-modal-action-select/use-modal-action-select'

export interface ModalActionSelectProps extends PropsWithChildren {
  title: string
  description?: ReactNode
  actions: ActionSelectItem[]
  name?: string
  warning?: ReactNode
}

export function ModalActionSelect({ title, description, actions, name, warning, children }: ModalActionSelectProps) {
  const {
    handleSubmit,
    control,
    watch,
    formState: { isValid },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      name: '',
      action: actions[0]?.id,
    },
  })
  const { closeModal } = useModal()

  const selectedActionId = watch('action')
  const selectedAction = actions.find((action) => action.id === selectedActionId)

  const onSubmit = handleSubmit((data) => {
    if (data) {
      closeModal()
      selectedAction?.callback?.()
    }
  })

  return (
    <div className="p-6">
      <h2 className="h4 mb-2 max-w-sm text-neutral-400 dark:text-neutral-50">{title}</h2>
      <div className="mb-6 text-sm text-neutral-350 dark:text-neutral-50">
        {description ? (
          description
        ) : (
          <>
            To confirm the deletion of <strong>{name}</strong>, please type "delete"
          </>
        )}
      </div>

      <form onSubmit={onSubmit}>
        <div className="flex flex-col gap-4">
          <div className="flex w-full flex-col gap-4">
            <Controller
              name="action"
              control={control}
              render={({ field }) => (
                <RadioGroup.Root onValueChange={field.onChange} value={field.value} className="flex flex-col gap-5">
                  {actions.map((action) => (
                    <label
                      key={action.id}
                      className={twMerge(
                        'flex cursor-pointer flex-col gap-2 rounded border border-neutral-250 bg-neutral-100 p-5 text-left text-sm shadow transition-all',
                        selectedActionId === action.id && 'border-brand-500 bg-brand-50'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroup.Item value={action.id} />
                        {action.icon && (
                          <Icon iconName={action.icon} iconStyle="regular" className="text-base text-neutral-350" />
                        )}
                        <span className="font-medium text-neutral-400">{action.title}</span>
                      </div>
                      <span className="inline-block text-sm text-neutral-350">{action.description}</span>
                    </label>
                  ))}
                </RadioGroup.Root>
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div>
              <span className="text-sm text-neutral-350">This action cannot be undone, type "</span>
              <span
                className={twMerge(
                  'text-sm font-semibold text-neutral-350',
                  selectedAction?.color && `text-${selectedAction?.color}-500`
                )}
              >
                {selectedAction?.id}
              </span>
              <span className="text-sm text-neutral-350">" to confirm.</span>
            </div>
            <Controller
              name="name"
              control={control}
              rules={{
                required: `Please enter "${selectedAction?.id}".`,
                validate: (value) => value === selectedAction?.id || `Please enter "${selectedAction?.id}".`,
              }}
              defaultValue=""
              render={({ field, fieldState: { error } }) => (
                <InputTextSmall
                  className="mb-5"
                  placeholder={`Enter "${selectedAction?.id}"`}
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  error={error?.message}
                />
              )}
            />
          </div>
        </div>

        {children}

        {warning && (
          <Callout.Root className="mb-5" color="yellow">
            <Callout.Icon>
              <Icon iconName="triangle-exclamation" iconStyle="regular" />
            </Callout.Icon>
            <Callout.Text>{warning}</Callout.Text>
          </Callout.Root>
        )}
        <div className="flex justify-end gap-3">
          <Button type="button" color="neutral" variant="plain" size="lg" onClick={() => closeModal()}>
            Cancel
          </Button>
          <Button
            type="submit"
            size="lg"
            color={selectedAction?.color ? selectedAction?.color : 'brand'}
            disabled={!isValid}
          >
            {selectedAction?.title}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ModalActionSelect
