import { type Dispatch, type ReactNode, type SetStateAction, createContext, useEffect, useState } from 'react'
import ModalAlert from '../modal-alert/modal-alert'
import Modal from './modal'

interface ModalOptions {
  width?: number
  fullScreen?: boolean
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

const defaultContext = {
  openModal: false,
  setOpenModal: () => true,
  setContentModal: () => <></>,
  setOptionsModal: () => {},
  optionsModal: {
    width: 488,
    fullScreen: false,
  },
  alertClickOutside: false,
  enableAlertClickOutside: () => {},
  modalAlertOpen: false,
  setModalAlertOpen: () => {},

  alertModalChoice: undefined,
  setAlertModalChoice: () => {},
}

export const ModalContext = createContext<DefaultContextProps>(defaultContext)

interface ModalProviderProps {
  children: ReactNode
}

export const ModalProvider = (props: ModalProviderProps) => {
  const [openModal, setOpenModal] = useState(false)
  const [contentModal, setContentModal] = useState(<></>)
  const [optionsModal, setOptionsModal] = useState({})
  const [alertClickOutside, enableAlertClickOutside] = useState(false)
  const [modalAlertOpen, setModalAlertOpen] = useState(false)
  const [alertModalChoice, setAlertModalChoice] = useState<boolean | undefined>(undefined)

  // Reset modal options when the modal is closed
  useEffect(() => {
    if (!openModal) {
      setOptionsModal(defaultContext.optionsModal)
    }
  }, [openModal])

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
