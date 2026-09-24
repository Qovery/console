import { environmentFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { type DeployByVersionService } from './deploy-by-version'
import { DeployByVersionModal } from './deploy-by-version-modal'

const mockEnvironment = environmentFactoryMock(1)[0]
const mockDeployAllServices = jest.fn()
const mockCloseModal = jest.fn()
const mockSetModalDismissible = jest.fn()
let mockDeployIsLoading = false

const unavailableService: DeployByVersionService = {
  id: 'unavailable',
  name: 'Unavailable service',
  iconUri: 'app://qovery-console/application',
  serviceType: 'APPLICATION',
  sourceType: 'git',
  currentVersion: 'current-commit',
  versions: [],
  isSkipped: false,
  hasVersionError: true,
}

const defaultServices: DeployByVersionService[] = [
  {
    id: 'terraform',
    name: 'Infrastructure',
    iconUri: 'app://qovery-console/terraform',
    serviceType: 'TERRAFORM',
    sourceType: 'git',
    currentVersion: 'old-terraform-commit',
    versions: [
      { value: 'new-terraform-commit', message: 'Update infrastructure' },
      { value: 'old-terraform-commit', message: 'Current infrastructure' },
    ],
    isSkipped: false,
  },
  {
    id: 'application',
    name: 'API',
    iconUri: 'app://qovery-console/application',
    serviceType: 'APPLICATION',
    sourceType: 'git',
    currentVersion: 'current-app-commit',
    versions: [
      { value: 'current-app-commit', message: 'Current application' },
      { value: 'previous-app-commit', message: 'Previous application' },
    ],
    isSkipped: false,
  },
  unavailableService,
]
let mockServices = defaultServices

jest.mock('@qovery/domains/services/feature', () => ({
  ServiceAvatar: () => <span data-testid="service-avatar" />,
}))

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModal: () => ({ closeModal: mockCloseModal, setModalDismissible: mockSetModalDismissible }),
}))

jest.mock('./use-deploy-by-version-services', () => ({
  useDeployByVersionServices: () => ({ data: mockServices, isLoading: false, isError: false }),
}))

jest.mock('../hooks/use-deploy-all-services/use-deploy-all-services', () => ({
  useDeployAllServices: () => ({ mutate: mockDeployAllServices, isLoading: mockDeployIsLoading }),
}))

describe('DeployByVersionModal', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
    mockServices = defaultServices
    mockDeployIsLoading = false
    mockDeployAllServices.mockImplementation((_variables: unknown, options: { onSuccess?: () => void }) => {
      options.onSuccess?.()
    })
  })

  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  it('preselects outdated services and submits an explicit Terraform commit', async () => {
    const { userEvent } = renderWithProviders(<DeployByVersionModal environment={mockEnvironment} />)

    expect(screen.getByRole('button', { name: 'Update 1 service' })).toBeEnabled()
    expect(screen.getByRole('checkbox', { name: 'Infrastructure' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'API' })).not.toBeChecked()

    await userEvent.click(screen.getByRole('button', { name: 'Update 1 service' }))

    expect(mockDeployAllServices).toHaveBeenCalledWith(
      {
        environment: mockEnvironment,
        payload: { terraforms: [{ id: 'terraform', git_commit_id: 'new-terraform-commit' }] },
      },
      { onSuccess: mockCloseModal }
    )
    expect(mockSetModalDismissible).toHaveBeenLastCalledWith(false)
    expect(mockCloseModal).toHaveBeenCalledTimes(1)
  })

  it('allows an up-to-date service to be selected explicitly', async () => {
    const { userEvent } = renderWithProviders(<DeployByVersionModal environment={mockEnvironment} />)

    await userEvent.click(screen.getByRole('checkbox', { name: 'API' }))

    expect(screen.getByRole('button', { name: 'Update 2 services' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Select a version for API' })).toBeEnabled()
  })

  it('keeps the version selector enabled and selects the service when its target changes', async () => {
    const { userEvent } = renderWithProviders(<DeployByVersionModal environment={mockEnvironment} />)

    const selector = screen.getByRole('button', { name: 'Select a version for API' })
    expect(selector).toBeEnabled()
    expect(screen.getByRole('checkbox', { name: 'API' })).not.toBeChecked()

    await userEvent.click(selector)
    await userEvent.click(screen.getByRole('menuitem', { name: /previou Previous application/ }))

    expect(screen.getByRole('checkbox', { name: 'API' })).toBeChecked()
    expect(selector).toHaveTextContent('previou')
    expect(screen.getByRole('button', { name: 'Update 2 services' })).toBeEnabled()
  })

  it('sizes version icons with their adjacent text', () => {
    renderWithProviders(<DeployByVersionModal environment={mockEnvironment} />)

    const selector = screen.getByRole('button', { name: 'Select a version for Infrastructure' })
    const row = selector.closest('[data-testid="service-version-row"]')

    expect(selector.querySelector('.fa-code-commit')).toHaveClass('text-ssm')
    expect(selector.querySelector('.fa-chevron-down')).toHaveClass('text-ssm')
    expect(selector.querySelector('.fa-chevron-down')).not.toHaveClass('text-neutral-subtle')
    expect(selector.querySelector('.fa-chevron-down')).toHaveClass('group-data-[state=open]:rotate-180')
    expect(row?.querySelector('.fa-arrow-right')).toHaveClass('text-ssm')
  })

  it('lets version controls hug their content without width constraints', () => {
    renderWithProviders(<DeployByVersionModal environment={mockEnvironment} />)

    const selector = screen.getByRole('button', { name: 'Select a version for Infrastructure' })
    const row = selector.closest('[data-testid="service-version-row"]')
    const currentVersion = screen.getByText('old-ter').closest('[class~="h-6"]')

    expect(selector).not.toHaveClass('min-w-28', 'max-w-44')
    expect(row?.querySelector('.max-w-36')).not.toBeInTheDocument()
    expect(currentVersion).toHaveClass('px-1.5')
  })

  it('renders commit details using the Figma dropdown hierarchy', async () => {
    const { userEvent } = renderWithProviders(<DeployByVersionModal environment={mockEnvironment} />)

    const selector = screen.getByRole('button', { name: 'Select a version for Infrastructure' })
    await userEvent.click(selector)

    expect(selector).toHaveAttribute('data-state', 'open')
    expect(screen.getByRole('menuitem', { name: /new-ter Update infrastructure/ })).toHaveClass(
      'hover:bg-surface-neutral-subtle'
    )
    expect(screen.getByText('Update infrastructure')).toBeInTheDocument()
    expect(screen.queryByText('main')).not.toBeInTheDocument()
    expect(screen.getAllByText('Latest').length).toBeGreaterThan(0)
    expect(screen.getByTestId('version-options')).toHaveClass('z-dropdown')
    expect(screen.getByTestId('version-options')).not.toHaveClass('font-code', 'font-mono')
    expect(screen.getByTestId('version-options').querySelector('.fa-code-commit')).not.toBeInTheDocument()
  })

  it('renders complete non-Git versions and prevents selecting the mutable latest tag', async () => {
    mockServices = [
      {
        id: 'container',
        name: 'Container',
        iconUri: 'app://qovery-console/container',
        serviceType: 'CONTAINER',
        sourceType: 'container',
        currentVersion: 'release-2026-09-alpha',
        containerRegistryId: 'registry',
        imageName: 'image',
        versions: [
          { value: 'release-2026-09-alpha' },
          { value: 'release-2026-09-beta' },
          {
            value: 'latest',
            isDisabled: true,
            disabledReason: 'Image tag cannot be latest to ensure consistent deployment',
          },
        ],
        isSkipped: false,
      },
    ]
    const { userEvent } = renderWithProviders(<DeployByVersionModal environment={mockEnvironment} />)
    const checkbox = screen.getByRole('checkbox', { name: 'Container' })

    await userEvent.click(screen.getByRole('button', { name: 'Select a version for Container' }))

    expect(screen.getByRole('menuitem', { name: 'release-2026-09-alpha' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'release-2026-09-beta' })).toBeInTheDocument()
    const latest = screen.getByRole('menuitem', {
      name: 'latest Image tag cannot be latest to ensure consistent deployment',
    })
    expect(latest).toHaveAttribute('data-disabled')

    await userEvent.click(latest)

    expect(checkbox).not.toBeChecked()
  })

  it('renders every fetched version in a natively scrollable four-row menu', async () => {
    mockServices = [
      {
        ...defaultServices[0],
        versions: Array.from({ length: 6 }, (_, index) => ({
          value: `commit-${index}`,
          message: `Commit message ${index}`,
        })),
      },
    ]
    const { userEvent } = renderWithProviders(<DeployByVersionModal environment={mockEnvironment} />)

    await userEvent.click(screen.getByRole('button', { name: 'Select a version for Infrastructure' }))

    const versionItems = screen.getAllByRole('menuitem')
    expect(versionItems).toHaveLength(6)
    versionItems.forEach((item) => expect(item).toHaveClass('h-[62px]', 'shrink-0'))
    expect(screen.getByTestId('version-options')).toHaveClass(
      'max-h-[248px]',
      'overflow-x-hidden',
      'overflow-y-auto',
      'overscroll-contain'
    )
  })

  it('selects a different version from the dropdown', async () => {
    const { userEvent } = renderWithProviders(<DeployByVersionModal environment={mockEnvironment} />)

    await userEvent.click(screen.getByRole('button', { name: 'Select a version for Infrastructure' }))
    await userEvent.click(screen.getByRole('menuitem', { name: /old-ter Current infrastructure/ }))

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Select a version for Infrastructure' })).toHaveTextContent('old-ter')

    await userEvent.click(screen.getByRole('button', { name: 'Update 1 service' }))

    expect(mockDeployAllServices).toHaveBeenCalledWith(
      {
        environment: mockEnvironment,
        payload: { terraforms: [{ id: 'terraform', git_commit_id: 'old-terraform-commit' }] },
      },
      { onSuccess: mockCloseModal }
    )
  })

  it('locks modal dismissal and prevents duplicate submission while deployment is pending', async () => {
    mockDeployAllServices.mockImplementation(() => undefined)
    const { rerender, userEvent } = renderWithProviders(<DeployByVersionModal environment={mockEnvironment} />)

    await userEvent.click(screen.getByRole('button', { name: 'Update 1 service' }))
    expect(mockDeployAllServices).toHaveBeenCalledTimes(1)
    expect(mockSetModalDismissible).toHaveBeenLastCalledWith(false)

    mockDeployIsLoading = true
    rerender(<DeployByVersionModal environment={mockEnvironment} />)

    const submit = screen.getByRole('button', { name: 'Update 1 service' })
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    expect(submit).toBeDisabled()
    submit.focus()
    await userEvent.keyboard('{Enter}')
    expect(mockDeployAllServices).toHaveBeenCalledTimes(1)
    expect(mockCloseModal).not.toHaveBeenCalled()

    mockDeployIsLoading = false
    rerender(<DeployByVersionModal environment={mockEnvironment} />)
    expect(mockSetModalDismissible).toHaveBeenLastCalledWith(true)
  })

  it('does not show services without selectable versions', () => {
    renderWithProviders(<DeployByVersionModal environment={mockEnvironment} />)

    expect(screen.getAllByTestId('service-version-row')).toHaveLength(2)
    expect(screen.queryByText('Unavailable service')).not.toBeInTheDocument()
  })

  it('groups the header and service sections in the modal padded content area', () => {
    renderWithProviders(<DeployByVersionModal environment={mockEnvironment} />)

    const modalMainContent = screen.getByTestId('modal-main-content')

    expect(modalMainContent).toHaveClass('p-6')
    expect(modalMainContent).toContainElement(screen.getByRole('heading', { name: 'Deploy by version' }))
    expect(modalMainContent).toContainElement(screen.getByText('1 outdated service'))
    expect(modalMainContent).toContainElement(screen.getByText('1 up to date service'))
    expect(screen.queryByTestId('scroll-shadow-wrapper')).not.toBeInTheDocument()
    expect(screen.queryByTestId('scroll-shadow-bottom')).not.toBeInTheDocument()
  })

  it('shows an error when every version lookup failed', () => {
    mockServices = [unavailableService]

    renderWithProviders(<DeployByVersionModal environment={mockEnvironment} />)

    expect(screen.getByText('Service versions could not be loaded.')).toBeInTheDocument()
    expect(screen.queryByText('Unavailable service')).not.toBeInTheDocument()
  })

  it('renders the dedicated empty state when only excluded services remain', () => {
    mockServices = []

    renderWithProviders(<DeployByVersionModal environment={mockEnvironment} />)

    expect(screen.getByText('No services support version selection.')).toBeInTheDocument()
  })
})
