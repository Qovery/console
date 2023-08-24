import { render, screen } from '__tests__/utils/setup-jest'
import { StateEnum } from 'qovery-typescript-axios'
import StatusLabel, { type StatusLabelProps } from './status-label'

describe('StatusLabel', () => {
  let props: StatusLabelProps

  beforeEach(() => {
    props = {
      status: StateEnum.DEPLOYED,
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<StatusLabel {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have an error icon', () => {
    props.status = StateEnum.DEPLOYMENT_ERROR

    render(<StatusLabel {...props} />)

    const status = screen.queryByTestId('status-label')

    expect(status?.querySelector('svg')).toHaveAttribute('name', 'ERROR')
  })
})
