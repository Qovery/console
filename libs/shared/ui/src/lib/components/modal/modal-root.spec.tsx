import { fireEvent, getByRole, getByTestId, queryByTestId, render, waitFor } from '__tests__/utils/setup-jest'
import { useEffect } from 'react'
import ModalRoot from './modal-root'
import useModal from './use-modal/use-modal'

function Content(props: { shouldConfirm?: boolean }) {
  const { openModal, enableAlertClickOutside } = useModal()

  useEffect(() => {
    enableAlertClickOutside(props.shouldConfirm || false)
  }, [enableAlertClickOutside, props.shouldConfirm])

  return (
    <div>
      <button onClick={() => openModal({ content: <p>content</p> })}>Open modal</button>
    </div>
  )
}

describe('ModalRoot', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <ModalRoot>
        <Content />
      </ModalRoot>
    )
    expect(baseElement).toBeTruthy()
  })

  it('should ask for confirmation before closing the modal and click on yes should close everything', async () => {
    const { baseElement } = render(
      <ModalRoot>
        <Content shouldConfirm={true} />
      </ModalRoot>
    )

    const button = getByRole(baseElement, 'button')
    fireEvent.click(button)

    await waitFor(jest.fn())

    let overlay: HTMLElement | null = getByTestId(baseElement, 'overlay')
    fireEvent.click(overlay)

    await waitFor(jest.fn())
    getByTestId(baseElement, 'modal-alert')

    const yesButton = getByRole(baseElement, 'button', { name: 'Yes' })
    fireEvent.click(yesButton)

    await waitFor(jest.fn())
    overlay = queryByTestId(baseElement, 'overlay')
    expect(overlay).not.toBeInTheDocument()
  })

  it('should NOT ask for confirmation before closing the modal', async () => {
    const { baseElement } = render(
      <ModalRoot>
        <Content shouldConfirm={false} />
      </ModalRoot>
    )

    const button = getByRole(baseElement, 'button')
    fireEvent.click(button)

    await waitFor(jest.fn())

    const overlay: HTMLElement | null = getByTestId(baseElement, 'overlay')
    fireEvent.click(overlay)

    await waitFor(jest.fn())
    const alertModal = queryByTestId(baseElement, 'modal-alert')
    expect(alertModal).not.toBeInTheDocument()
  })
})
