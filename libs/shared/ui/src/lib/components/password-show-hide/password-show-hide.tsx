import { type ComponentPropsWithoutRef, useState } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import { CopyToClipboardButtonIcon } from '../copy-to-clipboard-button-icon/copy-to-clipboard-button-icon'
import { Icon } from '../icon/icon'
import { Tooltip } from '../tooltip/tooltip'

export interface PasswordShowHideProps extends ComponentPropsWithoutRef<'span'> {
  value: string
  defaultVisible?: boolean
  isSecret?: boolean
  canCopy?: boolean
}

export function PasswordShowHide({
  canCopy = true,
  className,
  defaultVisible = false,
  isSecret,
  value,
  ...props
}: PasswordShowHideProps) {
  const [_visible, setVisible] = useState(false)
  const visible = defaultVisible || _visible

  return isSecret ? (
    <span className={twMerge('flex items-center gap-2 text-sm text-neutral-300', className)} {...props}>
      <Tooltip content="Secret variable">
        <span>
          <Icon className="block w-4" iconName="lock-keyhole" iconStyle="regular" />
        </span>
      </Tooltip>
      <span className="pt-1.5 text-xl font-medium tracking-widest" data-testid="hide_value_secret">
        *************
      </span>
    </span>
  ) : (
    <span className={twMerge('flex items-center gap-2 text-sm', className)} {...props}>
      <Tooltip content={visible ? 'Hide variable' : 'View variable'}>
        <button
          type="button"
          className="w-4 text-brand-500"
          onClick={() => setVisible((visible) => !visible)}
          data-testid="toggle-button"
        >
          {visible ? <Icon iconName="eye-slash" iconStyle="regular" /> : <Icon iconName="eye" iconStyle="regular" />}
        </button>
      </Tooltip>
      {visible ? (
        <>
          <span className="truncate text-brand-500" data-testid="visible_value">
            {value}
          </span>
          {canCopy && Boolean(value) && <CopyToClipboardButtonIcon content={value!} iconClassName="text-brand-500" />}
        </>
      ) : (
        <Tooltip content={value}>
          <span className="pt-1.5 text-xl font-medium tracking-widest text-neutral-350" data-testid="hide_value">
            *************
          </span>
        </Tooltip>
      )}
    </span>
  )
}

export default PasswordShowHide
