import { type PropsWithChildren, type ReactNode, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Checkbox } from '@qovery/shared/ui'
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
  callback: (isDryRun?: boolean) => void
  warning?: ReactNode
  placeholder?: string
  ctaButton?: string
  ctaButtonDisabled?: boolean
  isDelete?: boolean
  isDryRunEnabled?: boolean
}

export function ModalConfirmation({
  title,
  description,
  name,
  callback,
  warning,
  isDelete = false,
  placeholder = isDelete ? 'Enter "delete"' : 'Enter the current name',
  ctaButton = 'Confirm',
  ctaButtonDisabled,
  children,
  isDryRunEnabled = false,
}: ModalConfirmationProps) {
  const { handleSubmit, control } = useForm()
  const { closeModal } = useModal()
  const isDryRunRef = useRef(false)

  const onSubmit = handleSubmit((data) => {
    if (data) {
      closeModal()
      callback(isDryRunRef.current)
    }
  })

  const copyToClipboard = () => {
    if (name) {
      navigator.clipboard.writeText(name)
    }
  }

  return (
    <div className="p-6">
      <h2 className="h4 mb-2 max-w-sm text-neutral-400 dark:text-neutral-50">{title}</h2>
      <div className="mb-6 text-sm text-neutral-350 dark:text-neutral-50">
        {isDelete ? (
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
            required: isDelete ? 'Please enter "delete".' : 'Please enter a name.',
            validate: (value) =>
              (isDelete ? value === 'delete' : value === name) ||
              (isDelete ? 'Please confirm by entering "delete".' : 'Please enter the right name.'),
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

        {isDryRunEnabled && (
          <Controller
            name="dryRun"
            control={control}
            defaultValue={false}
            render={({ field }) => (
              <div className="mb-5 flex gap-3 pt-4">
                <Checkbox
                  id={field.name}
                  className="h-4 w-4 min-w-4"
                  name={field.name}
                  checked={field.value}
                  onCheckedChange={(value) => {
                    field.onChange(value)
                    isDryRunRef.current = !!value
                  }}
                />
                <label className="relative -top-1 flex flex-col gap-1 text-sm" htmlFor={field.name}>
                  <span className="font-medium text-neutral-400">Dry-run</span>
                  <span className="text-neutral-350">Preview changes without applying them</span>
                </label>
              </div>
            )}
          />
        )}

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
          <Button type="submit" size="lg" color={isDelete ? 'red' : 'brand'} disabled={ctaButtonDisabled}>
            {ctaButton}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ModalConfirmation
