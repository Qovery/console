import { CustomDomainStatusEnum, StateEnum } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { PageSettingsDomains, type PageSettingsDomainsProps, hasPublicPort } from './page-settings-domains'

let props: PageSettingsDomainsProps

let mockLinks = [
  {
    url: 'https://p80-z8e0035d9-zb93218f1-gtw.zc531a994.rustrocks.cloud',
    internal_port: 80,
    external_port: 443,
    is_qovery_domain: true,
    is_default: false,
  },
  {
    url: 'https://z8e0035d9-zb93218f1-gtw.zc531a994.rustrocks.cloud',
    internal_port: 80,
    external_port: 443,
    is_qovery_domain: true,
    is_default: true,
  },
]
jest.mock('@qovery/domains/services/feature', () => ({
  ...jest.requireActual('@qovery/domains/services/feature'),
  useLinks: () => ({
    data: mockLinks,
    isLoading: false,
  }),
}))

describe('hasPublicPort', () => {
  it('should return true when ingressDeploymentStatus is DEPLOYED', () => {
    expect(hasPublicPort(StateEnum.DEPLOYED)).toBe(true)
  })

  it('should return true when ingressDeploymentStatus is WAITING_RUNNING', () => {
    expect(hasPublicPort(StateEnum.WAITING_RUNNING)).toBe(true)
  })

  it('should return false when ingressDeploymentStatus is anything else', () => {
    expect(hasPublicPort(StateEnum.BUILDING)).toBe(false)
    expect(hasPublicPort(StateEnum.BUILD_ERROR)).toBe(false)
    expect(hasPublicPort(StateEnum.CANCELED)).toBe(false)
    expect(hasPublicPort(StateEnum.CANCELING)).toBe(false)
    expect(hasPublicPort(StateEnum.DELETED)).toBe(false)
    expect(hasPublicPort(StateEnum.DELETE_ERROR)).toBe(false)
    expect(hasPublicPort(StateEnum.DELETE_QUEUED)).toBe(false)
    expect(hasPublicPort(StateEnum.DELETING)).toBe(false)
    expect(hasPublicPort(StateEnum.DEPLOYING)).toBe(false)
    expect(hasPublicPort(StateEnum.DEPLOYMENT_ERROR)).toBe(false)
    expect(hasPublicPort(StateEnum.DEPLOYMENT_QUEUED)).toBe(false)
    expect(hasPublicPort(StateEnum.QUEUED)).toBe(false)
    expect(hasPublicPort(StateEnum.READY)).toBe(false)
    expect(hasPublicPort(StateEnum.RECAP)).toBe(false)
    expect(hasPublicPort(StateEnum.RESTARTED)).toBe(false)
    expect(hasPublicPort(StateEnum.RESTARTING)).toBe(false)
    expect(hasPublicPort(StateEnum.RESTART_ERROR)).toBe(false)
    expect(hasPublicPort(StateEnum.RESTART_QUEUED)).toBe(false)
    expect(hasPublicPort(StateEnum.STOPPED)).toBe(false)
    expect(hasPublicPort(StateEnum.STOPPING)).toBe(false)
    expect(hasPublicPort(StateEnum.STOP_ERROR)).toBe(false)
    expect(hasPublicPort(StateEnum.STOP_QUEUED)).toBe(false)
    expect(hasPublicPort(StateEnum.WAITING_DELETING)).toBe(false)
    expect(hasPublicPort(StateEnum.WAITING_RESTARTING)).toBe(false)
    expect(hasPublicPort(StateEnum.WAITING_STOPPING)).toBe(false)
  })
})

describe('PageSettingsDomains', () => {
  beforeEach(() => {
    props = {
      onAddDomain: jest.fn(),
      onDelete: jest.fn(),
      onEdit: jest.fn(),
      domains: [],
    }
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageSettingsDomains {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render the placeholder if no domains found', () => {
    renderWithProviders(<PageSettingsDomains {...props} />)
    screen.findByText('No domains are set')
  })

  it('should render an add button and handle its click', async () => {
    const spy = jest.fn()
    props.onAddDomain = spy
    const { userEvent } = renderWithProviders(<PageSettingsDomains {...props} />)
    const button = screen.getByRole('button', { name: 'Add Domain' })

    await userEvent.click(button)
    expect(spy).toHaveBeenCalled()
  })

  it('should render a list of domain', async () => {
    props.domains = [
      {
        id: '1',
        domain: 'example.com',
        status: CustomDomainStatusEnum.VALIDATION_PENDING,
        validation_domain: 'example.com',
        updated_at: '2020-01-01T00:00:00Z',
        created_at: '2020-01-01T00:00:00Z',
      },
      {
        id: '2',
        domain: 'example2.com',
        status: CustomDomainStatusEnum.VALIDATION_PENDING,
        validation_domain: 'example.com',
        updated_at: '2020-01-01T00:00:00Z',
        created_at: '2020-01-01T00:00:00Z',
      },
    ]
    renderWithProviders(<PageSettingsDomains {...props} />)

    screen.getByDisplayValue('example.com')
    screen.getByDisplayValue('example2.com')
  })

  it('should render a form row with one edit and one delete button', async () => {
    const customDomain = {
      id: '1',
      domain: 'example.com',
      status: CustomDomainStatusEnum.VALIDATION_PENDING,
      validation_domain: 'example.com',
      updated_at: '2020-01-01T00:00:00Z',
      created_at: '2020-01-01T00:00:00Z',
    }

    props.domains = [customDomain]
    const spyEdit = jest.fn()
    props.onEdit = spyEdit

    const spyDelete = jest.fn()
    props.onDelete = spyDelete

    const { userEvent } = renderWithProviders(<PageSettingsDomains {...props} />)

    const editButton = screen.getByTestId('edit-button')
    const deleteButton = screen.getByTestId('delete-button')

    await userEvent.click(editButton)
    await userEvent.click(deleteButton)

    expect(spyEdit).toHaveBeenCalledWith(customDomain)
    expect(spyDelete).toHaveBeenCalledWith(customDomain)
  })

  it('should show a loader', async () => {
    props.domains = []
    props.loading = true

    renderWithProviders(<PageSettingsDomains {...props} />)
    screen.getByTestId('spinner')
  })

  it('should not show a loader', async () => {
    props.domains = []
    props.loading = false

    renderWithProviders(<PageSettingsDomains {...props} />)
    expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
  })

  describe('with ingress deployment status', () => {
    describe('when the ingress is deployed', () => {
      it('should not show the deploy button but show the create public port button instead', () => {
        mockLinks = []
        props.domains = []
        props.loading = false
        renderWithProviders(<PageSettingsDomains {...props} />)
        expect(screen.queryByText('Deploy')).not.toBeInTheDocument()
        expect(screen.getByText('Create public port')).toBeInTheDocument()
      })
    })
  })
})
