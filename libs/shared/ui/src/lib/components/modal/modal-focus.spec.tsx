import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import Modal from './modal'

it('restores focus to the caller control after closing with Escape', async () => {
  const onCloseAutoFocus = jest.fn((event: Event) => {
    event.preventDefault()
    screen.getByRole('button', { name: 'Create cloud credentials' }).focus()
  })
  const { userEvent } = renderWithProviders(
    <>
      <button type="button">Create cloud credentials</button>
      <Modal defaultOpen onCloseAutoFocus={onCloseAutoFocus}>
        <div>
          <input aria-label="Credential name" />
        </div>
      </Modal>
    </>
  )
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  await userEvent.keyboard('{Escape}')
  await waitFor(() => expect(onCloseAutoFocus).toHaveBeenCalledTimes(1))
  expect(screen.getByRole('button', { name: 'Create cloud credentials' })).toHaveFocus()
})
