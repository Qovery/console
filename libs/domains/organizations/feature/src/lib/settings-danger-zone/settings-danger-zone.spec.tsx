import { type Organization } from 'qovery-typescript-axios'
import { organizationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
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
    jest.clearAllMocks()

    useDeleteOrganizationMock.mockReturnValue({
      mutateAsync: jest.fn(),
      isLoading: false,
    } as unknown as ReturnType<typeof useDeleteOrganization>)

    useOrganizationMock.mockReturnValue({
      data: mockOrganization,
    } as unknown as ReturnType<typeof useOrganization>)

    useOrganizationsMock.mockReturnValue({
      data: [mockOrganization],
    } as unknown as ReturnType<typeof useOrganizations>)
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<SettingsDangerZone />)
    expect(baseElement).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Delete organization' })).toBeInTheDocument()
  })
})
