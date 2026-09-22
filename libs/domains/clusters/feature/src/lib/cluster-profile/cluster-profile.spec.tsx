import { type PlatformTemplateSummaryResponse } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { usePlatformTemplates } from '../hooks/use-platform-templates/use-platform-templates'
import { ClusterProfileFeature } from './cluster-profile'

jest.mock('../hooks/use-platform-templates/use-platform-templates')

const mockUsePlatformTemplates = usePlatformTemplates as jest.MockedFunction<typeof usePlatformTemplates>
const mockTemplates = [
  {
    layers: [
      { key: 'infrastructure', mandatory: false, enabledByDefault: false, components: [] },
      {
        key: 'qovery-stack',
        mandatory: true,
        enabledByDefault: true,
        components: [{ key: 'cluster-agent' }, { key: 'shell-agent' }, { key: 'qovery-priority-class' }],
      },
      {
        key: 'log-infra',
        mandatory: true,
        enabledByDefault: true,
        components: [{ key: 'loki' }, { key: 'alloy' }],
      },
      {
        key: 'network',
        mandatory: false,
        enabledByDefault: true,
        components: [{ key: 'envoy' }],
      },
    ],
  },
] as unknown as PlatformTemplateSummaryResponse[]

describe('ClusterProfileFeature', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUsePlatformTemplates.mockReturnValue({
      data: mockTemplates,
      isError: false,
      isLoading: false,
    } as ReturnType<typeof usePlatformTemplates>)
  })

  it('renders the Loki configuration view', () => {
    const { container } = renderWithProviders(<ClusterProfileFeature organizationId="organization-id" />)

    expect(mockUsePlatformTemplates).toHaveBeenCalledWith({ organizationId: 'organization-id' })
    expect(screen.getByRole('banner')).not.toHaveClass('border-b')
    expect(container.querySelectorAll('.fa-circle-check')).toHaveLength(1)
    expect(container.querySelectorAll('.fa-circle-minus')).toHaveLength(1)
    expect(screen.getByRole('heading', { name: 'Log infra' })).toBeInTheDocument()
    expect(
      screen.getByText('Collects logs from everything running on this cluster and makes them searchable in Qovery')
    ).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Loki' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('spinbutton', { name: 'Retention period' })).toHaveValue(12)
    expect(screen.getByText('Resource profile')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Restore all' })).toBeDisabled()
    expect(screen.getAllByText('Loki').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Alloy').length).toBeGreaterThan(0)
  })

  it('allows the UI controls to be previewed locally', async () => {
    const { userEvent } = renderWithProviders(<ClusterProfileFeature organizationId="organization-id" />)

    expect(screen.getByRole('tab', { name: 'Loki' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('spinbutton', { name: 'Retention period' })).toHaveValue(12)

    const highAvailability = screen.getByRole('switch', { name: 'High availability' })
    expect(highAvailability).toBeChecked()
    await userEvent.click(highAvailability)
    expect(highAvailability).not.toBeChecked()

    expect(screen.getByRole('switch', { name: 'Enable log infrastructure' })).toBeDisabled()
  })

  it('uses the URL-selected component as the active sidebar item', async () => {
    const onActiveComponentChange = jest.fn()
    const { userEvent } = renderWithProviders(
      <ClusterProfileFeature
        organizationId="organization-id"
        activeComponentKey="alloy"
        onActiveComponentChange={onActiveComponentChange}
      />
    )

    expect(screen.getByRole('button', { name: 'Log infra' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Alloy' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('tab', { name: 'Alloy' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('button', { name: 'Loki' })).not.toHaveAttribute('aria-current', 'page')

    await userEvent.click(screen.getByRole('tab', { name: 'Loki' }))

    expect(onActiveComponentChange).toHaveBeenCalledWith('loki')
  })

  it('filters the layer tree from the search input', async () => {
    const { userEvent } = renderWithProviders(<ClusterProfileFeature organizationId="organization-id" />)
    const search = screen.getByRole('textbox', { name: 'Search layers' })

    await userEvent.type(search, 'network')

    expect(screen.getByText('Network')).toBeInTheDocument()
    expect(screen.queryByText('Qovery stack')).not.toBeInTheDocument()
  })
})
