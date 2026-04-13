import { type IconName } from '@fortawesome/fontawesome-common-types'
import * as Dialog from '@radix-ui/react-dialog'
import { type PropsWithChildren, type ReactNode } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Button, Heading, Icon, RadioGroup, Section, useModal } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'

type DatabaseDeployModalData = {
  action: string
  name: string
}

interface ActionItem {
  id: string // Also used as the text the user has to type to confirm
  title: string
  callback: (data: DatabaseDeployModalData) => void
  description?: ReactNode
  icon?: IconName
  color?: 'brand' | 'red' | 'yellow' | 'green' | 'neutral'
}

export interface DatabaseDeployModalProps extends PropsWithChildren {
  title: string
  description?: ReactNode
  actions: ActionItem[]
  name?: string
  submitButtonText?: string
}

export function DatabaseDeployModal({
  title,
  description,
  actions,
  children,
  submitButtonText,
}: DatabaseDeployModalProps) {
  const {
    handleSubmit,
    control,
    watch,
    formState: { isValid },
  } = useForm<DatabaseDeployModalData>({
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
      selectedAction?.callback?.(data)
    }
  })

  return (
    <Section className="p-5">
      <Dialog.Title asChild>
        <Heading level={1} className="text-neutral mb-2 max-w-sm text-2xl">
          {title}
        </Heading>
      </Dialog.Title>
      <Dialog.Description className="mb-6 text-sm text-neutral-350 dark:text-neutral-50">
        {description}
      </Dialog.Description>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="flex flex-col gap-5">
          <div className="flex w-full flex-col gap-4">
            <Controller
              name="action"
              control={control}
              render={({ field }) => (
                <RadioGroup.Root onValueChange={field.onChange} value={field.value} className="grid grid-cols-2 gap-4">
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
                      <div className="inline-block text-sm text-neutral-350">{action.description}</div>
                    </label>
                  ))}
                </RadioGroup.Root>
              )}
            />
          </div>
        </div>

        {children}

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
            {submitButtonText ?? selectedAction?.title}
          </Button>
        </div>
      </form>
    </Section>
  )
}

export default DatabaseDeployModal
