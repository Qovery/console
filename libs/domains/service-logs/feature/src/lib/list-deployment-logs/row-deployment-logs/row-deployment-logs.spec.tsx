import { TablePrimitives } from '@qovery/shared/ui'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { RowDeploymentLogs } from './row-deployment-logs'

const mockCopyToClipboard = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  useLocation: () => ({ pathname: '/', hash: '' }),
  useNavigate: jest.fn(),
}))

jest.mock('@qovery/shared/util-hooks', () => ({
  ...jest.requireActual('@qovery/shared/util-hooks'),
  useCopyToClipboard: () => [undefined, mockCopyToClipboard],
}))

const { Table } = TablePrimitives

describe('RowDeploymentLogs', () => {
  const mockProps = {
    index: 0,
    original: {
      id: 1,
      timestamp: '2023-04-01T12:00:00Z',
      message: {
        safe_message: 'Test log message',
      },
      details: {
        stage: {
          step: 'Building',
        },
      },
    },
  }

  const renderRowDeploymentLogs = () =>
    renderWithProviders(
      <Table.Root>
        <Table.Body>
          <RowDeploymentLogs {...mockProps} />
        </Table.Body>
      </Table.Root>
    )

  beforeEach(() => {
    mockCopyToClipboard.mockClear()
  })

  it('should render successfully', () => {
    const { baseElement } = renderRowDeploymentLogs()
    expect(baseElement).toBeTruthy()
  })

  it('renders basic row content', () => {
    renderRowDeploymentLogs()

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('Test log message')).toBeInTheDocument()
  })

  it('keeps row number non-selectable while date selection is visually neutral', () => {
    renderRowDeploymentLogs()

    expect(screen.getByText('1').closest('td')).toHaveClass('select-none')
    expect(screen.getByTitle('Sat, 01 Apr 2023 12:00:00 GMT').closest('td')).toHaveClass(
      'selection:bg-transparent',
      'selection:text-neutral-subtle'
    )
    expect(screen.getByTitle('Sat, 01 Apr 2023 12:00:00 GMT')).toHaveAttribute('data-log-copy-exclude', 'true')
    expect(screen.getByText('Test log message').closest('[data-log-message="true"]')).toBeInTheDocument()
  })

  it('copies row URL from row link button', async () => {
    const { userEvent } = renderRowDeploymentLogs()

    await userEvent.click(screen.getByRole('button'))

    expect(mockCopyToClipboard).toHaveBeenCalledWith(`${window.location.href.split('#')[0]}#1`)
  })
})
