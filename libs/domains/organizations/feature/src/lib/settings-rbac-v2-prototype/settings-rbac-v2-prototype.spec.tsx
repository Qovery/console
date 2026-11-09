import { type ReactNode } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { RBAC_PROTOTYPE_MODE_KEY, RbacPrototypeProvider } from './rbac-v2-prototype-context'
import { RbacV2ModeSwitch, type RbacV2PageId, SettingsRbacV2Page } from './settings-rbac-v2-prototype'
import { SettingsLabelsV2 } from './tabs/labels-page'

jest.mock('../settings-roles/settings-roles', () => ({
  SettingsRoles: () => <div>Roles page from production</div>,
}))

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'org-1' }),
  Link: ({ children, ...props }: { children: ReactNode }) => <a {...props}>{children}</a>,
}))

const renderPage = (pageId: RbacV2PageId) =>
  renderWithProviders(
    <RbacPrototypeProvider>
      <SettingsRbacV2Page pageId={pageId} />
      <RbacV2ModeSwitch />
    </RbacPrototypeProvider>
  )

// The prototype renders large interactive pages: leave room on slow CI runners
jest.setTimeout(30_000)

describe('SettingsRbacV2Page', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should show the members page in MVP mode by default', () => {
    renderPage('members')

    expect(screen.getAllByText(/Members can now hold several roles/).length).toBeGreaterThan(0)
    expect(screen.getByText('Vincy Park')).toBeInTheDocument()
  })

  it('should show a target page as not available yet, then switch to the target and remember it', async () => {
    const { userEvent } = renderPage('delegations')

    expect(screen.getByText('Delegations comes with Target')).toBeInTheDocument()

    // The segmented control renders each label twice (active and inactive layers)
    await userEvent.click(screen.getByRole('radio', { name: /^Target/ }))

    expect(screen.getByText('On-call managers')).toBeInTheDocument()
    expect(localStorage.getItem(RBAC_PROTOTYPE_MODE_KEY)).toBe('target')
  })

  it('should edit roles as permissions in Next', async () => {
    localStorage.setItem(RBAC_PROTOTYPE_MODE_KEY, JSON.stringify('r1'))
    const { userEvent } = renderPage('roles')

    await userEvent.click(screen.getByRole('button', { name: 'Edit Backend Developer' }))

    expect(screen.getByText('Resource permissions')).toBeInTheDocument()
  })

  it('should show the 403 demo with the missing capability from Next', () => {
    localStorage.setItem(RBAC_PROTOTYPE_MODE_KEY, JSON.stringify('r1'))
    renderPage('demo-403-members')

    expect(screen.getByText("You don't have permission to view members")).toBeInTheDocument()
    expect(screen.getByText('org.members')).toBeInTheDocument()
    expect(screen.queryByText('Request access')).not.toBeInTheDocument()
  })

  it('should open why a member has access in the target solution', async () => {
    localStorage.setItem(RBAC_PROTOTYPE_MODE_KEY, JSON.stringify('target'))
    const { userEvent } = renderPage('members')

    await userEvent.click(screen.getByText('Andy Moreau'))

    expect(await screen.findByText('Why does Andy Moreau have access?')).toBeInTheDocument()
  })

  it('should list the four built-in roles as read-only in Next', () => {
    localStorage.setItem(RBAC_PROTOTYPE_MODE_KEY, JSON.stringify('r1'))
    renderPage('roles')

    for (const name of ['Admin', 'DevOps', 'Billing Manager', 'Viewer']) {
      expect(screen.getByRole('button', { name: `${name} cannot be edited` })).toBeDisabled()
      expect(screen.queryByRole('button', { name: `Edit ${name}` })).not.toBeInTheDocument()
    }
  })

  it('should start in the MVP without IdP, and connect one from the nudge', async () => {
    const { userEvent } = renderPage('members')

    expect(screen.queryByText('Groups')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove Admin' })).toBeInTheDocument()
    expect(screen.getByText('Manage access from your identity provider')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Connect an IdP' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Connect Okta' }))

    // Groups come with the target solution: in the MVP, IdP roles show up without a Groups column
    expect(screen.queryByText('Groups')).not.toBeInTheDocument()
    expect(screen.getByText('From the IdP mapping')).toBeInTheDocument()
    expect(screen.queryByText('Manage access from your identity provider')).not.toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /^With IdP/ })).toHaveAttribute('data-state', 'on')
  })

  it("should not allow removing a member's only role", () => {
    renderPage('members')

    expect(screen.getByRole('button', { name: 'Remove Admin' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Remove Prod Operator Primary' })).toBeEnabled()
  })

  it('should tell built-in and custom roles apart when assigning a role', async () => {
    const { userEvent } = renderPage('members')

    await userEvent.click(screen.getAllByRole('button', { name: 'Role' })[0])
    await userEvent.click(await screen.findByLabelText('Role'))

    expect(await screen.findByText('Built-in · Read-only access to every resource.')).toBeInTheDocument()
    expect(screen.getByText('Custom · Base role for every backend engineer.')).toBeInTheDocument()
  })

  it('should set up the identity provider from the console in the target solution', async () => {
    localStorage.setItem(RBAC_PROTOTYPE_MODE_KEY, JSON.stringify('target'))
    const { userEvent } = renderPage('identity-provider')

    expect(screen.getByText('Connect your identity provider')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Enable SSO' })).toBeDisabled()

    await userEvent.click(screen.getByRole('button', { name: 'Test sign-in' }))
    await userEvent.click(screen.getByRole('button', { name: 'Enable SSO' }))

    expect(screen.getByText('Connected')).toBeInTheDocument()
    expect(screen.getByText('Synced groups')).toBeInTheDocument()
  })

  it('should list the guardrails, with resource limits defined as rules', async () => {
    localStorage.setItem(RBAC_PROTOTYPE_MODE_KEY, JSON.stringify('target'))
    const { userEvent } = renderPage('guardrails')

    expect(screen.queryByRole('button', { name: /New guardrail/ })).not.toBeInTheDocument()
    expect(screen.getByText('Resource limits per service')).toBeInTheDocument()
    expect(screen.getByText('Otherwise, for every other service')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Remove rule' })).toHaveLength(2)

    await userEvent.click(screen.getByRole('button', { name: 'Add rule' }))

    expect(screen.getAllByRole('button', { name: 'Remove rule' })).toHaveLength(3)
  })

  it("should keep today's roles page in the MVP", () => {
    renderPage('roles')

    expect(screen.getByText('Roles page from production')).toBeInTheDocument()
    expect(screen.queryByText('Built-in roles')).not.toBeInTheDocument()
  })

  it('should show groups in the target solution', () => {
    localStorage.setItem(RBAC_PROTOTYPE_MODE_KEY, JSON.stringify('target'))
    renderPage('groups')

    expect(screen.getByText('On-call rotation')).toBeInTheDocument()
    expect(screen.queryByText(/comes with Target/)).not.toBeInTheDocument()
  })

  it('should tell which release brings a page that is not available yet', () => {
    localStorage.setItem(RBAC_PROTOTYPE_MODE_KEY, JSON.stringify('r1'))
    renderPage('groups')

    expect(screen.getByText('Groups comes with Target')).toBeInTheDocument()
  })

  it('should set organization settings once per role, apart from resource permissions', async () => {
    localStorage.setItem(RBAC_PROTOTYPE_MODE_KEY, JSON.stringify('r1'))
    const { userEvent } = renderPage('roles')

    await userEvent.click(screen.getByRole('button', { name: 'Edit Backend Developer' }))

    expect(screen.getByText('Organization settings')).toBeInTheDocument()
    expect(screen.getByText('Manage labels', { selector: 'label' })).toBeInTheDocument()
    expect(screen.getByText('Manage annotations', { selector: 'label' })).toBeInTheDocument()
    expect(screen.getByText('Danger zone')).toBeInTheDocument()
    // Groups and SSO come with the target solution
    expect(screen.queryByText('Manage groups')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Select all' }))
    expect(screen.getByText(/selected$/)).toHaveTextContent(/^(\d+) of \1 selected$/)
  })

  it('should merge labels and tags, with their propagation and the roles using each label', async () => {
    const { userEvent } = renderWithProviders(
      <RbacPrototypeProvider>
        <SettingsLabelsV2 />
      </RbacPrototypeProvider>
    )

    expect(screen.getByText('Labels and tags are now one concept')).toBeInTheDocument()
    expect(screen.getAllByText('Kubernetes').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Cloud provider tag').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Qovery only').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Show roles using team' })).toBeDisabled()

    await userEvent.click(screen.getByRole('button', { name: 'Show roles using env_type' }))

    expect(await screen.findByText('Backend Developer')).toBeInTheDocument()
  })

  it('should show how a v1 role was migrated, rule by rule', async () => {
    localStorage.setItem(RBAC_PROTOTYPE_MODE_KEY, JSON.stringify('r1'))
    const { userEvent } = renderPage('roles')

    await userEvent.click(screen.getByRole('button', { name: 'Edit Developer' }))

    expect(screen.getByText('Migrated from v1')).toBeInTheDocument()
    expect(screen.getByText('Project Core app · Development · Deploy + Shell')).toBeInTheDocument()
    expect(screen.getByText('Nothing to migrate: no access')).toBeInTheDocument()
    expect(screen.getByText('No permission needed: implied by the environment permissions')).toBeInTheDocument()
    // The matches open in a modal, with the project and cluster shown as context, without a permission on them
    await userEvent.click(screen.getAllByRole('button', { name: 'View' })[3])
    expect(await screen.findByText('Also visible as context')).toBeInTheDocument()
  })

  it('should target clusters, projects or environments in Next', async () => {
    localStorage.setItem(RBAC_PROTOTYPE_MODE_KEY, JSON.stringify('r1'))
    const { userEvent } = renderPage('roles')

    // The list stays simple: the permissions are in the editor
    expect(screen.queryByText('Environments & services')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Edit Ares (HIPAA)' }))

    expect(screen.getAllByText('Environments & services').length).toBeGreaterThan(0)
    expect(screen.getByText('Matches 1 cluster today', { exact: false })).toBeInTheDocument()
  })

  it('should build the filters as typed rows, added from an Add filter menu', async () => {
    localStorage.setItem(RBAC_PROTOTYPE_MODE_KEY, JSON.stringify('r1'))
    const { userEvent } = renderPage('roles')

    await userEvent.click(screen.getByRole('button', { name: 'Edit Developer' }))

    // Each environment permission has an "In project" row and a "With label" row
    expect(screen.getAllByText('In project').length).toBeGreaterThan(0)
    expect(screen.getAllByText('With label').length).toBeGreaterThan(0)
    expect(screen.getAllByText('in project').length).toBeGreaterThan(0)

    const removeLabelFilters = screen.getAllByRole('button', { name: 'Remove filter With label' })
    await userEvent.click(removeLabelFilters[0])
    expect(screen.getAllByRole('button', { name: 'Remove filter With label' })).toHaveLength(
      removeLabelFilters.length - 1
    )

    expect(screen.getAllByRole('button', { name: /Add filter/ }).length).toBeGreaterThan(0)
  })
})
