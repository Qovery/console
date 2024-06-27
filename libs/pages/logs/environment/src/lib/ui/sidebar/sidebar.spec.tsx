import { applicationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import Sidebar, { type SidebarProps } from './sidebar'

describe('Sidebar', () => {
  const props: SidebarProps = {
    services: applicationFactoryMock(2),
    serviceId: '1',
    versionId: '2',
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<Sidebar {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should toggles sidebar visibility when the button is clicked', async () => {
    renderWithProviders(<Sidebar {...props} />)
    const sidebar = screen.getByTestId('sidebar')
    const toggleButton = screen.getByTestId('sidebar-resize-button')

    toggleButton.click()

    expect(toggleButton).toHaveClass('border-l')
    expect(sidebar).toHaveClass('w-full')
  })
})
