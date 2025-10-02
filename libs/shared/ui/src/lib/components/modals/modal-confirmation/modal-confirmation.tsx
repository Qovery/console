import { type PropsWithChildren, type ReactNode } from 'react'
import { Controller, useForm } from 'react-hook-form'
import Button from '../../button/button'
import { Callout } from '../../callout/callout'
import { Icon } from '../../icon/icon'
import InputTextSmall from '../../inputs/input-text-small/input-text-small'
import useModal from '../../modal/use-modal/use-modal'
import { Tooltip } from '../../tooltip/tooltip'

export interface ModalConfirmationProps extends PropsWithChildren {
  title: string
  description?: ReactNode
  name?: string
  callback: () => void
  warning?: ReactNode
  placeholder?: string
  ctaButton?: string
  ctaButtonDisabled?: boolean
  confirmationMethod?: 'name' | 'action'
  confirmationAction?: string
}

export function ModalConfirmation({
  title,
  description,
  name,
  callback,
  warning,
  ctaButton = 'Confirm',
  ctaButtonDisabled,
  children,
  confirmationMethod = 'name',
  confirmationAction = 'delete',
  placeholder = confirmationMethod === 'action' ? `Enter "${confirmationAction}"` : 'Enter the current name',
}: ModalConfirmationProps) {
  const { handleSubmit, control } = useForm()
  const { closeModal } = useModal()

  const onSubmit = handleSubmit((data) => {
    if (data) {
      closeModal()
      callback()
    }
  })

  const copyToClipboard = () => {
    name && navigator.clipboard.writeText(name)
  }

  return (
    <div className="p-6">
      <h2 className="h4 mb-2 max-w-sm text-neutral-400 dark:text-neutral-50">{title}</h2>
      <div className="mb-6 text-sm text-neutral-350 dark:text-neutral-50">
        {confirmationMethod === 'action' ? (
          description ? (
            description
          ) : (
            <>
              To confirm the deletion of <strong>{name}</strong>, please type "delete"
            </>
          )
        ) : (
          <>
            {description}
            <Tooltip content="Copy">
              <span
                data-testid="copy-cta"
                onClick={copyToClipboard}
                className="link relative -top-0.5 ml-1 inline max-w-[250px] cursor-pointer truncate text-sm text-sky-500"
              >
                {name} <Icon iconName="copy" />
              </span>
            </Tooltip>
          </>
        )}
      </div>
      <form onSubmit={onSubmit}>
        <Controller
          name="name"
          control={control}
          rules={{
            required:
              confirmationMethod === 'action' ? `Please enter "${confirmationAction}".` : 'Please enter a name.',
            validate: (value) =>
              (confirmationMethod === 'action' ? value === confirmationAction : value === name) ||
              (confirmationMethod === 'action'
                ? `Please confirm by entering "${confirmationAction}".`
                : 'Please enter the right name.'),
          }}
          defaultValue=""
          render={({ field, fieldState: { error } }) => (
            <InputTextSmall
              className="mb-5"
              placeholder={placeholder}
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
            />
          )}
        />
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
            color={confirmationMethod === 'action' ? 'red' : 'brand'}
            disabled={ctaButtonDisabled}
          >
            {ctaButton}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ModalConfirmation
