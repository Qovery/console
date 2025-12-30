import { type AlertRuleResponse, type ServiceLightResponse } from 'qovery-typescript-axios'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import * as useCreateAlertRule from '../../hooks/use-create-alert-rule/use-create-alert-rule'
import * as useServicesSearch from '../../hooks/use-services-search/use-services-search'
import { AlertRulesCloneModal } from './alert-rules-clone-modal'

const mockUseCreateAlertRule = jest.spyOn(useCreateAlertRule, 'useCreateAlertRule') as jest.Mock
const mockUseServicesSearch = jest.spyOn(useServicesSearch, 'useServicesSearch') as jest.Mock

const mockOnClose = jest.fn()
const mockMutateAsync = jest.fn()

const defaultAlertRule = {
  id: 'alert-rule-123',
  name: 'CPU Alert',
  cluster_id: 'cluster-123',
  tag: 'CPU',
  description: 'Test description',
  condition: {
    kind: 'BUILT',
    operator: 'ABOVE',
    threshold: 0.8,
    promql: 'cpu_usage > 0.8',
  },
  for_duration: 'PT5M',
  severity: 'CRITICAL',
  enabled: true,
  alert_receiver_ids: [],
  presentation: {},
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  organization_id: 'org-123',
  target: {
    target_type: 'APPLICATION',
    target_id: 'service-1',
  },
  is_up_to_date: true,
  state: 'MONITORING',
  source: 'MANAGED',
} as unknown as AlertRuleResponse

const mockServices: ServiceLightResponse[] = [
  {
    id: 'service-1',
    name: 'Service One',
    project_name: 'Project A',
    environment_name: 'Environment 1',
    service_type: 'APPLICATION',
    icon_uri: '',
  } as ServiceLightResponse,
  {
    id: 'service-2',
    name: 'Service Two',
    project_name: 'Project B',
    environment_name: 'Environment 2',
    service_type: 'APPLICATION',
    icon_uri: '',
  } as ServiceLightResponse,
]

describe('AlertRulesCloneModal', () => {
  const defaultProps = {
    alertRule: defaultAlertRule,
    organizationId: 'org-123',
    onClose: mockOnClose,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseCreateAlertRule.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isLoading: false,
    })
    mockUseServicesSearch.mockReturnValue({
      data: mockServices,
      isLoading: false,
    })
  })

  it('should render modal with title, description, search input and submit button', async () => {
    renderWithProviders(<AlertRulesCloneModal {...defaultProps} />)

    expect(await screen.findByText('Service selection')).toBeInTheDocument()
    expect(
      await screen.findByText('Please select all the services you want to clone your alerts on')
    ).toBeInTheDocument()
    expect(await screen.findByPlaceholderText('Search for services to clone alerts on')).toBeInTheDocument()
    expect(await screen.findByText('Add service')).toBeInTheDocument()
    expect(await screen.findByText('Clone alerts')).toBeInTheDocument()
  })

  it('should display and filter services when searching', async () => {
    const { userEvent } = renderWithProviders(<AlertRulesCloneModal {...defaultProps} />)

    const input = await screen.findByPlaceholderText('Search for services to clone alerts on')
    await userEvent.click(input)

    expect(await screen.findByText('Service One')).toBeInTheDocument()
    expect(await screen.findByText('Service Two')).toBeInTheDocument()

    await userEvent.type(input, 'One')
    expect(await screen.findByText('Service One')).toBeInTheDocument()
    expect(screen.queryByText('Service Two')).not.toBeInTheDocument()
  })

  it('should call cloneAlertRule and onClose when form is submitted', async () => {
    mockMutateAsync.mockResolvedValue({})
    const { userEvent } = renderWithProviders(<AlertRulesCloneModal {...defaultProps} />)

    const input = await screen.findByPlaceholderText('Search for services to clone alerts on')
    await userEvent.click(input)
    await userEvent.click(await screen.findByText('Service One'))
    await userEvent.click(await screen.findByText('Clone alerts'))

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        payload: {
          organization_id: 'org-123',
          cluster_id: 'cluster-123',
          target: { target_id: 'service-1', target_type: 'APPLICATION' },
          name: 'CPU Alert',
          tag: 'CPU',
          description: 'Test description',
          condition: {
            kind: 'BUILT',
            operator: 'ABOVE',
            threshold: 0.8,
            promql: 'cpu_usage > 0.8',
          },
          for_duration: 'PT5M',
          severity: 'CRITICAL',
          enabled: true,
          alert_receiver_ids: [],
          presentation: {},
        },
      })
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('should disable submit button when loading', async () => {
    mockUseCreateAlertRule.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isLoading: true,
    })

    renderWithProviders(<AlertRulesCloneModal {...defaultProps} />)
    expect(await screen.findByText('Clone alerts')).toBeDisabled()
  })
})
