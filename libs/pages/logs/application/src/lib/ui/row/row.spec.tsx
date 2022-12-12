import { render, screen } from '__tests__/utils/setup-jest'
import { dateFullFormat } from '@qovery/shared/utils'
import Row, { RowProps, formatVersion, getColorByPod } from './row'

jest.mock('date-fns-tz', () => ({
  format: jest.fn(() => '20 Sept, 19:44:44:44'),
  utcToZonedTime: jest.fn(),
}))

describe('Row', () => {
  const props: RowProps = {
    data: {
      id: '1',
      created_at: '1667834316521',
      message: 'message',
      pod_name: 'app-z9d11ee4f-7d754477b6-k9sl7',
      version: '53deb16f853aef759b8be84fbeec96e9727',
    },
  }

  const date = dateFullFormat(props.data.created_at)

  it('should render successfully', () => {
    const { baseElement } = render(<Row {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have function to render colors', () => {
    expect(getColorByPod(props.data.pod_name)).toBe('#9980FA')
  })

  it('should have cell with the pod name', () => {
    render(<Row {...props} />)

    const podName = screen.getByTestId('cell-pod-name')

    expect(podName).toHaveStyle({
      color: getColorByPod(props.data.pod_name),
    })

    expect(podName.textContent).toBe('app-z9d11e...77b6-k9sl7')
  })

  it('should have cell render an created pod', () => {
    render(<Row {...props} />)
    expect(date).toBe('20 Sept, 19:44:44:44')
  })

  it('should have cell message', () => {
    render(<Row {...props} />)

    const cellMsg = screen.getByTestId('cell-msg')
    expect(cellMsg?.textContent).toBe(props.data.message)
  })

  it('should have cell version', () => {
    render(<Row {...props} />)

    const cellVersion = screen.getByTestId('cell-version')
    expect(cellVersion?.textContent).toBe('53d...727')
  })

  it('should have function to format version', () => {
    const { baseElement } = render(<div>{formatVersion('53deb16f853aef759b8be84fbeec96e9727')}</div>)

    expect(baseElement.textContent).toBe('53d...727')
    expect(formatVersion('53deb')).toBe('53deb')
  })
})
