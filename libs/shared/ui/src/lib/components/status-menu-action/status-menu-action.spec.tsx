import { Button } from '@console/shared/ui'
import { render } from '__tests__/utils/setup-jest'
import { GlobalDeploymentStatus } from 'qovery-typescript-axios'
import { StatusMenuAction, StatusMenuActionProps } from './status-menu-action'

let props: StatusMenuActionProps

beforeEach(() => {
  props = {
    action: {
      name: 'my-name',
      status: GlobalDeploymentStatus.DEPLOYED,
    },
    trigger: <Button>Button action</Button>,
  }
})

describe('StatusMenuAction', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<StatusMenuAction {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
