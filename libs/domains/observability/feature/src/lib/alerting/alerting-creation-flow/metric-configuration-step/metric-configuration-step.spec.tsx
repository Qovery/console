import { type AlertSeverity } from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import { act, renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { AlertingCreationFlowContext } from '../alerting-creation-flow'
import { type AlertConfiguration } from '../alerting-creation-flow.types'
import { MetricConfigurationStep } from './metric-configuration-step'

const mockNavigate = jest.fn()
const mockUseParams = jest.fn()
const mockUseLocation = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => mockUseParams(),
  useLocation: () => mockUseLocation(),
  useSearchParams: () => [{ toString: () => '' }],
}))

const createAlert = (overrides: Partial<AlertConfiguration> = {}): AlertConfiguration => ({
  id: 'alert-1',
  name: 'CPU Alert',
  metricCategory: 'cpu',
  metricType: 'avg',
  forDuration: 'PT5M',
  condition: { operator: 'above', threshold: '80' },
  autoResolve: { operator: 'below', threshold: '70' },
  severity: 'MEDIUM' as AlertSeverity,
  notificationChannels: [],
  skipped: false,
  ...overrides,
})

const renderWithContext = async (
  alerts: AlertConfiguration[] = [],
  selectedMetrics: string[] = ['cpu'],
  props: { isEdit?: boolean; isLoadingEditAlertRule?: boolean } = {}
) => {
  const mockSetCurrentStepIndex = jest.fn()
  const mockSetAlerts = jest.fn()
  const mockOnComplete = jest.fn()

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <AlertingCreationFlowContext.Provider
      value={{
        selectedMetrics,
        serviceId: 'service-123',
        serviceName: 'My Service',
        currentStepIndex: 0,
        setCurrentStepIndex: mockSetCurrentStepIndex,
        alerts,
        setAlerts: mockSetAlerts,
        onComplete: mockOnComplete,
        totalSteps: selectedMetrics.length + 1,
        containerName: 'container-1',
      }}
    >
      {children}
    </AlertingCreationFlowContext.Provider>
  )

  let renderResult: ReturnType<typeof renderWithProviders> | undefined
  await act(async () => {
    renderResult = renderWithProviders(
      <Wrapper>
        <MetricConfigurationStep {...props} />
      </Wrapper>
    )
  })

  if (!renderResult) {
    throw new Error('Render result is undefined')
  }

  return {
    ...renderResult,
    mockSetAlerts,
    mockOnComplete,
    mockNavigate,
  }
}

describe('MetricConfigurationStep', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseParams.mockReturnValue({ metricIndex: 'cpu' })
    mockUseLocation.mockReturnValue({ pathname: '/metric/cpu' })
  })

  it('should render metric configuration form', async () => {
    await renderWithContext()

    await waitFor(() => {
      expect(screen.getByText('Alert conditions')).toBeInTheDocument()
      expect(screen.getByText('Configuration')).toBeInTheDocument()
      expect(screen.getByText('My Service')).toBeInTheDocument()
      expect(screen.getAllByText('Alert name').length).toBeGreaterThan(0)
      expect(screen.getByText('Severity')).toBeInTheDocument()
    })
  })

  it('should render metric and metric type selectors', async () => {
    await renderWithContext()

    await waitFor(() => {
      expect(screen.getByText('Metric')).toBeInTheDocument()
      expect(screen.getByText('Trigger condition')).toBeInTheDocument()
      expect(screen.getByText('Duration')).toBeInTheDocument()
    })
  })

  it('should render query preview with metric category and service name', async () => {
    await renderWithContext()

    await waitFor(() => {
      const notificationTexts = screen.getAllByText(/SEND A NOTIFICATION WHEN/i)
      expect(notificationTexts.length).toBeGreaterThan(0)
      const cpuTexts = screen.getAllByText(/cpu/i)
      expect(cpuTexts.length).toBeGreaterThan(0)
      expect(screen.getByText(/My Service/)).toBeInTheDocument()
    })
  })

  it('should render continue button in normal mode', async () => {
    await renderWithContext()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /skip this alert/i })).toBeInTheDocument()
    })
  })

  it('should render save button in edit mode', async () => {
    mockUseParams.mockReturnValue({ alertId: 'alert-1' })
    mockUseLocation.mockReturnValue({ pathname: '/edit/alert-1' })

    await renderWithContext([createAlert({ id: 'alert-1' })], ['cpu'], { isEdit: true })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /skip this alert/i })).not.toBeInTheDocument()
    })
  })

  it('should not render previous button on first step', async () => {
    await renderWithContext([], ['cpu', 'memory'])

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument()
    })
  })

  it('should enable continue button when form is valid', async () => {
    await renderWithContext()

    await waitFor(() => {
      const continueButton = screen.getByRole('button', { name: /continue/i })
      expect(continueButton).toBeEnabled()
    })
  })

  it('should pre-fill form with existing alert data in edit mode', async () => {
    const existingAlert = createAlert({
      id: 'alert-1',
      name: 'Existing Alert',
      metricCategory: 'cpu',
      condition: { operator: 'below', threshold: '50' },
    })

    mockUseParams.mockReturnValue({ alertId: 'alert-1' })
    mockUseLocation.mockReturnValue({ pathname: '/edit/alert-1' })
    await renderWithContext([existingAlert], ['cpu'], { isEdit: true })

    await waitFor(() => {
      const nameInput = screen.getByDisplayValue('Existing Alert')
      expect(nameInput).toBeInTheDocument()
    })
  })
})
