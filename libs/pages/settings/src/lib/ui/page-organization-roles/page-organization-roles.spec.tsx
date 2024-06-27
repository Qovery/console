import { availableRolesMock, customRolesMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PageOrganizationRoles, {
  type PageOrganizationRolesProps,
  isDefaultRole,
  rolesSort,
} from './page-organization-roles'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}))

const customRoles = customRolesMock(3)

describe('PageOrganizationRoles', () => {
  const props: PageOrganizationRolesProps = {
    onAddRole: jest.fn(),
    onDeleteRole: jest.fn(),
    loading: false,
    roles: customRoles,
  }
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageOrganizationRoles {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have loading screen', () => {
    props.roles = []
    props.loading = true

    renderWithProviders(<PageOrganizationRoles {...props} />)

    screen.getByTestId('roles-loader')
  })

  it('should have list of roles', () => {
    props.roles = [customRoles[0]]
    props.loading = false

    renderWithProviders(<PageOrganizationRoles {...props} />)

    screen.getByTestId(`role-${customRoles[0].id}`)
    expect(screen.getByTestId(`role-${customRoles[0].id}`)).toHaveTextContent(`${customRoles[0].name}Custom Role`)
    screen.getByTestId(`role-actions-${customRoles[0].id}`)
  })

  it('should have list of custom roles', () => {
    props.roles = [availableRolesMock[0]]
    props.loading = false

    renderWithProviders(<PageOrganizationRoles {...props} />)

    screen.getByTestId(`role-${availableRolesMock[0].id}`)
    expect(screen.getByTestId(`role-${availableRolesMock[0].id}`)).toHaveTextContent(
      `${availableRolesMock[0].name}Basic Role`
    )
    screen.getByTestId(`role-doc-${customRoles[0].id}`)
  })

  it('should have function to detect if is default role', () => {
    expect(isDefaultRole(availableRolesMock[0].name)).toBe(true)
    expect(isDefaultRole(customRoles[0].name)).toBe(false)
  })

  it('should have function to sort default roles and custom roles', () => {
    expect(rolesSort([customRoles[0], availableRolesMock[0]]).map((role) => role.name)).toStrictEqual([
      availableRolesMock[0].name,
      customRoles[0].name,
    ])
  })
})
