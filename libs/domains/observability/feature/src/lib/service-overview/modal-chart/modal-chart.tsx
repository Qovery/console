import { type PropsWithChildren } from 'react'
import { Modal } from '@qovery/shared/ui'

interface ModalChartProps extends PropsWithChildren {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ModalChart({ children, open, onOpenChange }: ModalChartProps) {
  return (
    <Modal externalOpen={open} setExternalOpen={onOpenChange} fullScreen={true} buttonClose={true}>
      <div className="h-full p-5">{children}</div>
    </Modal>
  )
}

export default ModalChart
