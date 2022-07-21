import { useState } from 'react'
import Icon from '../icon/icon'
import Tooltip from '../tooltip/tooltip'
import CopyToClipboard from '../copy-to-clipboard/copy-to-clipboard'

export interface PasswordShowHideProps {
  value: string
  defaultVisible: boolean
  isSecret?: boolean
  className?: string
  canCopy?: boolean
}

export function PasswordShowHide(props: PasswordShowHideProps) {
  const { value = '', isSecret = false, className = '', canCopy = false } = props
  const [visible, setVisible] = useState<boolean>(props.defaultVisible)

  return (
    <div className={`flex items-center text-xs text-text-400 ${className}`}>
      {isSecret ? (
        <Icon name="icon-solid-user-secret" className="mr-3 text-text-500 text-xs" />
      ) : (
        <button
          data-testid="toggle-button"
          className="flex items-center mr-3 text-text-500"
          onClick={() => {
            setVisible(!visible)
          }}
        >
          {visible ? (
            <Icon className="text-xs" name="icon-solid-eye-slash" />
          ) : (
            <Icon className="text-xs" name="icon-solid-eye" />
          )}
        </button>
      )}

      <Tooltip content={value}>
        {visible ? (
          <div data-testid="visible_value" className="truncate text-text-600">
            {value}
          </div>
        ) : (
          <input
            type={visible ? 'text' : 'password'}
            value={'Ōtsuka Station 2018'}
            className={`bg-transparent outline-0 w-full border-0 overflow-hidden text-ellipsis`}
            readOnly
            disabled={!visible}
            data-testid="input"
          />
        )}
      </Tooltip>
      {visible && canCopy && <CopyToClipboard className="ml-2" data-testid="copy" content={value} />}
    </div>
  )
}

export default PasswordShowHide
