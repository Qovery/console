import { render } from '@qovery/shared/util-tests'
import { Tooltip, type TooltipEntry } from './tooltip'

describe('Tooltip', () => {
  const mockPayload: TooltipEntry[] = [
    {
      dataKey: 'cpu-request',
      value: 100,
      color: '#ff0000',
      payload: {
        timestamp: 1640995200000,
        fullTime: '2022-01-01 12:00:00',
        'cpu-request': 100,
      },
    },
    {
      dataKey: 'cpu-limit',
      value: 200,
      color: '#00ff00',
      payload: {
        timestamp: 1640995200000,
        fullTime: '2022-01-01 12:00:00',
        'cpu-limit': 200,
      },
    },
  ]

  it('should render successfully when active with payload', () => {
    const { container } = render(<Tooltip active={true} unit="mCPU" payload={mockPayload} customLabel="Test Chart" />)

    expect(container).toBeTruthy()
  })

  it('should return null when not active', () => {
    const { container } = render(<Tooltip active={false} unit="mCPU" payload={mockPayload} customLabel="Test Chart" />)

    expect(container).toBeEmptyDOMElement()
  })

  it('should return null when payload is empty', () => {
    const { container } = render(<Tooltip active={true} unit="mCPU" payload={[]} customLabel="Test Chart" />)

    expect(container).toBeEmptyDOMElement()
  })

  it('should display custom label and timestamp', () => {
    const { getByText } = render(<Tooltip active={true} unit="mCPU" payload={mockPayload} customLabel="Test Chart" />)

    expect(getByText('Test Chart')).toBeInTheDocument()
    expect(getByText('2022-01-01 12:00:00')).toBeInTheDocument()
  })

  it('should display CPU Request and CPU Limit separately when values differ', () => {
    const { getByText } = render(<Tooltip active={true} unit="mCPU" payload={mockPayload} customLabel="CPU Usage" />)

    expect(getByText('Cpu Request')).toBeInTheDocument()
    expect(getByText('Cpu Limit')).toBeInTheDocument()
    expect(getByText('100.00 mCPU')).toBeInTheDocument()
    expect(getByText('200.00 mCPU')).toBeInTheDocument()
  })

  it('should combine request and limit when values are equal', () => {
    const equalPayload: TooltipEntry[] = [
      {
        dataKey: 'cpu-request',
        value: 150,
        color: '#ff0000',
        payload: { timestamp: 1640995200000, fullTime: '2022-01-01 12:00:00' },
      },
      {
        dataKey: 'cpu-limit',
        value: 150,
        color: '#00ff00',
        payload: { timestamp: 1640995200000, fullTime: '2022-01-01 12:00:00' },
      },
    ]

    const { getByText, queryByText } = render(
      <Tooltip active={true} unit="mCPU" payload={equalPayload} customLabel="CPU Usage" />
    )

    expect(getByText('CPU Request/Limit')).toBeInTheDocument()
    expect(getByText('150.00 mCPU')).toBeInTheDocument()
    expect(queryByText('Cpu Request')).not.toBeInTheDocument()
    expect(queryByText('Cpu Limit')).not.toBeInTheDocument()
  })
})

describe('Tooltip with different units', () => {
  it('should format MiB unit correctly', () => {
    const payload: TooltipEntry[] = [
      {
        dataKey: 'memory',
        value: 512.5,
        color: '#0000ff',
        payload: { timestamp: 1640995200000, fullTime: '2022-01-01 12:00:00' },
      },
    ]

    const { getByText } = render(<Tooltip active={true} unit="MiB" payload={payload} customLabel="Memory Usage" />)

    expect(getByText('512.50 MiB')).toBeInTheDocument()
  })

  it('should format req/s unit correctly', () => {
    const payload: TooltipEntry[] = [
      {
        dataKey: 'requests',
        value: 10.75,
        color: '#ff00ff',
        payload: { timestamp: 1640995200000, fullTime: '2022-01-01 12:00:00' },
      },
    ]

    const { getByText } = render(<Tooltip active={true} unit="req/s" payload={payload} customLabel="Request Rate" />)

    expect(getByText('10.75 req/s')).toBeInTheDocument()
  })

  it('should format instance unit without decimal places', () => {
    const payload: TooltipEntry[] = [
      {
        dataKey: 'instances',
        value: 3,
        color: '#ffff00',
        payload: { timestamp: 1640995200000, fullTime: '2022-01-01 12:00:00' },
      },
    ]

    const { getByText } = render(
      <Tooltip active={true} unit="instance" payload={payload} customLabel="Instance Count" />
    )

    expect(getByText('3')).toBeInTheDocument()
  })

  it('should handle percentage unit', () => {
    const payload: TooltipEntry[] = [
      {
        dataKey: 'usage',
        value: 75.25,
        color: '#00ffff',
        payload: { timestamp: 1640995200000, fullTime: '2022-01-01 12:00:00' },
      },
    ]

    const { getByText } = render(<Tooltip active={true} unit="%" payload={payload} customLabel="Usage Percentage" />)

    expect(getByText('75.25 %')).toBeInTheDocument()
  })
})

describe('Tooltip display names', () => {
  it('should handle storage series names', () => {
    const payload: TooltipEntry[] = [
      {
        dataKey: 'persistent-storage',
        value: 1024,
        color: '#123456',
        payload: { timestamp: 1640995200000, fullTime: '2022-01-01 12:00:00' },
      },
    ]

    const { getByText } = render(<Tooltip active={true} unit="MiB" payload={payload} customLabel="Storage" />)

    expect(getByText('Persistent storage')).toBeInTheDocument()
  })

  it('should handle qovery namespace series names', () => {
    const payload: TooltipEntry[] = [
      {
        dataKey: 'qovery-app-test-service-pod-123',
        value: 50,
        color: '#654321',
        payload: { timestamp: 1640995200000, fullTime: '2022-01-01 12:00:00' },
      },
    ]

    const { getByText } = render(<Tooltip active={true} unit="mCPU" payload={payload} customLabel="Pod Usage" />)

    expect(getByText('test-service-pod-123')).toBeInTheDocument()
  })

  it('should handle app namespace series names', () => {
    const payload: TooltipEntry[] = [
      {
        dataKey: 'app-test-service-instance-456',
        value: 75,
        color: '#987654',
        payload: { timestamp: 1640995200000, fullTime: '2022-01-01 12:00:00' },
      },
    ]

    const { getByText } = render(<Tooltip active={true} unit="mCPU" payload={payload} customLabel="Instance Usage" />)

    expect(getByText('service-instance-456')).toBeInTheDocument()
  })
})

describe('Tooltip edge cases', () => {
  it('should handle null values correctly', () => {
    const payload = [
      {
        dataKey: 'test-metric',
        value: null as unknown as number,
        color: '#000000',
        payload: { timestamp: 1640995200000, fullTime: '2022-01-01 12:00:00' },
      },
    ]

    const { getByText } = render(<Tooltip active={true} unit="mCPU" payload={payload} customLabel="Test" />)

    expect(getByText('0.00 mCPU')).toBeInTheDocument()
  })

  it('should handle invalid string values as NaN', () => {
    const payload = [
      {
        dataKey: 'test-metric',
        value: 'invalid' as unknown as number,
        color: '#000000',
        payload: { timestamp: 1640995200000, fullTime: '2022-01-01 12:00:00' },
      },
    ]

    const { getByText } = render(<Tooltip active={true} unit="mCPU" payload={payload} customLabel="Test" />)

    expect(getByText('N/A')).toBeInTheDocument()
  })

  it('should handle negative values', () => {
    const payload: TooltipEntry[] = [
      {
        dataKey: 'test-metric',
        value: -50,
        color: '#000000',
        payload: { timestamp: 1640995200000, fullTime: '2022-01-01 12:00:00' },
      },
    ]

    const { getByText } = render(<Tooltip active={true} unit="mCPU" payload={payload} customLabel="Test" />)

    expect(getByText('50.00 mCPU')).toBeInTheDocument()
  })

  it('should handle multiple other entries', () => {
    const payload: TooltipEntry[] = [
      {
        dataKey: 'metric1',
        value: 10,
        color: '#111111',
        payload: { timestamp: 1640995200000, fullTime: '2022-01-01 12:00:00' },
      },
      {
        dataKey: 'metric2',
        value: 20,
        color: '#222222',
        payload: { timestamp: 1640995200000, fullTime: '2022-01-01 12:00:00' },
      },
    ]

    const { getByText } = render(<Tooltip active={true} unit="mCPU" payload={payload} customLabel="Multiple Metrics" />)

    expect(getByText('metric1')).toBeInTheDocument()
    expect(getByText('metric2')).toBeInTheDocument()
    expect(getByText('10.00 mCPU')).toBeInTheDocument()
    expect(getByText('20.00 mCPU')).toBeInTheDocument()
  })
})
