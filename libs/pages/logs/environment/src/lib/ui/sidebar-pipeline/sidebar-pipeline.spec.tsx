import { applicationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import SidebarPipeline, { type SidebarPipelineProps } from './sidebar-pipeline'

describe('SidebarPipeline', () => {
  const props: SidebarPipelineProps = {
    services: applicationFactoryMock(2),
    serviceId: '1',
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<SidebarPipeline {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have loader when statusStages is undefined', () => {
    renderWithProviders(<SidebarPipeline {...props} />)
    screen.getByTestId('spinner')
  })
})
