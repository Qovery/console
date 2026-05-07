import type { ReactNode } from 'react'
import { fireEvent } from '@testing-library/react'
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

  it('should render the base services and blueprints sections', () => {
    renderWithProviders(
      <ServiceNew organizationId="org-1" projectId="project-1" environmentId="env-1" availableTemplates={[]} />
    )

    expect(screen.getByRole('heading', { name: 'Base services' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Blueprints' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search blueprints...')).toBeInTheDocument()
  })

  it('should expose core service create links', () => {
    const { container } = renderWithProviders(
      <ServiceNew organizationId="org-1" projectId="project-1" environmentId="env-1" availableTemplates={[]} />
    )

    expect(
      container.querySelector('a[href="/organization/org-1/project/project-1/environment/env-1/service/create/application"]')
    ).toBeInTheDocument()
    expect(
      container.querySelector('a[href="/organization/org-1/project/project-1/environment/env-1/service/create/database"]')
    ).toBeInTheDocument()
    expect(
      container.querySelector('a[href="/organization/org-1/project/project-1/environment/env-1/service/create/helm"]')
    ).toBeInTheDocument()
  })

  it('should filter blueprints using the search field', () => {
    renderWithProviders(
      <ServiceNew organizationId="org-1" projectId="project-1" environmentId="env-1" availableTemplates={[]} />
    )

    fireEvent.change(screen.getByPlaceholderText('Search blueprints...'), { target: { value: 'does-not-exist' } })

    expect(screen.getByText('No blueprints found')).toBeInTheDocument()
  })
})
