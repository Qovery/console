import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import Tooltip, { type TooltipProps } from './tooltip'

const props: TooltipProps = {
  content: <p>hello</p>,
}

describe('Tooltip', () => {
  const originalMatchMedia = window.matchMedia

  const mockPointer = (coarse: boolean) => {
    window.matchMedia = jest.fn().mockImplementation((query: string) => ({
      matches: coarse && query === '(pointer: coarse)',
      media: query,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })) as unknown as typeof window.matchMedia
  }

  afterEach(() => {
    window.matchMedia = originalMatchMedia
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<Tooltip {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('opens on tap on touch screens when the trigger is not interactive', async () => {
    mockPointer(true)
    const { userEvent } = renderWithProviders(
      <Tooltip content="Role description">
        <span>info</span>
      </Tooltip>
    )

    await userEvent.click(screen.getByText('info'))

    expect(await screen.findAllByText('Role description')).not.toHaveLength(0)
  })

  it('does not open on tap when the trigger is a button', async () => {
    mockPointer(true)
    const { userEvent } = renderWithProviders(
      <Tooltip content="Copy value">
        <button type="button">copy</button>
      </Tooltip>
    )

    await userEvent.click(screen.getByRole('button', { name: 'copy' }))

    expect(screen.queryByText('Copy value')).not.toBeInTheDocument()
  })

  it('does not open on click with a mouse', async () => {
    mockPointer(false)
    const { userEvent } = renderWithProviders(
      <Tooltip content="Role description">
        <span>info</span>
      </Tooltip>
    )

    await userEvent.click(screen.getByText('info'))

    expect(screen.queryByText('Role description')).not.toBeInTheDocument()
  })
})
