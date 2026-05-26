import { type ArgocdAppResponse, type Environment } from 'qovery-typescript-axios'
import type { ForwardedRef, ReactNode } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ArgoCdServiceList } from './argocd-service-list'

const mockNavigate = jest.fn()
const mockUseArgoCdServices = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useNavigate: () => mockNavigate,
}))

jest.mock('../hooks/use-argocd-services/use-argocd-services', () => ({
  useArgoCdServices: (params: unknown) => mockUseArgoCdServices(params),
}))

jest.mock('@qovery/shared/ui', () => {
  const React = jest.requireActual('react')
  const actual = jest.requireActual('@qovery/shared/ui')

  return {
    ...actual,
    Link: React.forwardRef(
      (
        {
          children,
          as,
          color,
          iconOnly,
          params,
          size,
          to,
          variant,
          ...props
        }: {
          children?: ReactNode
          as?: string
          color?: string
          iconOnly?: boolean
          params?: Record<string, string>
          size?: string
          to?: string
          variant?: string
          [key: string]: unknown
        },
        ref: ForwardedRef<HTMLAnchorElement>
      ) => {
        const href = Object.entries(params ?? {}).reduce(
          (path, [key, value]) => path.replace(`$${key}`, value),
          to ?? ''
        )

        return (
          <a {...props} href={href} ref={ref}>
            {children}
          </a>
        )
      }
    ),
  }
})

const environment = {
  id: 'env-1',
  name: 'Environment',
  organization: {
    id: 'org-1',
  },
  project: {
    id: 'project-1',
  },
} as Environment

const services = [
  {
    id: 'service-1',
    name: 'Argo service',
    git_repository: {
      provider: 'GITHUB',
      owner: 'qovery',
      name: 'qovery/service',
      url: 'https://github.com/qovery/service',
      branch: 'env/refs/merge',
    },
    manifest_revision: '313a525a4ad53b37f0b33f81282c52fef5f8e7d8',
    last_synced_at: '2026-05-05T10:00:00.000Z',
  },
] as ArgocdAppResponse[]

describe('ArgoCdServiceList', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
    mockUseArgoCdServices.mockReturnValue({ data: services })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should navigate to the service overview when clicking the row', async () => {
    const { userEvent } = renderWithProviders(<ArgoCdServiceList environment={environment} />)

    await userEvent.click(screen.getByRole('row', { name: /argo service/i }))

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/overview',
      params: {
        organizationId: 'org-1',
        projectId: 'project-1',
        environmentId: 'env-1',
        serviceId: 'service-1',
      },
    })
  })

  it('should not navigate to the service overview when clicking the repository link', async () => {
    const { userEvent } = renderWithProviders(<ArgoCdServiceList environment={environment} />)

    await userEvent.click(screen.getByRole('link', { name: /qovery\/service/i }))

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('should not navigate to the service overview when clicking the branch link', async () => {
    const { userEvent } = renderWithProviders(<ArgoCdServiceList environment={environment} />)

    await userEvent.click(screen.getByRole('link', { name: /env\/refs\/merge/i }))

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('should render git target version information', () => {
    renderWithProviders(<ArgoCdServiceList environment={environment} />)

    expect(screen.getByText('Target version')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /qovery\/service/i })).toHaveAttribute(
      'href',
      'https://github.com/qovery/service'
    )
    expect(screen.getByRole('link', { name: /env\/refs\/merge/i })).toHaveAttribute(
      'href',
      'https://github.com/qovery/service/tree/env/refs/merge/'
    )
    expect(screen.getByRole('button', { name: /313a525/i })).toBeInTheDocument()
  })

  it('should render ArgoCD service actions', async () => {
    const { userEvent } = renderWithProviders(<ArgoCdServiceList environment={environment} />)

    expect(screen.getByText('Actions')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /service logs for argo service/i })).toHaveAttribute(
      'href',
      '/organization/org-1/project/project-1/environment/env-1/service/service-1/service-logs'
    )

    await userEvent.click(screen.getByRole('button', { name: /other actions for argo service/i }))

    expect(screen.getByRole('menuitem', { name: /see manifest/i })).toHaveAttribute(
      'href',
      '/organization/org-1/project/project-1/environment/env-1/service/service-1/manifest'
    )
  })
})
