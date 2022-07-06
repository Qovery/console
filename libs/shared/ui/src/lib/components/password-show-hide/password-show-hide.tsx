import { useState } from 'react'
import Icon from '../icon/icon'
import Tooltip from '../tooltip/tooltip'

export interface PasswordShowHideProps {
  value: string
  defaultVisible: boolean
  isSecret?: boolean
  className?: string
}

export function PasswordShowHide(props: PasswordShowHideProps) {
  const { value = '', isSecret = false, className = '' } = props
  const [visible, setVisible] = useState<boolean>(props.defaultVisible)

  return (
    <div className={`flex items-center text-xs text-text-400 ${className}`}>
      {isSecret ? (
        <Icon name="icon-solid-user-secret" className="mr-3 text-text-500 text-xs" />
      ) : (
        <button
          data-testid="toggle-button"
          className="flex items-center mr-3 text-text-500"
          onClick={() => setVisible(!visible)}
        >
          {visible ? (
            <Icon className="text-xs" name="icon-solid-eye-slash" />
          ) : (
            <Icon className="text-xs" name="icon-solid-eye" />
          )}
        </button>
      )}

      <Tooltip content={value}>
        <input
          type={visible ? 'text' : 'password'}
          value={isSecret ? 'Ōtsuka Station' : visible ? value : value.substring(0, 15)}
          className={`bg-transparent outline-0 border-0 overflow-hidden text-ellipsis ${
            visible ? 'text-text-600' : ''
          }`}
          readOnly
          disabled={!visible}
          data-testid="input"
        />
      </Tooltip>
    </div>
  )
}

export default PasswordShowHide
