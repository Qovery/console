import { StateEnum } from 'qovery-typescript-axios'
import { screen, render } from '__tests__/utils/setup-jest'

import StatusChip, { StatusChipProps } from './status-chip'

describe('StatusChip', () => {
  let props: StatusChipProps

  beforeEach(() => {
    props = {
      status: StateEnum.DEPLOYED,
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<StatusChip {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have an error icon', () => {
    props.status = StateEnum.STOP_ERROR

    render(<StatusChip {...props} />)

    const status = screen.queryByTestId('status-chip')

    expect(status?.querySelector('svg')).toHaveAttribute('name', 'ERROR')
  })
})
