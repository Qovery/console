import { type PropsWithChildren, type ReactNode } from 'react'
import { Controller, useForm } from 'react-hook-form'
import Button from '../../button/button'
import { Callout } from '../../callout/callout'
import { Checkbox } from '../../checkbox/checkbox'
import { Icon } from '../../icon/icon'
import useModal from '../../modal/use-modal/use-modal'

export interface ModalMultiConfirmationProps extends PropsWithChildren {
  title: string
  checks: string[]
  callback: () => void
  description?: ReactNode
  warning?: ReactNode
  ctaButton?: string
  isDelete?: boolean
}

export function ModalMultiConfirmation({
  title,
  description,
  callback,
  warning,
  isDelete = false,
  ctaButton = 'Confirm',
  children,
  checks,
}: ModalMultiConfirmationProps) {
  const {
    handleSubmit,
    control,
    formState: { isValid },
  } = useForm({})
  const { closeModal } = useModal()

  const onSubmit = handleSubmit((data) => {
    if (data) {
      closeModal()
      callback()
    }
  })

  return (
    <div className="p-6">
      <h2 className="h4 mb-2 max-w-sm text-neutral-400 dark:text-neutral-50">{title}</h2>
      <div className="mb-6 text-sm text-neutral-350 dark:text-neutral-50">{description}</div>
      <form onSubmit={onSubmit}>
        {children}
        {(warning || checks) && (
          <Callout.Root className="mb-5" color="red">
            <Callout.Icon>
              <Icon iconName="triangle-exclamation" className="text-red-600" />
            </Callout.Icon>
            <Callout.Text>
              <div className="flex flex-col gap-3">
                <p className="font-semibold">{warning}</p>
                {checks &&
                  checks.map((check) => (
                    <div key={check} className="flex items-center gap-4">
                      <Controller
                        name={check.toLowerCase().replace(' ', '_')}
                        control={control}
                        rules={{
                          required: 'Please check the box to confirm.',
                          validate: (value) => value,
                        }}
                        render={({ field, fieldState: { error } }) => (
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                              <Checkbox
                                name={field.name}
                                id={field.name}
                                className="shrink-0"
                                color="red"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                              <label htmlFor={field.name}>{check}</label>
                            </div>
                            {error && <p className="text-sm text-red-500">{error.message}</p>}
                          </div>
                        )}
                      />
                    </div>
                  ))}
              </div>
            </Callout.Text>
          </Callout.Root>
        )}
        <div className="flex justify-end gap-3">
          <Button type="button" color="neutral" variant="plain" size="lg" onClick={() => closeModal()}>
            Cancel
          </Button>
          <Button type="submit" size="lg" color={isDelete ? 'red' : 'brand'} disabled={!isValid}>
            {ctaButton}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ModalMultiConfirmation
