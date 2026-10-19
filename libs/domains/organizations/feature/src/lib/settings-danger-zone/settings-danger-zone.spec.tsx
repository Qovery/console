import { type Organization } from 'qovery-typescript-axios'
import { organizationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { useDeleteOrganization } from '../hooks/use-delete-organization/use-delete-organization'
import { useOrganization } from '../hooks/use-organization/use-organization'
import { useOrganizations } from '../hooks/use-organizations/use-organizations'
import {
  PageOrganizationDangerZone,
  type PageOrganizationDangerZoneProps,
  SettingsDangerZone,
} from './settings-danger-zone'

jest.mock('../hooks/use-delete-organization/use-delete-organization')
jest.mock('../hooks/use-organization/use-organization')
jest.mock('../hooks/use-organizations/use-organizations')

const mockNavigate = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ organizationId: '0' }),
}))

const mockOrganization: Organization = organizationFactoryMock(1)[0]

describe('PageOrganizationDangerZone', () => {
  const props: PageOrganizationDangerZoneProps = {
    deleteOrganization: jest.fn(),
    loading: false,
    organization: mockOrganization,
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageOrganizationDangerZone {...props} />)
    expect(baseElement).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Delete organization' })).toBeInTheDocument()
  })
})

describe('SettingsDangerZone', () => {
  const useDeleteOrganizationMock = useDeleteOrganization as jest.MockedFunction<typeof useDeleteOrganization>
  const useOrganizationMock = useOrganization as jest.MockedFunction<typeof useOrganization>
  const useOrganizationsMock = useOrganizations as jest.MockedFunction<typeof useOrganizations>

  beforeEach(() => {
    jest.useFakeTimers()
    localStorage.clear()
    jest.clearAllMocks()

    useDeleteOrganizationMock.mockReturnValue({
      mutateAsync: jest.fn(),
      isLoading: false,
    } as unknown as ReturnType<typeof useDeleteOrganization>)

    useOrganizationMock.mockReturnValue({
      data: mockOrganization,
    } as unknown as ReturnType<typeof useOrganization>)

    useOrganizationsMock.mockReturnValue({
      data: [{ ...mockOrganization, id: '0' }],
    } as unknown as ReturnType<typeof useOrganizations>)
  })

  afterEach(() => jest.useRealTimers())

  it('returns to the profile step only after the last organization has been deleted', async () => {
    let finishDeletion: () => void = () => undefined
    const deleteOrganization = jest.fn().mockReturnValue(
      new Promise<void>((resolve) => {
        finishDeletion = resolve
      })
    )
    useDeleteOrganizationMock.mockReturnValue({
      mutateAsync: deleteOrganization,
      isLoading: false,
    } as unknown as ReturnType<typeof useDeleteOrganization>)
    localStorage.setItem('currentOrganizationId', '0')
    localStorage.setItem('currentProjectId', 'old-project')
    const { userEvent } = renderWithProviders(<SettingsDangerZone />)
    await userEvent.click(screen.getByRole('button', { name: 'Delete organization' }))
    await userEvent.type(screen.getByPlaceholderText('Enter "delete"'), 'delete')
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    await waitFor(() => expect(deleteOrganization).toHaveBeenCalledWith({ organizationId: '0' }))
    expect(mockNavigate).not.toHaveBeenCalled()

    finishDeletion()

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith({ to: '/onboarding/personalize', replace: true }))
    expect(localStorage.getItem('currentOrganizationId')).toBeNull()
    expect(localStorage.getItem('currentProjectId')).toBeNull()
  })

  it('opens a remaining organization when another one is still available', async () => {
    useDeleteOrganizationMock.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue(undefined),
      isLoading: false,
    } as unknown as ReturnType<typeof useDeleteOrganization>)
    useOrganizationsMock.mockReturnValue({
      data: [
        { ...mockOrganization, id: '0' },
        { ...mockOrganization, id: 'remaining-org' },
      ],
    } as unknown as ReturnType<typeof useOrganizations>)
    const { userEvent } = renderWithProviders(<SettingsDangerZone />)
    await userEvent.click(screen.getByRole('button', { name: 'Delete organization' }))
    await userEvent.type(screen.getByPlaceholderText('Enter "delete"'), 'delete')
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/organization/$organizationId/overview',
        params: { organizationId: 'remaining-org' },
      })
    )
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<SettingsDangerZone />)
    expect(baseElement).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Delete organization' })).toBeInTheDocument()
  })
})
