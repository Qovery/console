import type { ReactNode } from 'react'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { ServiceNew } from './service-new'

const mockShowPylonForm = jest.fn()
const mockShowChat = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
}))

jest.mock('posthog-js', () => ({
  capture: jest.fn(),
}))

jest.mock('posthog-js/react', () => ({
  useFeatureFlagEnabled: jest.fn(() => false),
}))

jest.mock('@qovery/shared/ui', () => {
  const actual = jest.requireActual('@qovery/shared/ui')
  return {
    ...actual,
    Link: ({ children, to, ...props }: { children: ReactNode; to?: string }) =>
      typeof to === 'string' ? (
        <a href={to} {...props}>
          {children}
        </a>
      ) : (
        <span {...props}>{children}</span>
      ),
  }
})

jest.mock('@qovery/shared/util-hooks', () => ({
  ...jest.requireActual('@qovery/shared/util-hooks'),
  useSupportChat: () => ({ showPylonForm: mockShowPylonForm, showChat: mockShowChat }),
}))

describe('ServiceNew', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <ServiceNew organizationId="org-1" projectId="project-1" environmentId="env-1" availableTemplates={[]} />
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render search input and documentation link', () => {
    renderWithProviders(
      <ServiceNew organizationId="org-1" projectId="project-1" environmentId="env-1" availableTemplates={[]} />
    )
    expect(screen.getByPlaceholderText('Search…')).toBeInTheDocument()
    expect(screen.getByText('See documentation')).toBeInTheDocument()
  })

  it('should render Default Qovery services section with main service types', () => {
    renderWithProviders(
      <ServiceNew organizationId="org-1" projectId="project-1" environmentId="env-1" availableTemplates={[]} />
    )
    expect(screen.getByRole('heading', { name: 'Default Qovery services' })).toBeInTheDocument()
    expect(screen.getByText('Application')).toBeInTheDocument()
    expect(screen.getByText('Database')).toBeInTheDocument()
    expect(screen.getByText('Lifecycle Job')).toBeInTheDocument()
    expect(screen.getByText('Cron Job')).toBeInTheDocument()
    expect(screen.getByText('Helm')).toBeInTheDocument()
    expect(screen.getAllByText('Terraform').length).toBeGreaterThanOrEqual(1)
  })

  it('should render template sections by tag', () => {
    renderWithProviders(
      <ServiceNew organizationId="org-1" projectId="project-1" environmentId="env-1" availableTemplates={[]} />
    )
    expect(screen.getByRole('heading', { name: 'Integrations' })).toBeInTheDocument()
    expect(screen.getByText('Want more integrations?')).toBeInTheDocument()
    expect(screen.getByText('Tell us about which integration you would like to see in the future')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Data & Storage' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Back-end' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Front-end' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'IAC' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'More template' })).toBeInTheDocument()
  })

  it('should link the ArgoCD integration card with the environment cluster context', () => {
    const { container } = renderWithProviders(
      <ServiceNew
        organizationId="org-1"
        projectId="project-1"
        environmentId="env-1"
        clusterId="cluster-1"
        availableTemplates={[]}
      />
    )

    expect(screen.getByText('ArgoCD')).toBeInTheDocument()
    expect(
      container.querySelector('a[href="/organization/org-1/settings/argocd-integration?clusterId=cluster-1"]')
    ).toBeInTheDocument()
  })

  it('should open support chat when clicking on Want more integrations card', async () => {
    const { userEvent } = renderWithProviders(
      <ServiceNew organizationId="org-1" projectId="project-1" environmentId="env-1" availableTemplates={[]} />
    )

    await userEvent.click(screen.getByText('Want more integrations?'))

    expect(mockShowChat).toHaveBeenCalledTimes(1)
  })

  it('should exclude Want more integrations card from search results', async () => {
    const { userEvent } = renderWithProviders(
      <ServiceNew organizationId="org-1" projectId="project-1" environmentId="env-1" availableTemplates={[]} />
    )

    await userEvent.type(screen.getByPlaceholderText('Search…'), 'integrations')

    expect(screen.queryByText('Want more integrations?')).not.toBeInTheDocument()
  })

  it('should link database entries to the database create flow', async () => {
    const { container, userEvent } = renderWithProviders(
      <ServiceNew
        organizationId="org-1"
        projectId="project-1"
        environmentId="env-1"
        cloudProvider="AWS"
        availableTemplates={[]}
      />
    )

    expect(
      container.querySelector(
        'a[href="/organization/org-1/project/project-1/environment/env-1/service/create/database"]'
      )
    ).toBeInTheDocument()

    await userEvent.click(screen.getByText('PostgreSQL'))

    await waitFor(() => {
      expect(
        container.querySelector(
          'a[href="/organization/org-1/project/project-1/environment/env-1/service/create/database?template=postgresql&option=container"]'
        )
      ).toBeInTheDocument()
    })
    await waitFor(() => {
      expect(
        container.querySelector(
          'a[href="/organization/org-1/project/project-1/environment/env-1/service/create/database?template=postgresql&option=managed"]'
        )
      ).toBeInTheDocument()
    })
  })
})
