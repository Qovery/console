import * as servicesFeature from '@qovery/domains/services/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { JobStatusesCallout } from './job-statuses-callout'

describe('JobStatusesCallout', () => {
  const mutateMock = jest.fn()

  beforeEach(() => {
    mutateMock.mockReset()
    jest.spyOn(servicesFeature, 'useCleanFailedJobs').mockReturnValue({
      mutate: mutateMock,
      isLoading: false,
    } as unknown as ReturnType<typeof servicesFeature.useCleanFailedJobs>)
  })

  function mockService(serviceType: 'JOB' | 'APPLICATION') {
    jest.spyOn(servicesFeature, 'useService').mockReturnValue({
      data: { serviceType },
    } as unknown as ReturnType<typeof servicesFeature.useService>)
  }

  function mockRunningStatus(state: 'RUNNING' | 'WARNING' | 'ERROR') {
    jest.spyOn(servicesFeature, 'useRunningStatus').mockReturnValue({
      data: { state, pods: [] },
    } as unknown as ReturnType<typeof servicesFeature.useRunningStatus>)
  }

  it('should render nothing for non-job services', () => {
    mockService('APPLICATION')
    mockRunningStatus('ERROR')
    const { container } = renderWithProviders(<JobStatusesCallout environmentId="env-1" serviceId="svc-1" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('should render nothing when running state is healthy', () => {
    mockService('JOB')
    mockRunningStatus('RUNNING')
    const { container } = renderWithProviders(<JobStatusesCallout environmentId="env-1" serviceId="svc-1" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('should render a red callout when state is ERROR', () => {
    mockService('JOB')
    mockRunningStatus('ERROR')
    renderWithProviders(<JobStatusesCallout environmentId="env-1" serviceId="svc-1" />)
    expect(screen.getByText('Job execution failure')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /clear status/i })).toBeInTheDocument()
  })

  it('should render a yellow callout when state is WARNING', () => {
    mockService('JOB')
    mockRunningStatus('WARNING')
    renderWithProviders(<JobStatusesCallout environmentId="env-1" serviceId="svc-1" />)
    expect(screen.getByText('Application pods have experienced issues in the past')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /clear status/i })).toBeInTheDocument()
  })

  it('should trigger cleanFailedJobs when Clear status is clicked', async () => {
    mockService('JOB')
    mockRunningStatus('WARNING')
    const { userEvent } = renderWithProviders(<JobStatusesCallout environmentId="env-1" serviceId="svc-1" />)
    await userEvent.click(screen.getByRole('button', { name: /clear status/i }))
    expect(mutateMock).toHaveBeenCalledWith({
      environmentId: 'env-1',
      payload: { job_ids: ['svc-1'] },
    })
  })
})
