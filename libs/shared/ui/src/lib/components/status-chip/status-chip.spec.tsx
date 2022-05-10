import { GlobalDeploymentStatus } from 'qovery-typescript-axios'
import { screen, render } from '__tests__/utils/setup-jest'

import StatusChip, { StatusChipProps } from './status-chip'

describe('StatusChip', () => {
  let props: StatusChipProps

  beforeEach(() => {
    props = {
      status: GlobalDeploymentStatus.DEPLOYED,
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<StatusChip {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have an error icon', () => {
    props.status = GlobalDeploymentStatus.STOP_ERROR

    render(<StatusChip {...props} />)

    const status = screen.queryByTestId('status-chip')

    expect(status?.querySelector('svg')).toHaveAttribute('name', 'ERROR')
  })
})
