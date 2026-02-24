import { DatabaseModeEnum } from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ServiceOverview } from './service-overview'

const mockUseService = jest.fn()
const mockUseRunningStatus = jest.fn()
const mockUseFeatureFlagVariantKey = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ environmentId: 'env-1', serviceId: 'service-1' }),
}))

jest.mock('posthog-js/react', () => ({
  useFeatureFlagVariantKey: () => mockUseFeatureFlagVariantKey(),
}))

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  Heading: ({ children }: { children?: ReactNode }) => <h2>{children}</h2>,
  Section: ({ children }: { children?: ReactNode }) => <section>{children}</section>,
  Link: ({ children }: { children?: ReactNode }) => <a href="https://qovery.com">{children}</a>,
  Icon: () => <span>icon</span>,
  TabsPrimitives: {
    Tabs: {
      Root: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
      List: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
      Trigger: ({ children }: { children?: ReactNode }) => <button>{children}</button>,
      Content: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    },
  },
}))

jest.mock('../hooks/use-service/use-service', () => ({
  useService: () => mockUseService(),
}))

jest.mock('../hooks/use-running-status/use-running-status', () => ({
  useRunningStatus: () => mockUseRunningStatus(),
}))

jest.mock('./service-header/service-header', () => ({
  ServiceHeader: () => <div>service-header</div>,
}))

jest.mock('./instance-metrics/instance-metrics', () => ({
  InstanceMetrics: () => <div>instance-metrics</div>,
}))

jest.mock('./service-instance/service-instance', () => ({
  ServiceInstance: () => <div>service-instance</div>,
}))

jest.mock('./service-last-deployment/service-last-deployment', () => ({
  ServiceLastDeployment: () => <div>service-last-deployment</div>,
}))

jest.mock('../keda/scaled-object-status/scaled-object-status', () => ({
  ScaledObjectStatus: () => <div>scaled-object-status</div>,
}))

jest.mock('@qovery/domains/variables/feature', () => ({
  OutputVariables: () => <div>output-variables</div>,
}))

describe('ServiceOverview', () => {
  const environment = {
    id: 'env-1',
    organization: { id: 'org-1' },
    project: { id: 'project-1' },
  } as never

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseFeatureFlagVariantKey.mockReturnValue(false)
    mockUseRunningStatus.mockReturnValue({ data: null })
  })

  it('renders nothing when service is missing', () => {
    mockUseService.mockReturnValue({ data: undefined })

    renderWithProviders(<ServiceOverview environment={environment} />)

    expect(screen.queryByText('service-header')).not.toBeInTheDocument()
  })

  it('shows observability callout only when hasNoMetrics is true', () => {
    mockUseService.mockReturnValue({
      data: { id: 'service-1', serviceType: 'APPLICATION', autoscaling: { mode: 'FIXED' } },
    })

    const { rerender } = renderWithProviders(
      <ServiceOverview
        environment={environment}
        hasNoMetrics={false}
        observabilityCallout={<div>observability-callout</div>}
      />
    )

    expect(screen.queryByText('observability-callout')).not.toBeInTheDocument()

    rerender(
      <ServiceOverview environment={environment} hasNoMetrics observabilityCallout={<div>observability-callout</div>} />
    )

    expect(screen.getByText('observability-callout')).toBeInTheDocument()
  })

  it('renders managed database empty metrics message', () => {
    mockUseService.mockReturnValue({
      data: { id: 'service-db-1', serviceType: 'DATABASE', mode: DatabaseModeEnum.MANAGED },
    })

    renderWithProviders(<ServiceOverview environment={environment} />)

    expect(screen.getByText('Metrics for managed databases are not available')).toBeInTheDocument()
    expect(screen.getByText('Check your cloud provider console to get more information')).toBeInTheDocument()
  })

  it('renders terraform resources section and hides service instances block', () => {
    mockUseService.mockReturnValue({
      data: { id: 'service-tf-1', serviceType: 'TERRAFORM', autoscaling: { mode: 'FIXED' } },
    })

    renderWithProviders(
      <ServiceOverview environment={environment} terraformResourcesSection={<div>terraform-resources</div>} />
    )

    expect(screen.getByText('terraform-resources')).toBeInTheDocument()
    expect(screen.queryByText('service-instance')).not.toBeInTheDocument()
  })

  it('renders scaled object block for keda autoscaling', () => {
    mockUseFeatureFlagVariantKey.mockReturnValue(true)
    mockUseService.mockReturnValue({
      data: { id: 'service-app-keda', serviceType: 'APPLICATION', autoscaling: { mode: 'KEDA' } },
    })
    mockUseRunningStatus.mockReturnValue({
      data: { scaled_object: { name: 'app-keda-so' } },
    })

    renderWithProviders(<ServiceOverview environment={environment} />)

    expect(screen.getByText('Scaled Object (KEDA)')).toBeInTheDocument()
    expect(screen.getByText('scaled-object-status')).toBeInTheDocument()
  })

  it.each(['APPLICATION', 'CONTAINER', 'HELM', 'JOB'])('renders core overview blocks for %s service', (serviceType) => {
    mockUseService.mockReturnValue({
      data: {
        id: `service-${serviceType.toLowerCase()}`,
        serviceType,
        autoscaling: { mode: 'FIXED' },
        job_type: 'CRON',
      },
    })

    renderWithProviders(<ServiceOverview environment={environment} />)

    expect(screen.getByText('service-header')).toBeInTheDocument()
    expect(screen.getByText('service-last-deployment')).toBeInTheDocument()
    expect(screen.getByText('service-instance')).toBeInTheDocument()
  })
})
