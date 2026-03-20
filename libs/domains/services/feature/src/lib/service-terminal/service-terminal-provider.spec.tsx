import { useContext } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ServiceTerminalContext, ServiceTerminalProvider } from './service-terminal-provider'

function Consumer() {
  const { open, setOpen } = useContext(ServiceTerminalContext)

  return (
    <>
      <span>{open ? 'open' : 'closed'}</span>
      <button type="button" onClick={() => setOpen(true)}>
        open
      </button>
      <button type="button" onClick={() => setOpen(false)}>
        close
      </button>
    </>
  )
}

describe('ServiceTerminalProvider', () => {
  it('is closed by default', () => {
    renderWithProviders(
      <ServiceTerminalProvider>
        <Consumer />
      </ServiceTerminalProvider>
    )

    expect(screen.getByText('closed', { selector: 'span' })).toBeInTheDocument()
  })

  it('opens the terminal when open is triggered', async () => {
    const { userEvent } = renderWithProviders(
      <ServiceTerminalProvider>
        <Consumer />
      </ServiceTerminalProvider>
    )

    await userEvent.click(screen.getByRole('button', { name: 'open' }))

    expect(screen.getByText('open', { selector: 'span' })).toBeInTheDocument()
  })

  it('closes the terminal when close is triggered', async () => {
    const { userEvent } = renderWithProviders(
      <ServiceTerminalProvider>
        <Consumer />
      </ServiceTerminalProvider>
    )

    await userEvent.click(screen.getByRole('button', { name: 'open' }))
    await userEvent.click(screen.getByRole('button', { name: 'close' }))

    expect(screen.getByText('closed', { selector: 'span' })).toBeInTheDocument()
  })
})
