import { useParams } from '@tanstack/react-router'
import { within } from '@testing-library/react'
import type { BlueprintItem } from 'qovery-typescript-axios'
import type { ReactNode } from 'react'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { BlueprintDetailsPanel } from './blueprint-details-panel'

const mockUseBlueprintCatalogServiceReadme = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: jest.fn(),
}))

jest.mock('@qovery/shared/ui', () => {
  const actual = jest.requireActual('@qovery/shared/ui')
  return {
    ...actual,
    Link: ({ children, to, ...props }: { children: ReactNode; to?: string; [key: string]: unknown }) =>
      typeof to === 'string' ? (
        <a href={to} {...props}>
          {children}
        </a>
      ) : (
        <span {...props}>{children}</span>
      ),
  }
})

jest.mock('../../hooks/use-blueprint-catalog-service-readme/use-blueprint-catalog-service-readme', () => ({
  useBlueprintCatalogServiceReadme: (props: unknown) => mockUseBlueprintCatalogServiceReadme(props),
}))

const blueprint: BlueprintItem = {
  name: 'AWS S3 Bucket',
  kind: 'ServiceBlueprint',
  description: 'Object storage with server-side encryption.',
  icon: 'https://cdn.qovery.com/icons/s3.svg',
  categories: ['storage'],
  provider: 'aws',
  serviceFamily: 's3',
  majorVersions: [{ serviceVersion: '1', latestTag: 'aws/s3/1/1.0.0' }],
}

const deployPath = '/organization/org-1/project/project-1/environment/env-1/service/create/blueprint/aws/s3'

describe('BlueprintDetailsPanel', () => {
  const useParamsMock = useParams as jest.MockedFunction<typeof useParams>

  beforeEach(() => {
    jest.useFakeTimers()
    useParamsMock.mockReturnValue({ organizationId: 'org-1' })
    mockUseBlueprintCatalogServiceReadme.mockReturnValue({
      data: {
        content: '# AWS S3 Bucket\n\nBlueprint documentation\n\n- Versioning',
        repository_url: 'https://github.com/qovery-blueprints/s3',
      },
    })
  })

  it('should not render when no blueprint is selected', () => {
    renderWithProviders(
      <BlueprintDetailsPanel
        blueprint={null}
        deployPath={deployPath}
        open
        onOpenChange={jest.fn()}
        onExitComplete={jest.fn()}
      />
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should render blueprint metadata, repository link and readme content', () => {
    renderWithProviders(
      <BlueprintDetailsPanel
        blueprint={blueprint}
        deployPath={deployPath}
        open
        onOpenChange={jest.fn()}
        onExitComplete={jest.fn()}
      />
    )

    const dialog = screen.getByRole('dialog', { name: 'AWS S3 Bucket' })

    expect(within(dialog).getByText('Object storage with server-side encryption.')).toBeInTheDocument()
    expect(within(dialog).getByText('AWS')).toBeInTheDocument()
    expect(within(dialog).getByText('v1')).toBeInTheDocument()
    expect(dialog).toHaveTextContent('Blueprint documentation')
    expect(dialog).toHaveTextContent('Versioning')
    expect(within(dialog).getByRole('link', { name: /qovery-blueprints\/s3/i })).toHaveAttribute(
      'href',
      'https://github.com/qovery-blueprints/s3'
    )
    expect(mockUseBlueprintCatalogServiceReadme).toHaveBeenCalledWith({
      organizationId: 'org-1',
      provider: 'aws',
      serviceFamily: 's3',
      serviceVersion: '1',
      enabled: true,
    })
    expect(mockUseBlueprintCatalogServiceReadme).toHaveBeenCalledWith({
      organizationId: 'org-1',
      provider: 'aws',
      serviceFamily: 's3',
      serviceVersion: '1',
      enabled: true,
      suspense: true,
    })
  })

  it('should render an empty readme state and repository badge when details are unavailable', () => {
    mockUseBlueprintCatalogServiceReadme.mockReturnValue({ data: undefined })

    renderWithProviders(
      <BlueprintDetailsPanel
        blueprint={blueprint}
        deployPath={deployPath}
        open
        onOpenChange={jest.fn()}
        onExitComplete={jest.fn()}
      />
    )

    const dialog = screen.getByRole('dialog', { name: 'AWS S3 Bucket' })

    expect(within(dialog).getByText('No blueprint details available.')).toBeInTheDocument()
    expect(within(dialog).getByText('qovery-blueprints/s3')).toBeInTheDocument()
    expect(within(dialog).queryByRole('link', { name: /qovery-blueprints\/s3/i })).not.toBeInTheDocument()
  })

  it('should hide the version badge when the service version is default', () => {
    renderWithProviders(
      <BlueprintDetailsPanel
        blueprint={{ ...blueprint, majorVersions: [{ serviceVersion: 'default', latestTag: 'aws/s3/default/1.0.0' }] }}
        deployPath={deployPath}
        open
        onOpenChange={jest.fn()}
        onExitComplete={jest.fn()}
      />
    )

    const dialog = screen.getByRole('dialog', { name: 'AWS S3 Bucket' })

    expect(within(dialog).queryByText('vdefault')).not.toBeInTheDocument()
  })

  it('should close from the cancel button', async () => {
    const onOpenChange = jest.fn()

    const { userEvent } = renderWithProviders(
      <BlueprintDetailsPanel
        blueprint={blueprint}
        deployPath={deployPath}
        open
        onOpenChange={onOpenChange}
        onExitComplete={jest.fn()}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('should call onExitComplete after the close animation', async () => {
    const onExitComplete = jest.fn()
    const onOpenChange = jest.fn()
    const { rerender } = renderWithProviders(
      <BlueprintDetailsPanel
        blueprint={blueprint}
        deployPath={deployPath}
        open
        onOpenChange={onOpenChange}
        onExitComplete={onExitComplete}
      />
    )

    rerender(
      <BlueprintDetailsPanel
        blueprint={blueprint}
        deployPath={deployPath}
        open={false}
        onOpenChange={onOpenChange}
        onExitComplete={onExitComplete}
      />
    )

    await waitFor(() => {
      expect(onExitComplete).toHaveBeenCalled()
    })
  })

  afterEach(() => {
    jest.useRealTimers()
  })
})
