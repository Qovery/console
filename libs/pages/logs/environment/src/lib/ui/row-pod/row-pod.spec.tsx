import { renderWithProviders } from '@qovery/shared/util-tests'
import RowPod, { type RowPodProps } from './row-pod'

jest.mock('date-fns-tz', () => ({
  format: jest.fn(() => '20 Sept, 19:44:44:44'),
  utcToZonedTime: jest.fn(),
}))

describe('RowPod', () => {
  const props: RowPodProps = {
    index: 1,
    data: {
      created_at: 1667834316521,
      message: 'message',
      pod_name: 'app-z9d11ee4f-7d754477b6-k9sl7',
      version: '53deb16f853aef759b8be84fbeec96e9727',
    },
    filter: [],
    podNameToColor: new Map([['app-z9d11ee4f-7d754477b6-k9sl7', 'rgb(153, 128, 250)']]),
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<RowPod {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should match snapshot', () => {
    const { container } = renderWithProviders(<RowPod {...props} />)
    expect(container).toMatchSnapshot()
  })
})
