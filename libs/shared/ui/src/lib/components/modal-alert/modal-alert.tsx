import * as Dialog from '@radix-ui/react-dialog'
import { useContext } from 'react'
import { ModalContext } from '../modal/modal-root'

export interface ModalAlertProps {
  isOpen: boolean
}

export function ModalAlert(props: ModalAlertProps) {
  const { setModalAlertOpen, setAlertModalChoice } = useContext(ModalContext)
  return (
    <Dialog.Root open={props.isOpen} onOpenChange={() => setModalAlertOpen(!props.isOpen)}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal__overlay flex fixed top-0 left-0 bg-element-light-darker-500/20 w-full h-screen z-40" />
        <Dialog.Content
          style={{ width: `400px` }}
          className={`modal__content fixed top-[84px] left-1/2 bg-white rounded-md shadow-[0_0_32px_rgba(0,0,0,0.08)] z-40`}
        >
          <div className="max-h-[80vh] overflow-auto">
            <h1>Are you sure you want to delete bro?</h1>

            <button
              onClick={() => {
                setAlertModalChoice(true)
                setModalAlertOpen(!props.isOpen)
              }}
            >
              Yes
            </button>
            <button
              onClick={() => {
                setAlertModalChoice(false)
                setModalAlertOpen(!props.isOpen)
              }}
            >
              No
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default ModalAlert
