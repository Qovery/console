import * as Dialog from '@radix-ui/react-dialog'

export interface ModalProps {
  trigger: React.ReactNode
  children: React.ReactNode
  className?: string
  defaultOpen?: boolean
}

const bodyStyle = (open: boolean) => {
  const body = document.body
  if (open) {
    body.style.cssText = 'margin-right: 0!important; padding-right: 0!important'
  }
}

export function Modal(props: ModalProps) {
  const { trigger, children, className = '', defaultOpen = false } = props

  return (
    <Dialog.Root defaultOpen={defaultOpen} onOpenChange={bodyStyle}>
      <Dialog.Trigger>{trigger}</Dialog.Trigger>
      <Dialog.Portal className="modal">
        <Dialog.Overlay className="modal__overlay flex fixed top-0 left-0 bg-element-light-darker-500/20 items-start justify-center w-full h-screen z-50">
          <Dialog.Content
            className={`${className} modal__content bg-white w-[474px] rounded-md shadow-[0_0_32px_rgba(0,0,0,0.08)] mt-20`}
          >
            {children}
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default Modal
