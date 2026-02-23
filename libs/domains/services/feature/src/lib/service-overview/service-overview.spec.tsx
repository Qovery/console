import { DatabaseModeEnum } from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import { type AnyService } from '@qovery/domains/services/data-access'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ServiceOverview } from './service-overview'

jest.mock('posthog-js/react', () => ({
  useFeatureFlagVariantKey: jest.fn(() => undefined),
}))

jest.mock('../pod-statuses-callout/pod-statuses-callout', () => ({
  PodStatusesCallout: () => <div data-testid="pod-statuses-callout">PodStatusesCallout</div>,
}))
jest.mock('../pods-metrics/pods-metrics', () => ({
  PodsMetrics: ({ children }: { children?: ReactNode }) => <div data-testid="pods-metrics">PodsMetrics{children}</div>,
}))
jest.mock('../service-details/service-details', () => ({
  ServiceDetails: () => <div data-testid="service-details">ServiceDetails</div>,
}))
jest.mock('../keda/scaled-object-status/scaled-object-status', () => ({
  ScaledObjectStatus: () => <div data-testid="scaled-object-status">ScaledObjectStatus</div>,
}))
jest.mock('@qovery/domains/variables/feature', () => ({
  OutputVariables: () => <div data-testid="output-variables">OutputVariables</div>,
}))
jest.mock('@qovery/domains/service-terraform/feature', () => ({
  TerraformResourcesSection: () => <div data-testid="terraform-resources">TerraformResourcesSection</div>,
}))
jest.mock('./observability-callout', () => ({
  ObservabilityCallout: () => <div data-testid="observability-callout">ObservabilityCallout</div>,
}))

const databaseManagedService: AnyService = {
  id: 'db-1',
  serviceType: 'DATABASE',
  name: 'my-db',
  mode: DatabaseModeEnum.MANAGED,
} as AnyService

const databaseContainerService: AnyService = {
  id: 'db-2',
  serviceType: 'DATABASE',
  name: 'my-db',
  mode: DatabaseModeEnum.CONTAINER,
} as AnyService

const applicationService: AnyService = {
  id: 'app-1',
  serviceType: 'APPLICATION',
  name: 'my-app',
} as AnyService

describe('ServiceOverview', () => {
  it('should render managed database message when database is managed', () => {
    renderWithProviders(<ServiceOverview serviceId="db-1" environmentId="env-1" service={databaseManagedService} />)
    expect(screen.getByText(/Metrics for managed databases are not available/i)).toBeInTheDocument()
    expect(screen.getByTestId('service-details')).toBeInTheDocument()
  })

  it('should render PodStatusesCallout and PodsMetrics for container database', () => {
    renderWithProviders(<ServiceOverview serviceId="db-2" environmentId="env-1" service={databaseContainerService} />)
    expect(screen.getByTestId('pod-statuses-callout')).toBeInTheDocument()
    expect(screen.getByTestId('pods-metrics')).toBeInTheDocument()
    expect(screen.getByTestId('service-details')).toBeInTheDocument()
  })

  it('should render application overview with ObservabilityCallout when hasNoMetrics', () => {
    renderWithProviders(
      <ServiceOverview serviceId="app-1" environmentId="env-1" service={applicationService} hasNoMetrics />
    )
    expect(screen.getByTestId('observability-callout')).toBeInTheDocument()
    expect(screen.getByTestId('pod-statuses-callout')).toBeInTheDocument()
    expect(screen.getByTestId('pods-metrics')).toBeInTheDocument()
    expect(screen.getByTestId('service-details')).toBeInTheDocument()
  })

  it('should render application overview without ObservabilityCallout when hasNoMetrics is false', () => {
    renderWithProviders(
      <ServiceOverview serviceId="app-1" environmentId="env-1" service={applicationService} hasNoMetrics={false} />
    )
    expect(screen.queryByTestId('observability-callout')).not.toBeInTheDocument()
    expect(screen.getByTestId('service-details')).toBeInTheDocument()
  })
})
