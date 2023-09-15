import { StateEnum } from 'qovery-typescript-axios'
import { renderWithProviders } from '@qovery/shared/util-tests'
import StatusLabel, { type StatusLabelProps } from './status-label'

describe('StatusLabel', () => {
  const props: StatusLabelProps = {
    status: StateEnum.DEPLOYED,
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<StatusLabel {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should match snapshot for DEPLOYED status', () => {
    const { container } = renderWithProviders(<StatusLabel status={StateEnum.DEPLOYED} />)
    expect(container).toMatchSnapshot()
  })

  it('should match snapshot for QUEUED status', () => {
    const { container } = renderWithProviders(<StatusLabel status={StateEnum.QUEUED} />)
    expect(container).toMatchSnapshot()
  })

  it('should match snapshot for BUILD_ERROR status', () => {
    const { container } = renderWithProviders(<StatusLabel status={StateEnum.BUILD_ERROR} />)
    expect(container).toMatchSnapshot()
  })

  it('should match snapshot for UNDEFINED status', () => {
    const { container } = renderWithProviders(<StatusLabel status={undefined} />)
    expect(container).toMatchSnapshot()
  })
})
