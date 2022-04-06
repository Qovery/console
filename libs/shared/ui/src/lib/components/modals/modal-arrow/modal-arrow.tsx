import { useEffect, useRef, useState } from 'react'

export enum ModalPostion {
  TOP = 'top',
  BOTTOM = 'bottom',
  LEFT = 'left',
  RIGHT = 'right',
}

export interface ModalArrowProps {
  children: React.ReactElement
  trigger: React.ReactElement
  position: ModalPostion
}

export function ModalArrow(props: ModalArrowProps) {
  const { children, trigger, position = ModalPostion.BOTTOM } = props

  const modalTrigger = useRef<HTMLDivElement>(null)
  const [triggerHeight, setTriggerHeight] = useState<number | undefined>(0)
  const [triggerWidth, setTriggerWidth] = useState<number | undefined>(0)

  useEffect(() => {
    setTriggerWidth(modalTrigger.current?.clientWidth)
    setTriggerHeight(modalTrigger.current?.clientHeight)
  }, [])

  const definePosition = () => {
    switch (position) {
      case ModalPostion.BOTTOM:
        return {
          top: `${triggerHeight && triggerHeight + 16}px`,
        }
        break
      case ModalPostion.TOP:
        return {
          top: `-16px`,
        }
        break
      default:
        return {
          top: `${triggerHeight && triggerHeight + 16}px`,
        }
    }
  }

  return (
    <div className="modal modal--arrow">
      <div className="modal__trigger" ref={modalTrigger}>
        {trigger}
      </div>
      <div className="modal__content" style={definePosition()}>
        <div className="modal__arrow"></div>
        {children}
      </div>
    </div>
  )
}

export default ModalArrow
