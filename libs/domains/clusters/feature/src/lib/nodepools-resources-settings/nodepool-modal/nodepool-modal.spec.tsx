import { type Cluster } from 'qovery-typescript-axios'
import selectEvent from 'react-select-event'
import { fireEvent, renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { NodepoolModal, type NodepoolModalProps } from './nodepool-modal'

const mockCluster = {
  region: 'us-east-1',
}

const defaultProps: NodepoolModalProps = {
  type: 'stable' as const,
  cluster: mockCluster as Cluster,
  onChange: jest.fn(),
  defaultValues: {
    limits: {
      enabled: true,
      max_cpu_in_vcpu: 8,
      max_memory_in_gibibytes: 16,
      max_gpu: 0,
    },
  },
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

    expect(screen.getByText('Nodepool default')).toBeInTheDocument()
    expect(screen.getByLabelText('vCPU')).toBeInTheDocument()
    expect(screen.getByLabelText('Memory (GiB)')).toBeInTheDocument()
    expect(screen.getByText('Operates every day, 24 hours a day')).toBeInTheDocument()
  })

  it('should render correctly for cronjob type', () => {
    renderWithProviders(<NodepoolModal {...defaultProps} type="cronjob" />)

    expect(screen.getByText('Nodepool cronjob')).toBeInTheDocument()
    expect(screen.getByLabelText('vCPU')).toBeInTheDocument()
    expect(screen.getByLabelText('Memory (GiB)')).toBeInTheDocument()
    expect(screen.getByText('Consolidation schedule')).toBeInTheDocument()
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

    expect(screen.getByText('Minimum allowed is: 6 vCPU.')).toBeInTheDocument()
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
            enabled: true,
            max_cpu_in_vcpu: '8',
            max_memory_in_gibibytes: '16',
            max_gpu: 0,
          },
          consolidation: {
            enabled: true,
            days: ['MONDAY'],
            start_time: 'PT21:00',
            duration: 'PT8H00M',
          },
          spot_enabled: false,
        },
      })
    })
  })

  it.each(['stable', 'default', 'gpu', 'cronjob'] as const)(
    'should render the spot toggle for the %s nodepool',
    (type) => {
      renderWithProviders(<NodepoolModal {...defaultProps} type={type} />)

      expect(screen.getByRole('switch', { name: 'Enable spot instances' })).toBeInTheDocument()
    }
  )

  it.each([
    [
      'stable' as const,
      'Run this nodepool on spot instances. Not recommended: it hosts single-instance applications and containerized databases that cannot tolerate interruptions.',
    ],
    [
      'default' as const,
      'Run workloads on spot instances to reduce costs. Interrupted pods are automatically rescheduled on a new node.',
    ],
    [
      'gpu' as const,
      'Run GPU workloads on spot instances to reduce costs. Spot capacity for GPU instance types can be limited in some regions.',
    ],
    [
      'cronjob' as const,
      'Run jobs on spot instances to reduce costs. A job interrupted by a spot reclaim is rescheduled on a new node.',
    ],
  ])('should describe what spot instances mean for the %s nodepool', (type, description) => {
    renderWithProviders(<NodepoolModal {...defaultProps} type={type} />)

    expect(screen.getByText(description)).toBeInTheDocument()
  })

  it('should seed the spot toggle from defaultValues', () => {
    renderWithProviders(
      <NodepoolModal
        {...defaultProps}
        type="default"
        defaultValues={{ ...defaultProps.defaultValues, spot_enabled: true }}
      />
    )

    expect(screen.getByRole('switch', { name: 'Enable spot instances' })).toBeChecked()
  })

  it('should render the spot toggle off when defaultValues carry no spot value', () => {
    renderWithProviders(<NodepoolModal {...defaultProps} type="default" />)

    expect(screen.getByRole('switch', { name: 'Enable spot instances' })).not.toBeChecked()
  })

  it('should emit spot_enabled on save', async () => {
    const onChangeMock = jest.fn()
    const { userEvent } = renderWithProviders(
      <NodepoolModal {...defaultProps} type="default" onChange={onChangeMock} />
    )

    await userEvent.click(screen.getByRole('switch', { name: 'Enable spot instances' }))
    await userEvent.click(screen.getByText('Confirm'))

    await waitFor(() => {
      expect(onChangeMock).toHaveBeenCalledWith({
        default_override: expect.objectContaining({ spot_enabled: true }),
      })
    })
  })

  it('should warn about interruption-sensitive workloads when stable spot instances are enabled', async () => {
    const { userEvent } = renderWithProviders(<NodepoolModal {...defaultProps} type="stable" />)

    expect(screen.queryByText(/The stable nodepool hosts interruption-sensitive workloads/)).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('switch', { name: 'Enable spot instances' }))

    expect(screen.getByText(/The stable nodepool hosts interruption-sensitive workloads/)).toBeInTheDocument()
  })

  it('should not warn when default nodepool spot instances are enabled', async () => {
    const { userEvent } = renderWithProviders(<NodepoolModal {...defaultProps} type="default" />)

    await userEvent.click(screen.getByRole('switch', { name: 'Enable spot instances' }))

    expect(screen.queryByText(/The stable nodepool hosts interruption-sensitive workloads/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Activating spot instances on a production cluster/)).not.toBeInTheDocument()
  })

  it('should warn on the gpu nodepool only for a production cluster', async () => {
    const { userEvent } = renderWithProviders(
      <NodepoolModal {...defaultProps} type="gpu" cluster={{ ...mockCluster, production: true } as Cluster} />
    )

    await userEvent.click(screen.getByRole('switch', { name: 'Enable spot instances' }))

    expect(screen.getByText(/Activating spot instances on a production cluster/)).toBeInTheDocument()
  })

  it('should not warn on the gpu nodepool for a non-production cluster', async () => {
    const { userEvent } = renderWithProviders(<NodepoolModal {...defaultProps} type="gpu" />)

    await userEvent.click(screen.getByRole('switch', { name: 'Enable spot instances' }))

    expect(screen.queryByText(/Activating spot instances on a production cluster/)).not.toBeInTheDocument()
  })
})
