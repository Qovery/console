import { render } from '__tests__/utils/setup-jest'
import { applicationFactoryMock } from '@qovery/shared/factories'
import Sidebar, { SidebarProps } from './sidebar'

describe('Sidebar', () => {
  const props: SidebarProps = {
    services: applicationFactoryMock(2),
    serviceId: '1',
  }

  it('should render successfully', () => {
    const { baseElement } = render(<Sidebar {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should toggles sidebar visibility when the button is clicked', () => {
    const { getByTestId } = render(<Sidebar {...props} />)
    const sidebar = getByTestId('sidebar')
    const toggleButton = getByTestId('sidebar-resize-button')

    toggleButton.click()

    expect(toggleButton).toHaveClass('border-l')
    expect(sidebar).toHaveClass('w-full p-3')
  })
})
