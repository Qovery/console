import { type Cluster } from 'qovery-typescript-axios'
import selectEvent from 'react-select-event'
import { fireEvent, renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { NodepoolModal } from './nodepool-modal'

const mockCluster = {
  region: 'us-east-1',
}

const defaultProps = {
  type: 'stable' as const,
  cluster: mockCluster as Cluster,
  onChange: jest.fn(),
}

describe('NodepoolModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render correctly for stable type', () => {
    renderWithProviders(<NodepoolModal {...defaultProps} type="stable" />)

    expect(screen.getByText('Nodepool stable')).toBeInTheDocument()
    expect(screen.getByLabelText('vCPU')).toBeInTheDocument()
    expect(screen.getByLabelText('Memory (GiB)')).toBeInTheDocument()
    expect(screen.getByText('Consolidation schedule')).toBeInTheDocument()
  })

  it('should render correctly for default type', () => {
    renderWithProviders(<NodepoolModal {...defaultProps} type="default" />)

    expect(screen.getByText('Nodepool stable')).toBeInTheDocument()
    expect(screen.getByLabelText('vCPU')).toBeInTheDocument()
    expect(screen.getByLabelText('Memory (GiB)')).toBeInTheDocument()
    expect(screen.getByText('Operates every day, 24 hours a day')).toBeInTheDocument()
  })

  it('should validate minimum values for CPU and Memory', async () => {
    const { userEvent } = renderWithProviders(<NodepoolModal {...defaultProps} />)

    const cpuInput = screen.getByLabelText('vCPU')
    const memoryInput = screen.getByLabelText('Memory (GiB)')

    await userEvent.clear(cpuInput)
    await userEvent.type(cpuInput, '2')
    await userEvent.clear(memoryInput)
    await userEvent.type(memoryInput, '5')

    const submitButton = screen.getByText('Confirm')
    await userEvent.click(submitButton)

    expect(screen.getByText('Minimum allowed is: 6 milli vCPU.')).toBeInTheDocument()
    expect(screen.getByText('Minimum allowed is: 10 GiB.')).toBeInTheDocument()
  })

  it('should show consolidation fields when enabled for stable type', async () => {
    const { userEvent } = renderWithProviders(<NodepoolModal {...defaultProps} />)

    const consolidationToggle = screen.getByText('Consolidation schedule')
    await userEvent.click(consolidationToggle)

    expect(screen.getByLabelText(/Start time/)).toBeInTheDocument()
    expect(screen.getByLabelText('Duration')).toBeInTheDocument()
    expect(screen.getByLabelText('Days')).toBeInTheDocument()
  })

  it('should submit form with correct values', async () => {
    const onChangeMock = jest.fn()
    const { userEvent } = renderWithProviders(<NodepoolModal {...defaultProps} onChange={onChangeMock} />)

    const cpuInput = screen.getByLabelText('vCPU')
    const memoryInput = screen.getByLabelText('Memory (GiB)')

    await userEvent.clear(cpuInput)
    await userEvent.type(cpuInput, '8')
    await userEvent.clear(memoryInput)
    await userEvent.type(memoryInput, '16')

    const consolidationToggle = screen.getByText('Consolidation schedule')
    await userEvent.click(consolidationToggle)

    const startTimeInput = screen.getByLabelText(/Start time/)

    // XXX: fireEvent is necessary here because userEvent.type is not working properly with time inputs
    // `showPicker()` in our input provides error
    fireEvent.change(startTimeInput, { target: { value: '21:00' } })

    const durationInput = screen.getByLabelText('Duration')
    await userEvent.type(durationInput, '8h00m')

    const daysSelect = screen.getByLabelText('Days')
    await selectEvent.select(daysSelect, 'Monday', {
      container: document.body,
    })

    const submitButton = screen.getByText('Confirm')
    await waitFor(() => {
      expect(submitButton).toBeEnabled()
    })

    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(onChangeMock).toHaveBeenCalledWith({
        stable_override: {
          limits: {
            max_cpu_in_vcpu: '8',
            max_memory_in_gibibytes: '16',
          },
          consolidation: {
            enabled: true,
            days: ['MONDAY'],
            start_time: 'PT21:00',
            duration: 'PT8H00M',
          },
        },
      })
    })
  })
})
