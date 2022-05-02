import { GlobalDeploymentStatus } from 'qovery-typescript-axios'
import { screen, render } from '__tests__/utils/setup-jest'

import StatusLabel, { StatusLabelProps } from './status-label'

describe('StatusLabel', () => {
  let props: StatusLabelProps

  beforeEach(() => {
    props = {
      status: GlobalDeploymentStatus.DEPLOYED,
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<StatusLabel {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have an error icon', () => {
    props.status = GlobalDeploymentStatus.BUILD_ERROR

    render(<StatusLabel {...props} />)

    const status = screen.queryByTestId('status-label')

    expect(status?.querySelector('svg')).toHaveAttribute('name', 'ERROR')
  })
})
