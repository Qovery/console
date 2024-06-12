import { type Organization, type SignUp } from 'qovery-typescript-axios'
import { organizationFactoryMock, userSignUpFactoryMock } from '@qovery/shared/factories'
import { LOGOUT_URL, ORGANIZATION_URL } from '@qovery/shared/routes'
import { sortByKey } from '@qovery/shared/util-js'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import MenuAccount, { type MenuAccountProps } from './menu-account'

const mockNavigate = jest.fn()
const mockOrganizations: Organization[] = organizationFactoryMock(2)
const mockUser: SignUp = userSignUpFactoryMock()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

describe('MenuAccount', () => {
  const props: MenuAccountProps = {
    organizations: mockOrganizations,
    currentOrganization: mockOrganizations[0],
    user: mockUser,
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<MenuAccount {...props} />)

    expect(baseElement).toBeTruthy()
  })

  it('should have a active organization on the menu', async () => {
    const { userEvent } = renderWithProviders(<MenuAccount {...props} />)
    await userEvent.click(screen.getByTestId('btn-menu-account'))

    const item = screen.getByTestId('content-0')

    expect(item).toHaveTextContent(props.currentOrganization.name)
  })

  it('should have navigate to organization', async () => {
    const { userEvent } = renderWithProviders(<MenuAccount {...props} />)
    await userEvent.click(screen.getByTestId('btn-menu-account'))

    const items = screen.getAllByTestId('menuItem')

    await userEvent.click(items[1])

    const sortedOrganizations = sortByKey(mockOrganizations)

    expect(items[1]?.textContent).toBe(sortedOrganizations[1].name)
    expect(mockNavigate).toHaveBeenCalledWith(ORGANIZATION_URL(sortedOrganizations[1].id))
  })

  it('should have navigate to logout', async () => {
    const { userEvent } = renderWithProviders(<MenuAccount {...props} />)
    await userEvent.click(screen.getByTestId('btn-menu-account'))

    const items = screen.getAllByTestId('menuItem')

    // 3 is menu for logout
    await userEvent.click(items[3])

    expect(mockNavigate).toHaveBeenCalledWith(LOGOUT_URL)
  })
})
