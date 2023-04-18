import { render } from '__tests__/utils/setup-jest'
import { applicationDeploymentsFactoryMock } from '@qovery/shared/factories'
import SidebarStatus, { SidebarStatusProps } from './sidebar-status'

describe('SidebarStatus', () => {
  const props: SidebarStatusProps = {
    environmentDeploymentHistory: applicationDeploymentsFactoryMock(1)[0],
  }

  it('should render successfully', () => {
    const { baseElement } = render(<SidebarStatus {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
