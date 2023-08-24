import { render } from '__tests__/utils/setup-jest'
import { applicationFactoryMock } from '@qovery/shared/factories'
import SidebarPipeline, { type SidebarPipelineProps } from './sidebar-pipeline'

describe('SidebarPipeline', () => {
  const props: SidebarPipelineProps = {
    services: applicationFactoryMock(2),
    serviceId: '1',
  }

  it('should render successfully', () => {
    const { baseElement } = render(<SidebarPipeline {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
