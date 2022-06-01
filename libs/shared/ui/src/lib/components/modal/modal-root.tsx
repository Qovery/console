import { createContext, ReactNode, useState } from 'react'
import { Modal } from '@console/shared/ui'

interface DefaultContextProps {
  openModal: boolean
  setOpenModal: (openModal: boolean) => void
  setContentModal: any
}

const defaultContext = {
  openModal: false,
  setOpenModal: () => true,
  setContentModal: () => <></>,
}

export const ModalContext = createContext<DefaultContextProps>(defaultContext)

interface ModalProviderProps {
  children: ReactNode
}

export const ModalProvider = (props: ModalProviderProps) => {
  const [openModal, setOpenModal] = useState(false)
  const [contentModal, setContentModal] = useState(<></>)

  return (
    <ModalContext.Provider value={{ openModal, setOpenModal, setContentModal }}>
      <Modal externalOpen={openModal} setExternalOpen={setOpenModal} width={488}>
        {contentModal}
      </Modal>
      {props.children}
    </ModalContext.Provider>
  )
}

export default ModalProvider
