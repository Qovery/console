import { type ChangeEventHandler, type ComponentPropsWithoutRef, useState } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import { CopyToClipboardButtonIcon } from '../copy-to-clipboard-button-icon/copy-to-clipboard-button-icon'
import { Icon } from '../icon/icon'
import { Tooltip } from '../tooltip/tooltip'

export interface PasswordShowHideProps extends ComponentPropsWithoutRef<'input'> {
  value: string
  defaultVisible?: boolean
  isSecret?: boolean
  canCopy?: boolean
  canEdit?: boolean
  onChange?: ChangeEventHandler<HTMLInputElement>
}

export function PasswordShowHide({
  canCopy = true,
  canEdit = false,
  className,
  defaultVisible = false,
  isSecret,
  value,
  onChange,
  ...props
}: PasswordShowHideProps) {
  const [_visible, setVisible] = useState(false)
  const visible = defaultVisible || _visible

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
    <span className={twMerge('flex h-5 items-center gap-2 text-sm', className)} {...props}>
      <Tooltip content={visible ? 'Hide variable' : 'View variable'}>
        <button
          type="button"
          className="w-4 text-brand"
          onClick={() => setVisible((visible) => !visible)}
          data-testid="toggle-button"
        >
          {visible ? <Icon iconName="eye-slash" iconStyle="regular" /> : <Icon iconName="eye" iconStyle="regular" />}
        </button>
      </Tooltip>
      {visible ? (
        <>
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
            <CopyToClipboardButtonIcon content={value!} iconClassName="text-neutral-subtle hover:text-neutral" />
          )}
        </>
      ) : (
        <Tooltip content={value}>
          <span className="pt-1 font-medium tracking-widest text-neutral-subtle" data-testid="hide_value">
            ********
          </span>
        </Tooltip>
      )}
    </span>
  )
}

export default PasswordShowHide
