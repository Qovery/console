import { within } from '@testing-library/react'
import posthog from 'posthog-js'
import type { BlueprintItem } from 'qovery-typescript-axios'
import type { ReactNode } from 'react'
import { type Gate } from '@qovery/shared/billing-kit'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { OTHER_BLUEPRINT_CATEGORY } from '../blueprint-utils/blueprint-utils'
import { ServiceNew } from './service-new'

const mockUseFeatureFlagEnabled = jest.fn(() => false)
const mockShowPylonForm = jest.fn()
const mockUseBlueprintCatalog = jest.fn(() => ({ data: undefined }))
const blueprintReadmeResponse = {
  content: '# AWS S3 Bucket\n\nBlueprint documentation',
  repository_url: 'https://github.com/qovery-blueprints/s3',
}
const mockGetLinkHref = (to?: string, params?: Record<string, string>) =>
  Object.entries(params ?? {}).reduce((path, [key, value]) => path.replace(`$${key}`, value), to ?? '')

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'org-1', projectId: 'project-1', environmentId: 'env-1' }),
}))

jest.mock('posthog-js', () => ({
  capture: jest.fn(),
}))

jest.mock('posthog-js/react', () => ({
  useFeatureFlagEnabled: (flag: string) => mockUseFeatureFlagEnabled(flag),
}))

jest.mock('@qovery/shared/ui', () => {
  const actual = jest.requireActual('@qovery/shared/ui')

  return {
    ...actual,
    Link: ({
      children,
      params,
      search,
      to,
      ...props
    }: {
      children: ReactNode
      params?: Record<string, string>
      search?: Record<string, string>
      to?: string
      [key: string]: unknown
    }) => {
      const query = search ? `?${new URLSearchParams(search).toString()}` : ''
      return typeof to === 'string' ? (
        <a href={`${mockGetLinkHref(to, params)}${query}`} {...props}>
          {children}
        </a>
      ) : (
        <span {...props}>{children}</span>
      )
    },
  }
})

jest.mock('@qovery/shared/util-hooks', () => ({
  ...jest.requireActual('@qovery/shared/util-hooks'),
  useSupportChat: () => ({ showPylonForm: mockShowPylonForm, showChat: jest.fn() }),
}))

// The gates pricing-api answers (the billing-paywall flag on): none by default, nothing locked.
const mockGates: { current: Gate[] | undefined } = { current: undefined }
jest.mock('@qovery/shared/billing-kit', () => {
  const actual = jest.requireActual('@qovery/shared/billing-kit')
  const client = {
    mode: 'live',
    publicPlans: () => Promise.resolve(),
    billingUsage: () => Promise.resolve(),
    spendLimits: () => Promise.resolve(),
    gateEvent: () => Promise.resolve(),
    get gates() {
      return mockGates.current
        ? (organizationId: string) =>
            Promise.resolve({ organization_id: organizationId, access: 'billing', gates: mockGates.current })
        : undefined
    },
  }
  return {
    ...actual,
    useBillingPaywall: (organizationId: string, keys: object, options: object) =>
      actual.usePaywall(client, organizationId, keys, options),
  }
})

const lockedBlueprints: Gate = {
  action: 'blueprint.create',
  sku: 'service_catalog',
  name: 'Service catalog (blueprints)',
  allowed: false,
  reason: 'not_in_plan',
  limit: false,
  used: 0,
  requested: 1,
  paywall: {
    sku: 'service_catalog',
    title: 'Blueprints',
    message: 'Service catalog (blueprints) is not included in your Starter plan.',
    headline: 'Create databases, caches and storage from a catalog',
    benefits: ['Pick a blueprint (RDS, ElastiCache, S3 and more) and fill a short form.'],
    audience: 'billing',
    options: [{ type: 'start_trial', label: 'Try it free for 14 days', days: 14, includes: 'Blueprints' }],
  },
}

const mockUseBlueprintCatalogServiceReadme = jest.fn(() => ({
  data: blueprintReadmeResponse,
  isLoading: false,
  isError: false,
}))

jest.mock('../hooks/use-blueprint-catalog-service-readme/use-blueprint-catalog-service-readme', () => ({
  useBlueprintCatalogServiceReadme: (props: unknown) => mockUseBlueprintCatalogServiceReadme(props),
}))

jest.mock('../hooks/use-blueprint-catalog/use-blueprint-catalog', () => ({
  useBlueprintCatalog: (props: unknown) => mockUseBlueprintCatalog(props),
}))

const blueprints: BlueprintItem[] = [
  {
    name: 'AWS S3 Bucket',
    displayName: 'AWS S3 Bucket',
    kind: 'ServiceBlueprint',
    description: 'Object storage with server-side encryption, versioning, and configurable lifecycle policies.',
    icon: 'app://qovery-console/s3',
    categories: ['storage'],
    primaryCategory: 'Storage',
    provider: 'aws',
    serviceFamily: 's3',
    majorVersions: [{ serviceVersion: '1', latestTag: 'aws/s3/1/1.0.0' }],
  },
  {
    name: 'Redis',
    displayName: 'Redis',
    kind: 'ServiceBlueprint',
    description: 'In-memory key-value store deployed via the Bitnami Helm chart with configurable replicas.',
    icon: 'https://cdn.qovery.com/icons/redis.svg',
    categories: ['cache'],
    primaryCategory: 'Databases & Caches',
    provider: 'aws',
    serviceFamily: 'redis',
    majorVersions: [{ serviceVersion: '7', latestTag: 'aws/redis/7/1.0.0' }],
  },
]

describe('ServiceNew', () => {
  beforeEach(() => {
    mockGates.current = undefined
    mockUseFeatureFlagEnabled.mockReturnValue(false)
    mockShowPylonForm.mockClear()
    ;(posthog.capture as jest.Mock).mockClear()
    mockUseBlueprintCatalog.mockReturnValue({ data: undefined })
    mockUseBlueprintCatalogServiceReadme.mockReturnValue({
      data: blueprintReadmeResponse,
      isLoading: false,
      isError: false,
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <ServiceNew organizationId="org-1" projectId="project-1" environmentId="env-1" availableTemplates={[]} />
    )
    expect(baseElement).toBeTruthy()
  })

  it('should not render a page-level service search', () => {
    renderWithProviders(
      <ServiceNew organizationId="org-1" projectId="project-1" environmentId="env-1" availableTemplates={[]} />
    )
    expect(screen.queryByPlaceholderText('Search…')).not.toBeInTheDocument()
    expect(screen.queryByText('See documentation')).not.toBeInTheDocument()
  })

  it('should render Base services section with main service types', () => {
    renderWithProviders(
      <ServiceNew organizationId="org-1" projectId="project-1" environmentId="env-1" availableTemplates={[]} />
    )
    expect(screen.getByRole('heading', { name: 'Base services' })).toBeInTheDocument()
    expect(screen.getByText('Application')).toBeInTheDocument()
    expect(screen.queryByText('Container Database')).not.toBeInTheDocument()
    expect(screen.getByText('Lifecycle Job')).toBeInTheDocument()
    expect(screen.getByText('Cron Job')).toBeInTheDocument()
    expect(screen.getByText('Helm')).toBeInTheDocument()
    expect(screen.getAllByText('Terraform').length).toBeGreaterThanOrEqual(1)
    expect(screen.queryByText('Agent task')).not.toBeInTheDocument()
  })

  it('does not offer agent creation in the service catalog even when enabled', () => {
    mockUseFeatureFlagEnabled.mockImplementation((flag: string) => flag === 'argentic-workflow')
    renderWithProviders(
      <ServiceNew organizationId="org-1" projectId="project-1" environmentId="env-1" availableTemplates={[]} />
    )
    expect(screen.queryByRole('heading', { name: 'Agent use cases' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Start from scratch/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Request agent template' })).not.toBeInTheDocument()
  })

  it('should show base service descriptions in info tooltips', async () => {
    const { userEvent } = renderWithProviders(
      <ServiceNew organizationId="org-1" projectId="project-1" environmentId="env-1" availableTemplates={[]} />
    )

    await userEvent.hover(screen.getByRole('img', { name: 'Lifecycle Job details' }))

    expect(
      await screen.findAllByText('Execute any type of script coming from Git or a Container Registry.')
    ).not.toHaveLength(0)
  })

  it('should render legacy template sections when the service catalog is disabled', () => {
    renderWithProviders(
      <ServiceNew organizationId="org-1" projectId="project-1" environmentId="env-1" availableTemplates={[]} />
    )

    expect(screen.getByRole('heading', { name: 'Data & Storage' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Back-end' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Front-end' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'IAC' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'More template' })).toBeInTheDocument()
  })

  it('should hide legacy template sections when the service catalog is enabled', () => {
    mockUseFeatureFlagEnabled.mockImplementation((flag: string) => flag === 'service-catalog')

    renderWithProviders(
      <ServiceNew organizationId="org-1" projectId="project-1" environmentId="env-1" availableTemplates={[]} />
    )

    expect(screen.queryByRole('heading', { name: 'Data & Storage' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Back-end' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Front-end' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'IAC' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'More template' })).not.toBeInTheDocument()
  })

  it('should render blueprint cards from the catalog', async () => {
    mockUseFeatureFlagEnabled.mockImplementation((flag: string) => flag === 'service-catalog')
    mockUseBlueprintCatalog.mockReturnValue({ data: { blueprints } })

    const { userEvent } = renderWithProviders(
      <ServiceNew organizationId="org-1" projectId="project-1" environmentId="env-1" availableTemplates={[]} />
    )

    const blueprintsSection = screen.getByRole('heading', { name: 'Blueprints' }).closest('section')
    expect(blueprintsSection).toBeInTheDocument()

    const blueprintsSectionScreen = within(blueprintsSection as HTMLElement)
    expect(blueprintsSectionScreen.getByText('AWS S3 Bucket')).toBeInTheDocument()
    expect(blueprintsSectionScreen.getByText('Redis')).toBeInTheDocument()
    expect(blueprintsSection?.querySelector('img[src="/assets/devicon/s3.svg"]')).toBeInTheDocument()
    const deployLinks = blueprintsSectionScreen.getAllByRole('link', { name: 'Deploy' })
    expect(deployLinks).toHaveLength(2)
    expect(deployLinks[0]).toHaveAttribute(
      'href',
      '/organization/org-1/project/project-1/environment/env-1/service/create/blueprint/aws/s3'
    )

    await userEvent.type(screen.getByPlaceholderText('Search blueprints...'), 'redis')

    expect(blueprintsSectionScreen.queryByText('AWS S3 Bucket')).not.toBeInTheDocument()
    expect(blueprintsSectionScreen.getByText('Redis')).toBeInTheDocument()
  })

  it('should render each blueprint once after a search when two blueprints share a provider and service family', async () => {
    mockUseFeatureFlagEnabled.mockImplementation((flag: string) => flag === 'service-catalog')
    mockUseBlueprintCatalog.mockReturnValue({
      data: {
        blueprints: [
          { ...blueprints[1], name: 'aws-rds-mysql', displayName: 'Amazon RDS for MySQL', serviceFamily: 'mysql' },
          { ...blueprints[1], name: 'aws-elasticache-redis', displayName: 'Amazon ElastiCache for Redis' },
          {
            ...blueprints[1],
            name: 'aws-elasticache-redis-node',
            displayName: 'Amazon ElastiCache for Redis (legacy single node)',
          },
        ],
      },
    })

    const { userEvent } = renderWithProviders(
      <ServiceNew organizationId="org-1" projectId="project-1" environmentId="env-1" availableTemplates={[]} />
    )

    await userEvent.type(screen.getByPlaceholderText('Search blueprints...'), 'redis')

    expect(screen.getAllByRole('heading', { level: 4 }).map(({ textContent }) => textContent)).toEqual([
      'Amazon ElastiCache for Redis',
      'Amazon ElastiCache for Redis (legacy single node)',
    ])
  })

  it('should group blueprint cards by the primary categories returned by the catalog', () => {
    mockUseFeatureFlagEnabled.mockImplementation((flag: string) => flag === 'service-catalog')
    mockUseBlueprintCatalog.mockReturnValue({
      data: {
        blueprints: [
          { ...blueprints[0], primaryCategory: '' },
          { ...blueprints[1], primaryCategory: 'Custom Platform' },
        ],
      },
    })

    renderWithProviders(
      <ServiceNew organizationId="org-1" projectId="project-1" environmentId="env-1" availableTemplates={[]} />
    )

    expect(screen.getByRole('heading', { name: 'Custom Platform', level: 3 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: OTHER_BLUEPRINT_CATEGORY, level: 3 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'AWS S3 Bucket', level: 4 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Redis', level: 4 })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 3 }).map(({ textContent }) => textContent)).toEqual([
      'Custom Platform',
      OTHER_BLUEPRINT_CATEGORY,
    ])
  })

  it('should show an empty state when the blueprint search has no results', async () => {
    mockUseFeatureFlagEnabled.mockImplementation((flag: string) => flag === 'service-catalog')
    mockUseBlueprintCatalog.mockReturnValue({ data: { blueprints } })

    const { userEvent } = renderWithProviders(
      <ServiceNew organizationId="org-1" projectId="project-1" environmentId="env-1" availableTemplates={[]} />
    )

    const blueprintsSection = screen.getByRole('heading', { name: 'Blueprints' }).closest('section')
    const blueprintsSectionScreen = within(blueprintsSection as HTMLElement)

    await userEvent.type(screen.getByPlaceholderText('Search blueprints...'), 'does-not-exist')

    expect(screen.getByRole('heading', { name: 'Blueprints' })).toBeInTheDocument()
    expect(blueprintsSectionScreen.getByText('No blueprints found')).toBeInTheDocument()
    expect(blueprintsSectionScreen.queryByText('AWS S3 Bucket')).not.toBeInTheDocument()
  })

  it('should format slug blueprint names', () => {
    mockUseFeatureFlagEnabled.mockImplementation((flag: string) => flag === 'service-catalog')
    mockUseBlueprintCatalog.mockReturnValue({
      data: { blueprints: [{ ...blueprints[0], name: 'aws-rds-mysql', displayName: '' }] },
    })

    renderWithProviders(
      <ServiceNew organizationId="org-1" projectId="project-1" environmentId="env-1" availableTemplates={[]} />
    )

    expect(screen.getByText('AWS RDS MySQL')).toBeInTheDocument()
  })

  it('should prefer a blueprint display name from the catalog', () => {
    mockUseFeatureFlagEnabled.mockImplementation((flag: string) => flag === 'service-catalog')
    mockUseBlueprintCatalog.mockReturnValue({
      data: { blueprints: [{ ...blueprints[0], name: 'aws-rds-mysql', displayName: 'Amazon RDS for MySQL' }] },
    })

    renderWithProviders(
      <ServiceNew organizationId="org-1" projectId="project-1" environmentId="env-1" availableTemplates={[]} />
    )

    expect(screen.getByText('Amazon RDS for MySQL')).toBeInTheDocument()
    expect(screen.queryByText('AWS RDS MySQL')).not.toBeInTheDocument()
  })

  it('should only display blueprints compatible with the environment cluster', () => {
    mockUseFeatureFlagEnabled.mockImplementation((flag: string) => flag === 'service-catalog')
    mockUseBlueprintCatalog.mockReturnValue({
      data: {
        blueprints: [
          { ...blueprints[0], name: 'AWS S3', displayName: 'AWS S3', provider: 'AWS' },
          {
            ...blueprints[0],
            name: 'Scaleway Object Storage',
            displayName: 'Scaleway Object Storage',
            provider: 'SCW',
          },
          { ...blueprints[1], name: 'Helm Redis', displayName: 'Helm Redis', provider: 'HELM' },
        ],
      },
    })

    renderWithProviders(
      <ServiceNew
        organizationId="org-1"
        projectId="project-1"
        environmentId="env-1"
        cloudProvider="AWS"
        availableTemplates={[]}
      />
    )

    expect(screen.getByText('AWS S3')).toBeInTheDocument()
    expect(screen.getByText('Helm Redis')).toBeInTheDocument()
    expect(screen.queryByText('Scaleway Object Storage')).not.toBeInTheDocument()
  })

  it('should not render deploy actions for blueprints without a service family', async () => {
    mockUseFeatureFlagEnabled.mockImplementation((flag: string) => flag === 'service-catalog')
    mockUseBlueprintCatalog.mockReturnValue({
      data: {
        blueprints: [{ ...blueprints[0], serviceFamily: undefined }],
      },
    })

    const { userEvent } = renderWithProviders(
      <ServiceNew organizationId="org-1" projectId="project-1" environmentId="env-1" availableTemplates={[]} />
    )

    const blueprintsSection = screen.getByRole('heading', { name: 'Blueprints' }).closest('section')
    const blueprintsSectionScreen = within(blueprintsSection as HTMLElement)

    expect(blueprintsSectionScreen.queryByRole('link', { name: 'Deploy' })).not.toBeInTheDocument()

    await userEvent.click(blueprintsSectionScreen.getByRole('button', { name: 'View details' }))

    const dialog = screen.getByRole('dialog', { name: 'AWS S3 Bucket' })
    expect(within(dialog).queryByRole('link', { name: 'Deploy blueprint' })).not.toBeInTheDocument()
  })

  it('should open blueprint details from a blueprint card', async () => {
    mockUseFeatureFlagEnabled.mockImplementation((flag: string) => flag === 'service-catalog')
    mockUseBlueprintCatalog.mockReturnValue({ data: { blueprints } })

    const { userEvent } = renderWithProviders(
      <ServiceNew organizationId="org-1" projectId="project-1" environmentId="env-1" availableTemplates={[]} />
    )

    const blueprintsSection = screen.getByRole('heading', { name: 'Blueprints' }).closest('section')
    const blueprintsSectionScreen = within(blueprintsSection as HTMLElement)

    await userEvent.click(blueprintsSectionScreen.getAllByRole('button', { name: 'View details' })[0])

    const dialog = screen.getByRole('dialog', { name: 'AWS S3 Bucket' })
    expect(mockUseBlueprintCatalogServiceReadme).toHaveBeenCalledWith({
      organizationId: 'org-1',
      provider: 'aws',
      serviceFamily: 's3',
      serviceVersion: '1',
      enabled: true,
      suspense: true,
    })
    const repositoryLinks = within(dialog).getAllByRole('link', { name: /qovery-blueprints\/s3/i })
    expect(repositoryLinks).toHaveLength(1)
    expect(repositoryLinks[0]).toHaveAttribute('href', 'https://github.com/qovery-blueprints/s3')
    expect(within(dialog).getByRole('heading', { name: 'AWS S3 Bucket' })).toBeInTheDocument()
    expect(within(dialog).getByText('AWS')).toBeInTheDocument()
    expect(within(dialog).getByText('v1')).toBeInTheDocument()
    expect(within(dialog).getByRole('link', { name: 'Deploy blueprint' })).toHaveAttribute(
      'href',
      '/organization/org-1/project/project-1/environment/env-1/service/create/blueprint/aws/s3'
    )

    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'AWS S3 Bucket' })).not.toBeInTheDocument()
    })
  })

  it('should hide the blueprint version badge when version is default', async () => {
    const defaultVersionBlueprints: BlueprintItem[] = [
      {
        ...blueprints[0],
        majorVersions: [{ serviceVersion: 'default', latestTag: 'aws/s3/default/1.0.0' }],
      },
    ]
    mockUseFeatureFlagEnabled.mockImplementation((flag: string) => flag === 'service-catalog')
    mockUseBlueprintCatalog.mockReturnValue({ data: { blueprints: defaultVersionBlueprints } })

    const { userEvent } = renderWithProviders(
      <ServiceNew organizationId="org-1" projectId="project-1" environmentId="env-1" availableTemplates={[]} />
    )

    const blueprintsSection = screen.getByRole('heading', { name: 'Blueprints' }).closest('section')
    const blueprintsSectionScreen = within(blueprintsSection as HTMLElement)

    await userEvent.click(blueprintsSectionScreen.getByRole('button', { name: 'View details' }))

    const dialog = screen.getByRole('dialog', { name: 'AWS S3 Bucket' })
    expect(mockUseBlueprintCatalogServiceReadme).toHaveBeenCalledWith({
      organizationId: 'org-1',
      provider: 'aws',
      serviceFamily: 's3',
      serviceVersion: 'default',
      enabled: true,
      suspense: true,
    })
    expect(within(dialog).queryByText('vdefault')).not.toBeInTheDocument()
  })

  it('should keep database template links without a base database entry', async () => {
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
    ).not.toBeInTheDocument()

    await userEvent.click(screen.getByText('PostgreSQL'))

    await waitFor(() => {
      expect(
        container.querySelector(
          'a[href="/organization/org-1/project/project-1/environment/env-1/service/create/database?template=postgresql&option=container"]'
        )
      ).toBeInTheDocument()
    })
    expect(
      container.querySelector(
        'a[href="/organization/org-1/project/project-1/environment/env-1/service/create/database?template=postgresql&option=managed"]'
      )
    ).not.toBeInTheDocument()
  })

  it('should keep default service links valid', () => {
    const { container } = renderWithProviders(
      <ServiceNew organizationId="org-1" projectId="project-1" environmentId="env-1" availableTemplates={[]} />
    )

    expect(
      container.querySelector(
        'a[href="/organization/org-1/project/project-1/environment/env-1/service/create/application"]'
      )
    ).toBeInTheDocument()
    expect(
      container.querySelector(
        'a[href="/organization/org-1/project/project-1/environment/env-1/organization/org-1/project/project-1/environment/env-1/service/create/application"]'
      )
    ).not.toBeInTheDocument()
  })

  describe('when the plan does not include blueprints', () => {
    beforeEach(() => {
      mockGates.current = [lockedBlueprints]
      mockUseFeatureFlagEnabled.mockImplementation((flag: string) => flag === 'service-catalog')
      mockUseBlueprintCatalog.mockReturnValue({ data: { blueprints } })
    })

    it('keeps the catalog browsable and opens the full-page paywall from Deploy', async () => {
      const { userEvent } = renderWithProviders(
        <ServiceNew organizationId="org-1" projectId="project-1" environmentId="env-1" availableTemplates={[]} />
      )
      const section = within(screen.getByRole('heading', { name: 'Blueprints' }).closest('section') as HTMLElement)

      expect(await section.findAllByText('Try it free for 14 days')).toHaveLength(2)
      expect(section.getByText('AWS S3 Bucket')).toBeInTheDocument()
      expect(section.queryByRole('link', { name: 'Deploy' })).not.toBeInTheDocument()

      await userEvent.click(section.getAllByRole('button', { name: 'Deploy' })[0])

      expect(await screen.findByText('Create databases, caches and storage from a catalog')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Start a 14-day trial' })).toBeInTheDocument()
    })

    it('opens the full-page paywall instead of the blueprint details', async () => {
      const { userEvent } = renderWithProviders(
        <ServiceNew organizationId="org-1" projectId="project-1" environmentId="env-1" availableTemplates={[]} />
      )
      const section = within(screen.getByRole('heading', { name: 'Blueprints' }).closest('section') as HTMLElement)
      await section.findAllByText('Try it free for 14 days')

      await userEvent.click(section.getAllByRole('button', { name: 'View details' })[0])

      expect(await screen.findByRole('button', { name: 'Start a 14-day trial' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Not now' })).toBeInTheDocument()
      expect(screen.queryByRole('dialog', { name: 'AWS S3 Bucket' })).not.toBeInTheDocument()
      expect(mockUseBlueprintCatalogServiceReadme).not.toHaveBeenCalledWith(expect.objectContaining({ enabled: true }))
    })

    it('never gates the base services: no lock, and each one still links to its creation flow', async () => {
      const { container } = renderWithProviders(
        <ServiceNew organizationId="org-1" projectId="project-1" environmentId="env-1" availableTemplates={[]} />
      )
      const blueprintsSection = within(
        screen.getByRole('heading', { name: 'Blueprints' }).closest('section') as HTMLElement
      )
      await blueprintsSection.findAllByText('Try it free for 14 days')
      const base = within(screen.getByRole('heading', { name: 'Base services' }).closest('section') as HTMLElement)

      expect(base.queryByText('Try it free for 14 days')).not.toBeInTheDocument()
      expect(screen.getAllByText('Try it free for 14 days')).toHaveLength(blueprints.length)
      for (const type of ['application', 'lifecycle-job', 'cron-job', 'helm']) {
        expect(
          container.querySelector(
            `a[href="/organization/org-1/project/project-1/environment/env-1/service/create/${type}"]`
          )
        ).toBeInTheDocument()
      }
      expect(screen.queryByRole('button', { name: 'Not now' })).not.toBeInTheDocument()
    })
  })

  describe('when the plan includes blueprints', () => {
    beforeEach(() => {
      mockGates.current = [{ ...lockedBlueprints, allowed: true, reason: '', paywall: undefined }]
      mockUseFeatureFlagEnabled.mockImplementation((flag: string) => flag === 'service-catalog')
      mockUseBlueprintCatalog.mockReturnValue({ data: { blueprints } })
    })

    it('opens the blueprint details and links Deploy straight to the creation flow, with no lock', async () => {
      const { userEvent } = renderWithProviders(
        <ServiceNew organizationId="org-1" projectId="project-1" environmentId="env-1" availableTemplates={[]} />
      )
      const section = within(screen.getByRole('heading', { name: 'Blueprints' }).closest('section') as HTMLElement)

      expect(section.getAllByRole('link', { name: 'Deploy' })[0]).toHaveAttribute(
        'href',
        '/organization/org-1/project/project-1/environment/env-1/service/create/blueprint/aws/s3'
      )
      await userEvent.click(section.getAllByRole('button', { name: 'View details' })[0])

      expect(screen.getByRole('dialog', { name: 'AWS S3 Bucket' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Not now' })).not.toBeInTheDocument()
      expect(screen.queryByText('Try it free for 14 days')).not.toBeInTheDocument()
    })
  })
})
