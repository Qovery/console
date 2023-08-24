import { render, screen } from '__tests__/utils/setup-jest'
import { dateFullFormat } from '@qovery/shared/utils'
import RowPod, { type RowPodProps, formatVersion, getColorByPod } from './row-pod'

jest.mock('date-fns-tz', () => ({
  format: jest.fn(() => '20 Sept, 19:44:44:44'),
  utcToZonedTime: jest.fn(),
}))

describe('RowPod', () => {
  const props: RowPodProps = {
    index: 1,
    data: {
      id: '1',
      created_at: '1667834316521',
      message: 'message',
      pod_name: 'app-z9d11ee4f-7d754477b6-k9sl7',
      version: '53deb16f853aef759b8be84fbeec96e9727',
    },
    filter: [],
  }

  const date = dateFullFormat(props.data.created_at)

  it('should render successfully', () => {
    const { baseElement } = render(<RowPod {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have function to render colors', () => {
    expect(getColorByPod(props.data.pod_name)).toBe('#9980FA')
  })

  it('should have cell with the pod name', () => {
    render(<RowPod {...props} />)

    const podName = screen.getByTestId('cell-pod-name')

    expect(podName).toHaveStyle({
      color: getColorByPod(props.data.pod_name),
    })

    expect(podName.textContent).toBe('app-z9d11e...77b6-k9sl7')
  })

  it('should have cell render an created pod', () => {
    render(<RowPod {...props} />)
    expect(date).toBe('20 Sept, 19:44:44:44')
  })

  it('should have cell message', () => {
    render(<RowPod {...props} />)

    const cellMsg = screen.getByTestId('cell-msg')
    expect(cellMsg?.textContent).toBe(props.data.message)
  })

  it('should have cell message with ANSI colors and links', () => {
    props.data = {
      id: '1',
      created_at: '1667834316521',
      message: '\x1b[F\x1b[31;1mmy message https://qovery.com\x1b[m\x1b[E',
      pod_name: 'app-z9d11ee4f-7d754477b6-k9sl7',
      version: '53deb16f853aef759b8be84fbeec96e9727',
    }

    render(<RowPod {...props} />)

    const cellMsg = screen.getByTestId('cell-msg')

    expect(cellMsg?.textContent).toBe('my message https://qovery.com')
    expect(cellMsg.innerHTML.toString()).toContain('style="color: rgb(187, 0, 0);"')
    expect(cellMsg.innerHTML.toString()).toContain(
      '<a href="https://qovery.com" target="_blank">https://qovery.com</a>'
    )
  })

  it('should have cell version', () => {
    render(<RowPod {...props} />)

    const cellVersion = screen.getByTestId('cell-version')
    expect(cellVersion?.textContent).toBe('53deb16')
  })

  it('should have function to format version', () => {
    const { baseElement } = render(<div>{formatVersion('53deb16f853aef759b8be84fbeec96e9727')}</div>)

    expect(baseElement.textContent).toBe('53deb16')
    expect(formatVersion('53deb')).toBe('53deb')
  })
})
