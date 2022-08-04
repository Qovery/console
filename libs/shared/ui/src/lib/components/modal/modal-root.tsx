import { createContext, ReactNode, useState } from 'react'
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
}

const defaultContext = {
  openModal: false,
  setOpenModal: () => true,
  setContentModal: () => <></>,
  setOptionsModal: () => {},
  optionsModal: {
    width: 488,
  },
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

  return (
    <ModalContext.Provider value={{ openModal, setOpenModal, setContentModal, setOptionsModal, optionsModal }}>
      <Modal externalOpen={openModal} setExternalOpen={setOpenModal} width={optionsModal.width}>
        {contentModal}
      </Modal>
      {props.children}
    </ModalContext.Provider>
  )
}

export default ModalProvider
