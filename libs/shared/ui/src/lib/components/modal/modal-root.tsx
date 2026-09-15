import { type Dispatch, type ReactNode, type SetStateAction, createContext, useState } from 'react'
import ModalAlert from '../modal-alert/modal-alert'
import Modal from './modal'

interface ModalOptions {
  width?: number
  fullScreen?: boolean
  /**
   * This is a workaround to avoid radix dialog restriction.
   * Radix use [react-remove-scroll](https://www.npmjs.com/package/react-remove-scroll) to prevent wheel / scroll event directly on `<html>` node
   * in some cases like with Select inside Modal, it causes issues.
   * https://qovery.atlassian.net/browse/FRT-868
   * https://qovery.atlassian.net/browse/FRT-1134
   *
   * It worth noting that scroll lock is also important for accessibility reasons
   * This `fakeModal` mode is visually identical than the `modal` mode without the drawback of locking the scroll.
   * https://github.com/radix-ui/primitives/blob/b32a93318cdfce383c2eec095710d35ffbd33a1c/packages/react/dialog/src/Dialog.tsx#L204
   */
  fakeModal?: boolean
}

interface DefaultContextProps {
  openModal: boolean
  setOpenModal: (openModal: boolean) => void
  setContentModal: Dispatch<SetStateAction<JSX.Element>>
  setOptionsModal: (optionsModal: ModalOptions) => void
  optionsModal: ModalOptions
  alertClickOutside: boolean
  enableAlertClickOutside: (mustConfirm: boolean) => void

  modalAlertOpen: boolean
  setModalAlertOpen: (alertModalOpen: boolean) => void

  alertModalChoice: boolean | undefined
  setAlertModalChoice: (alertModalChoice: boolean | undefined) => void
}

export const defaultContext = {
  openModal: false,
  setOpenModal: () => true,
  setContentModal: () => <></>,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setOptionsModal: () => {},
  optionsModal: {
    width: 488,
    fullScreen: false,
    fakeModal: false,
  },
  alertClickOutside: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  enableAlertClickOutside: () => {},
  modalAlertOpen: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setModalAlertOpen: () => {},

  alertModalChoice: undefined,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setAlertModalChoice: () => {},
}

export const ModalContext = createContext<DefaultContextProps>(defaultContext)

interface ModalProviderProps {
  children: ReactNode
}

export const ModalProvider = (props: ModalProviderProps) => {
  const [openModal, setOpenModal] = useState(false)
  const [contentModal, setContentModal] = useState(<></>)
  const [optionsModal, setOptionsModal] = useState<ModalOptions>({})
  const [alertClickOutside, enableAlertClickOutside] = useState(false)
  const [modalAlertOpen, setModalAlertOpen] = useState(false)
  const [alertModalChoice, setAlertModalChoice] = useState<boolean | undefined>(undefined)

  return (
    <ModalContext.Provider
      value={{
        openModal,
        setOpenModal,
        setContentModal,
        setOptionsModal,
        optionsModal,
        alertClickOutside,
        enableAlertClickOutside,
        setModalAlertOpen,
        modalAlertOpen,
        alertModalChoice,
        setAlertModalChoice,
      }}
    >
      <Modal externalOpen={openModal} setExternalOpen={setOpenModal} {...optionsModal}>
        {contentModal}
      </Modal>
      <ModalAlert isOpen={modalAlertOpen} />
      {props.children}
    </ModalContext.Provider>
  )
}

export default ModalProvider
