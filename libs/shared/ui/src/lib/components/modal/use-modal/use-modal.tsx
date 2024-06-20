import { type ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { ModalContext, defaultContext } from '../modal-root'

export interface UseModalProps {
  content: ReactNode
  options?: {
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
}

export function useModal() {
  const [modal, openModal] = useState<UseModalProps>()
  const { setOpenModal, setContentModal, setOptionsModal, enableAlertClickOutside } = useContext(ModalContext)
  const closeModal = useCallback(() => {
    setOpenModal(false)
  }, [setOpenModal])

  useEffect(() => {
    if (modal) {
      if (modal.options?.fakeModal) {
        // XXX: prevent conflict between dropdown menu click event and modal opening.
        // We suppose that dropdownmenu and dialog share the same internal radix state,
        // this result in conflict when trigger a modal opening action from a dropdown menu item.
        // Modal is closed directly after item click probably because radix consider
        // goblal dialog state already opened (due to dropdown menu still present)
        setTimeout(() => {
          setOpenModal(true)
        }, 0)
      } else {
        setOpenModal(true)
      }
      if (modal.options) {
        setOptionsModal({
          ...defaultContext.optionsModal,
          ...modal.options,
        })
      } else {
        // Reset options with default values
        setOptionsModal(defaultContext.optionsModal)
      }
      setContentModal(<>{modal.content}</>)
    }
  }, [modal, setContentModal, setOpenModal, setOptionsModal])

  return { openModal, closeModal, enableAlertClickOutside }
}

export default useModal
