import type { ReactNode } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ServiceNew } from './service-new'

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
  useSupportChat: () => ({ showPylonForm: jest.fn() }),
}))

describe('ServiceNew', () => {
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
    expect(screen.getByRole('heading', { name: 'Data & Storage' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Back-end' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Front-end' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'IAC' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'More template' })).toBeInTheDocument()
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

    expect(
      container.querySelector(
        'a[href="/organization/org-1/project/project-1/environment/env-1/service/create/database?template=postgresql&option=container"]'
      )
    ).toBeInTheDocument()
    expect(
      container.querySelector(
        'a[href="/organization/org-1/project/project-1/environment/env-1/service/create/database?template=postgresql&option=managed"]'
      )
    ).toBeInTheDocument()
  })
})
