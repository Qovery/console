import { ReactNode, createContext, useState } from 'react'
import ModalAlert from '../modal-alert/modal-alert'
import Modal from './modal'

interface ModalOptions {
  width: number
}

interface DefaultContextProps {
  openModal: boolean
  setOpenModal: (openModal: boolean) => void
  setContentModal: any
  setOptionsModal: (optionsModal: ModalOptions) => void
  optionsModal: ModalOptions
  mustConfirmClickOutside: boolean
  setMustConfirmClickOutside: (mustConfirm: boolean) => void

  modalAlertOpen: boolean
  setModalAlertOpen: (alertModalOpen: boolean) => void
}

const defaultContext = {
  openModal: false,
  setOpenModal: () => true,
  setContentModal: () => <></>,
  setOptionsModal: () => {},
  optionsModal: {
    width: 488,
  },
  mustConfirmClickOutside: false,
  setMustConfirmClickOutside: () => {},
  modalAlertOpen: false,
  setModalAlertOpen: () => {},
}

export const ModalContext = createContext<DefaultContextProps>(defaultContext)

interface ModalProviderProps {
  children: ReactNode
}

export const ModalProvider = (props: ModalProviderProps) => {
  const [openModal, setOpenModal] = useState(false)
  const [contentModal, setContentModal] = useState(<></>)
  const [optionsModal, setOptionsModal] = useState({
    width: 488,
  })
  const [mustConfirmClickOutside, setMustConfirmClickOutside] = useState(false)
  const [modalAlertOpen, setModalAlertOpen] = useState(false)

  return (
    <ModalContext.Provider
      value={{
        openModal,
        setOpenModal,
        setContentModal,
        setOptionsModal,
        optionsModal,
        mustConfirmClickOutside,
        setMustConfirmClickOutside,
        setModalAlertOpen,
        modalAlertOpen,
      }}
    >
      <Modal
        externalOpen={openModal}
        mustConfirmClickOutside={mustConfirmClickOutside}
        setExternalOpen={setOpenModal}
        width={optionsModal.width}
      >
        {contentModal}
      </Modal>
      <ModalAlert isOpen={modalAlertOpen} />
      {props.children}
    </ModalContext.Provider>
  )
}

export default ModalProvider
