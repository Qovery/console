import * as Dialog from '@radix-ui/react-dialog'
import { useContext } from 'react'
import Button from '../button/button'
import { ModalContext } from '../modal/modal-root'

export interface ModalAlertProps {
  isOpen: boolean
}

export function ModalAlert(props: ModalAlertProps) {
  const { setModalAlertOpen, setAlertModalChoice } = useContext(ModalContext)
  return (
    <Dialog.Root open={props.isOpen} onOpenChange={() => setModalAlertOpen(!props.isOpen)}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal__overlay fixed left-0 top-0 z-40 flex h-screen w-full bg-neutral-700/40" />
        <Dialog.Content
          data-testid="modal-alert"
          style={{ width: `470px`, top: '200px' }}
          className="modal__content fixed left-1/2 top-[84px] z-40 rounded-md bg-white shadow-[0_0_32px_rgba(0,0,0,0.08)]"
        >
          <div className="max-h-[80vh] overflow-auto p-6">
            <h2 className="h4 mb-2 text-neutral-400">Discard changes?</h2>
            <p className="mb-6 text-sm text-neutral-350">Are you sure you want to discard your changes?</p>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                size="lg"
                color="neutral"
                variant="plain"
                onClick={() => {
                  setAlertModalChoice(false)
                  setModalAlertOpen(!props.isOpen)
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="lg"
                onClick={() => {
                  setAlertModalChoice(true)
                  setModalAlertOpen(!props.isOpen)
                }}
              >
                Yes
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default ModalAlert
