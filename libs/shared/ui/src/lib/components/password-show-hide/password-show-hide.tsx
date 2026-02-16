import { type ChangeEventHandler, type ComponentPropsWithoutRef, useState } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import { CopyToClipboardButtonIcon } from '../copy-to-clipboard-button-icon/copy-to-clipboard-button-icon'
import { Icon } from '../icon/icon'
import { Tooltip } from '../tooltip/tooltip'

export interface PasswordShowHideProps extends ComponentPropsWithoutRef<'input'> {
  value: string
  isSecret?: boolean
  canCopy?: boolean
  canEdit?: boolean
  onChange?: ChangeEventHandler<HTMLInputElement>
}

export function PasswordShowHide({
  canCopy = true,
  canEdit = false,
  className,
  isSecret,
  value,
  onChange,
  ...props
}: PasswordShowHideProps) {
  return isSecret ? (
    <span className={twMerge('flex h-5 items-center gap-2 text-sm text-neutral-disabled', className)} {...props}>
      <Tooltip content="Secret variable">
        <span>
          <Icon className="block w-4" iconName="lock-keyhole" iconStyle="regular" />
        </span>
      </Tooltip>
      <span className="pt-1.5 font-medium tracking-widest" data-testid="hide_value_secret">
        ********
      </span>
    </span>
  ) : (
    <span className={twMerge('group flex h-5 w-full items-center gap-2 text-sm', className)} {...props}>
      {canEdit ? (
        <input
          name="value"
          value={value}
          onChange={(e) => {
            onChange?.(e)
          }}
          className="h-full w-full bg-transparent text-neutral outline-none"
        />
      ) : (
        <span className="truncate text-neutral" data-testid="visible_value">
          {value}
        </span>
      )}
      {canCopy && Boolean(value) && (
        <CopyToClipboardButtonIcon
          content={value!}
          iconClassName="text-neutral-subtle opacity-0 hover:text-neutral group-hover:opacity-100"
        />
      )}
    </span>
  )
}

export default PasswordShowHide
