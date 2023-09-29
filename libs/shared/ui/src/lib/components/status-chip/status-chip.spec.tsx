import { StateEnum } from 'qovery-typescript-axios'
import { renderWithProviders } from '@qovery/shared/util-tests'
import StatusChip, { type StatusChipProps } from './status-chip'

describe('StatusChip', () => {
  const props: StatusChipProps = {
    status: StateEnum.DEPLOYED,
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<StatusChip {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should match snapshot for READY status', () => {
    const { container } = renderWithProviders(<StatusChip status="READY" />)
    expect(container).toMatchSnapshot()
  })

  it('should match snapshot for DEPLOYED status', () => {
    const { container } = renderWithProviders(<StatusChip status="DEPLOYED" />)
    expect(container).toMatchSnapshot()
  })

  it('should match snapshot for QUEUED status', () => {
    const { container } = renderWithProviders(<StatusChip status="QUEUED" />)
    expect(container).toMatchSnapshot()
  })

  it('should match snapshot for WARNING status', () => {
    const { container } = renderWithProviders(<StatusChip status="WARNING" />)
    expect(container).toMatchSnapshot()
  })

  it('should match snapshot for ERROR status', () => {
    const { container } = renderWithProviders(<StatusChip status="ERROR" />)
    expect(container).toMatchSnapshot()
  })

  it('should match snapshot for UNKNOW status', () => {
    const { container } = renderWithProviders(<StatusChip status={undefined} />)
    expect(container).toMatchSnapshot()
  })
})
