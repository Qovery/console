import { render } from '@testing-library/react'
import { availableRolesMock, customRolesMock } from '@qovery/shared/factories'
import PageOrganizationRoles, { PageOrganizationRolesProps, isDefaultRole, rolesSort } from './page-organization-roles'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
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
    const { baseElement } = render(<PageOrganizationRoles {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have loading screen', () => {
    props.roles = []
    props.loading = true

    const { getByTestId } = render(<PageOrganizationRoles {...props} />)

    expect(getByTestId('roles-loader'))
  })

  it('should have list of roles', () => {
    props.roles = [customRoles[0]]
    props.loading = false

    const { getByTestId } = render(<PageOrganizationRoles {...props} />)

    expect(getByTestId(`role-${customRoles[0].id}`))
    expect(getByTestId(`role-${customRoles[0].id}`).textContent).toBe(`${customRoles[0].name}Custom Role`)
    expect(getByTestId(`role-actions-${customRoles[0].id}`))
  })

  it('should have list of custom roles', () => {
    props.roles = [availableRolesMock[0]]
    props.loading = false

    const { getByTestId } = render(<PageOrganizationRoles {...props} />)

    expect(getByTestId(`role-${availableRolesMock[0].id}`))
    expect(getByTestId(`role-${availableRolesMock[0].id}`).textContent).toBe(`${availableRolesMock[0].name}Basic Role`)
    expect(getByTestId(`role-doc-${customRoles[0].id}`))
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
