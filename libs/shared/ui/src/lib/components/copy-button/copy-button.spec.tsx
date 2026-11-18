import { act, renderWithProviders, screen } from '@qovery/shared/util-tests'
import CopyButton from './copy-button'

describe('CopyButton', () => {
  test('should render CopyButton component', () => {
    renderWithProviders(<CopyButton content="Hello, world!" />)
    const copyButton = screen.getByText('Copy')
    expect(copyButton).toBeInTheDocument()
  })

  test('should render an accessible icon-only copy button without a visible label', () => {
    renderWithProviders(<CopyButton content="Hello, world!" iconOnly />)

    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument()
    expect(screen.queryByText('Copy')).not.toBeInTheDocument()
  })

  test('takes a specific accessible name', () => {
    renderWithProviders(<CopyButton content="qovery auth" aria-label="Copy the CLI command" />)
    expect(screen.getByRole('button', { name: 'Copy the CLI command' })).toBeInTheDocument()
  })

  test('says Copied in a polite live region for 2 seconds, then Copy again', async () => {
    jest.useFakeTimers()
    const { userEvent } = renderWithProviders(<CopyButton content="Hello, world!" />)
    await userEvent.click(screen.getByRole('button'))

    const status = screen.getByText('Copied')
    expect(status).toHaveAttribute('aria-live', 'polite')
    act(() => {
      jest.advanceTimersByTime(2000)
    })
    expect(screen.getByText('Copy')).toBeInTheDocument()
    jest.useRealTimers()
  })

  test('announces Copied even when the button shows only an icon', async () => {
    const { userEvent } = renderWithProviders(<CopyButton content="Hello, world!" iconOnly aria-label="Copy the URL" />)
    await userEvent.click(screen.getByRole('button', { name: 'Copy the URL' }))
    expect(screen.getByText('Copied')).toHaveClass('sr-only')
  })
})
