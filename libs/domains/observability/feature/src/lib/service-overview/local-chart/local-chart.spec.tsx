import '@testing-library/jest-dom'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ChartContent, type ReferenceLineEvent, renderResourceLimitLabel } from './local-chart'
import type { UnitType } from './tooltip'

jest.mock('../util-filter/service-overview-context', () => ({
  useServiceOverviewContext: () => ({
    startTimestamp: '1640994000',
    endTimestamp: '1640994600',
    useLocalTime: false,
    hideEvents: false,
    hoveredEventKey: null,
    setHoveredEventKey: jest.fn(),
  }),
}))

jest.mock('../../hooks/use-events/use-events', () => ({
  useEvents: () => ({ data: [] }),
}))

jest.mock('../modal-chart/modal-chart', () => ({
  ModalChart: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}))

jest.mock('../util-chart/format-timestamp', () => ({
  formatTimestamp: (timestamp: number, useLocalTime: boolean) => ({
    fullTimeString: new Date(timestamp).toLocaleString(),
    timeString: new Date(timestamp).toLocaleTimeString(),
  }),
}))

jest.mock('./tooltip', () => ({
  Tooltip: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  UnitType: {} as any,
}))

jest.mock('@qovery/shared/util-js', () => ({
  pluralize: (count: number, singular: string, plural: string) =>
    count === 1 ? `${count} ${singular}` : `${count} ${plural}`,
  twMerge: (...classes: string[]) => classes.filter(Boolean).join(' '),
}))

describe('renderResourceLimitLabel', () => {
  const mockChartData = [
    { timestamp: 1640994000000, value: 10 },
    { timestamp: 1640994300000, value: 20 },
    { timestamp: 1640994600000, value: 30 },
  ]

  it('should render text label at the end of chart with valid value', () => {
    const labelFunction = renderResourceLimitLabel('CPU Limit', mockChartData)
    const result = labelFunction({
      x: 100,
      y: 50,
      index: 2, // last index
      value: 30,
    })

    expect(result.type).toBe('text')
  })

  it('should return empty group when not at the end', () => {
    const labelFunction = renderResourceLimitLabel('Memory Limit', mockChartData)
    const result = labelFunction({
      x: 50,
      y: 25,
      index: 1, // middle index
      value: 20,
    })

    expect(result.type).toBe('g')
  })

  it('should return empty group when value is undefined', () => {
    const labelFunction = renderResourceLimitLabel('CPU Limit', mockChartData)
    const result = labelFunction({
      x: 100,
      y: 50,
      index: 2, // last index
      value: undefined,
    })

    expect(result.type).toBe('g')
  })

  it('should return empty group for empty chart data', () => {
    const labelFunction = renderResourceLimitLabel('Test Limit', [])
    const result = labelFunction({
      x: 0,
      y: 0,
      index: 0,
      value: 0,
    })

    expect(result.type).toBe('g')
  })

  it('should handle different label types', () => {
    const labels = ['CPU Limit', 'Memory Limit', 'Custom Resource Limit']

    labels.forEach((label) => {
      const labelFunction = renderResourceLimitLabel(label, mockChartData)
      expect(typeof labelFunction).toBe('function')
    })
  })
})

describe('ReferenceLineEvent Type', () => {
  it('should accept valid reference line event structures', () => {
    const eventTypes = ['event', 'metric', 'exit-code', 'k8s-event', 'probe'] as const

    eventTypes.forEach((type) => {
      const event: ReferenceLineEvent = {
        type,
        timestamp: 1640994000000,
        reason: `Test ${type}`,
        icon: 'info',
        key: `test-${type}`,
        color: '#ff0000',
      }

      expect(event.type).toBe(type)
    })
  })

  it('should handle optional color property', () => {
    const eventWithColor: ReferenceLineEvent = {
      type: 'event',
      timestamp: 1640994000000,
      reason: 'Deployment',
      icon: 'check',
      key: 'deploy-123',
      color: '#00ff00',
    }

    const eventWithoutColor: ReferenceLineEvent = {
      type: 'metric',
      timestamp: 1640994300000,
      reason: 'High CPU',
      icon: 'warning',
      key: 'cpu-alert',
    }

    expect(eventWithColor.color).toBe('#00ff00')
    expect(eventWithoutColor.color).toBeUndefined()
  })
})

describe('ChartContent', () => {
  // Mock chart data for testing
  const mockData = [
    { timestamp: 1640994000000, time: '12:00', fullTime: '2022-01-01 12:00:00', value: 10 },
    { timestamp: 1640994300000, time: '12:05', fullTime: '2022-01-01 12:05:00', value: 20 },
  ]

  // Default props for ChartContent component
  const defaultProps = {
    data: mockData,
    unit: 'percent' as UnitType,
    label: 'Test Chart',
    isEmpty: false,
    isLoading: false,
  }

  // Mock reference line events data for testing different event types
  const mockReferenceLineData: ReferenceLineEvent[] = [
    {
      type: 'event',
      timestamp: 1640994000000,
      reason: 'Deployed',
      icon: 'check',
      key: 'deploy-123',
      color: 'var(--color-green-500)',
      version: 'v1.0.0',
      repository: 'my-app',
    },
    {
      type: 'event',
      timestamp: 1640994300000,
      reason: 'Deploy failed',
      icon: 'xmark',
      key: 'deploy-456',
      color: 'var(--color-red-500)',
      version: 'v1.1.0',
      repository: 'my-app',
    },
    {
      type: 'exit-code',
      timestamp: 1640994600000,
      reason: 'Container exited',
      icon: 'warning',
      key: 'container-abc123',
      color: 'var(--color-yellow-500)',
      description: 'Exit code 1',
    },
  ]

  // Mock service data for testing different service types
  const mockService = {
    id: 'service-123',
    service_type: 'CONTAINER' as const,
    serviceType: 'CONTAINER' as const,
    name: 'test-service',
    created_at: '2022-01-01T00:00:00Z',
    updated_at: '2022-01-01T00:00:00Z',
    environment: {
      id: 'env-123',
      name: 'test-env',
    },
    auto_preview: false,
    auto_deploy: false,
    build_mode: 'DOCKER' as const,
    dockerfile_path: undefined,
    image_name: 'nginx',
    tag: 'latest',
    cpu: 512,
    memory: 1024,
    min_running_instances: 1,
    max_running_instances: 1,
    healthchecks: {},
    advanced_settings_json: '{}',
    deployment_stage_id: 'stage-123',
    environment_variables: [],
    secrets: [],
    storage: [],
    ports: [],
    arguments: [],
    entrypoint: '',
    registry: {
      id: 'registry-123',
      name: 'test-registry',
      url: 'https://registry.example.com',
      kind: 'DOCKER_HUB' as const,
    },
    maximum_cpu: 1000,
    maximum_memory: 2048,
    icon_uri: 'https://example.com/icon.png',
  }

  it('should render chart without events when referenceLineData is empty', () => {
    renderWithProviders(<ChartContent {...defaultProps} />)

    expect(screen.queryByText(/Events associated/)).not.toBeInTheDocument()
  })

  it('should render events list when referenceLineData is provided and isFullscreen is true', () => {
    renderWithProviders(
      <ChartContent {...defaultProps} referenceLineData={mockReferenceLineData} isFullscreen={true} />
    )

    expect(screen.getByText('3 Events associated')).toBeInTheDocument()
    expect(screen.getByText('Deployed')).toBeInTheDocument()
    expect(screen.getByText('Deploy failed')).toBeInTheDocument()
    expect(screen.getByText('Container exited')).toBeInTheDocument()
  })

  it('should not render events list when isFullscreen is false', () => {
    renderWithProviders(
      <ChartContent {...defaultProps} referenceLineData={mockReferenceLineData} isFullscreen={false} />
    )

    expect(screen.queryByText(/Events associated/)).not.toBeInTheDocument()
  })

  it('should display correct event details for container service', () => {
    renderWithProviders(
      <ChartContent
        {...defaultProps}
        referenceLineData={[mockReferenceLineData[0]]}
        service={mockService as unknown as Parameters<typeof ChartContent>[0]['service']}
        isFullscreen={true}
      />
    )

    expect(screen.getByText('Image name: my-app')).toBeInTheDocument()
    expect(screen.getByText('Tag: v1.0.0')).toBeInTheDocument()
  })

  it('should display correct event details for application service', () => {
    const appService = {
      ...mockService,
      service_type: 'APPLICATION' as const,
      serviceType: 'APPLICATION' as const,
    }

    renderWithProviders(
      <ChartContent
        {...defaultProps}
        referenceLineData={[mockReferenceLineData[0]]}
        service={appService as unknown as Parameters<typeof ChartContent>[0]['service']}
        isFullscreen={true}
      />
    )

    expect(screen.getByText('Repository: my-app')).toBeInTheDocument()
    expect(screen.getByText('Version: v1.0.0')).toBeInTheDocument()
  })

  it('should display instance name for exit-code events', () => {
    renderWithProviders(
      <ChartContent {...defaultProps} referenceLineData={[mockReferenceLineData[2]]} isFullscreen={true} />
    )

    expect(screen.getByText('Instance name:')).toBeInTheDocument()
    expect(screen.getByText('bc123')).toBeInTheDocument()
  })

  it('should display event description when provided', () => {
    const eventWithDescription = {
      ...mockReferenceLineData[0],
      description: 'This is a test description',
    }

    renderWithProviders(
      <ChartContent {...defaultProps} referenceLineData={[eventWithDescription]} isFullscreen={true} />
    )

    expect(screen.getByText('This is a test description')).toBeInTheDocument()
  })

  it('should truncate long version strings', () => {
    const eventWithLongVersion = {
      ...mockReferenceLineData[0],
      version: 'very-long-version-string-that-should-be-truncated',
    }

    renderWithProviders(
      <ChartContent {...defaultProps} referenceLineData={[eventWithLongVersion]} isFullscreen={true} />
    )

    // The component should truncate long version strings
    // Look for the truncated version using a more flexible approach
    expect(screen.getByText(/very-lon/)).toBeInTheDocument()
    expect(screen.queryByText('very-long-version-string-that-should-be-truncated')).not.toBeInTheDocument()
  })

  it('should display singular Event when only one event', () => {
    renderWithProviders(
      <ChartContent {...defaultProps} referenceLineData={[mockReferenceLineData[0]]} isFullscreen={true} />
    )

    expect(screen.getByText('1 Event associated')).toBeInTheDocument()
  })

  it('should display plural Events when multiple events', () => {
    renderWithProviders(
      <ChartContent {...defaultProps} referenceLineData={mockReferenceLineData} isFullscreen={true} />
    )

    expect(screen.getByText('3 Events associated')).toBeInTheDocument()
  })
})
