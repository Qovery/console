import { useContext } from 'react'
import { ModalContext } from '../../modal/modal-root'

export function useModalAlert() {
  const { setModalAlertOpen } = useContext(ModalContext)

  return { setModalAlertOpen }
}

export default useModalAlert
