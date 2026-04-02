import { type PropsWithChildren, type ReactNode } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Button, Icon, RadioGroup, useModal } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { type ActionItem, type DatabaseDeployModalData } from './use-database-deploy-modal/use-database-deploy-modal'

export interface DatabaseDeployModalProps extends PropsWithChildren {
  title: string
  description?: ReactNode
  actions: ActionItem[]
  name?: string
  entities?: ReactNode[]
  submitButtonText?: string
}

export function DatabaseDeployModal({
  title,
  description,
  actions,
  children,
  entities,
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
    <div className="p-6">
      <h2 className="h4 mb-1 max-w-sm text-neutral-400 dark:text-neutral-50">{title}</h2>
      <div className="mb-4">
        {description && <div className="text-sm text-neutral-350 dark:text-neutral-50">{description}</div>}
        {entities && <div className="mt-1 flex gap-1.5">{entities.map((entity) => entity)}</div>}
      </div>

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
    </div>
  )
}

export default DatabaseDeployModal
