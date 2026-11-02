import * as utilHooks from '@qovery/shared/util-hooks'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { useClusterStatus } from '../hooks/use-cluster-status/use-cluster-status'
import { useCluster } from '../hooks/use-cluster/use-cluster'
import { ClusterWideCredentialsBanner } from './cluster-wide-credentials-banner'

jest.mock('../hooks/use-cluster/use-cluster')
jest.mock('../hooks/use-cluster-status/use-cluster-status')
jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'org-123', clusterId: 'cluster-123' }),
}))

const mockUseCluster = useCluster as jest.Mock
const mockUseClusterStatus = useClusterStatus as jest.Mock
const useCopyToClipboardMockSpy = jest.spyOn(utilHooks, 'useCopyToClipboard') as jest.Mock
const mockCopyToClipboard = jest.fn()
const mockOnSubmit = jest.fn()

const renderBanner = () =>
  renderWithProviders(
    <form
      onSubmit={(event) => {
        event.preventDefault()
        mockOnSubmit()
      }}
    >
      <ClusterWideCredentialsBanner />
      <button type="submit">Save settings</button>
    </form>
  )

describe('ClusterWideCredentialsBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseCluster.mockReturnValue({ data: { wide_permissions: { require_wide_access_to_deploy: true } } })
    mockUseClusterStatus.mockReturnValue({ data: { status: 'DEPLOYED' }, isLoading: false, isSuccess: true })
    useCopyToClipboardMockSpy.mockReturnValue([null, mockCopyToClipboard])
  })

  it.each([false, undefined])('should hide the banner when wide access is %s', (required) => {
    mockUseCluster.mockReturnValue({ data: { wide_permissions: { require_wide_access_to_deploy: required } } })
    renderBanner()

    expect(screen.queryByText('Extended credentials required')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'View instructions' })).not.toBeInTheDocument()
  })

  it('should hide the banner while the cluster is loading', () => {
    mockUseCluster.mockReturnValue({ data: undefined })
    renderBanner()

    expect(screen.queryByText('Extended credentials required')).not.toBeInTheDocument()
  })

  it('should hide the banner while the cluster is deploying', () => {
    mockUseClusterStatus.mockReturnValue({ data: { status: 'DEPLOYING' }, isLoading: false, isSuccess: true })
    renderBanner()

    expect(screen.queryByRole('button', { name: 'View instructions' })).not.toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: 'Required IAM trust policy' })).not.toBeInTheDocument()
  })

  it('should wait for the deployment status before showing the banner', () => {
    mockUseClusterStatus.mockReturnValue({ data: undefined, isLoading: true, isSuccess: false })
    renderBanner()

    expect(screen.queryByRole('button', { name: 'View instructions' })).not.toBeInTheDocument()
  })

  it.each([
    { data: undefined, isLoading: false, isSuccess: false, isError: true },
    { data: { status: 'DEPLOYED' }, isLoading: false, isSuccess: false, isError: true },
    { data: undefined, isLoading: false, isSuccess: true, isError: false },
    { data: {}, isLoading: false, isSuccess: true, isError: false },
  ])('should hide the banner without a confirmed deployment status (%j)', (status) => {
    mockUseClusterStatus.mockReturnValue(status)
    renderBanner()

    expect(screen.queryByText('Extended credentials required')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'View instructions' })).not.toBeInTheDocument()
  })

  it('should open the existing instructions modal and copy the organization-specific policy without submitting', async () => {
    const { userEvent } = renderBanner()

    expect(screen.getByText('Extended credentials required')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'View instructions' }))

    expect(await screen.findByRole('dialog', { name: 'Allow Qovery access' })).toBeInTheDocument()
    expect(screen.getByText(/Allow Qovery to assume/)).toBeInTheDocument()
    const policy = screen.getByRole('textbox', { name: 'Required IAM trust policy' }) as HTMLTextAreaElement
    expect(policy).toHaveAttribute('readonly')
    expect(policy).toHaveClass('font-code')
    expect(JSON.parse(policy.value)).toEqual({
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: {
            AWS: ['arn:aws:iam::283389881690:user/qovery-deployer', 'arn:aws:iam::283389881690:role/qovery-deployer'],
          },
          Action: 'sts:AssumeRole',
          Condition: { StringLike: { 'sts:ExternalId': 'org-123:*' } },
        },
      ],
    })

    await userEvent.click(screen.getByRole('button', { name: 'Copy' }))

    expect(mockCopyToClipboard).toHaveBeenCalledWith(policy.value)
    expect(mockOnSubmit).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: 'Close' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('should open the instructions with the keyboard and dismiss them with Escape', async () => {
    const { userEvent } = renderBanner()
    screen.getByRole('button', { name: 'View instructions' }).focus()

    await userEvent.keyboard('{Enter}')

    expect(await screen.findByRole('dialog', { name: 'Allow Qovery access' })).toBeInTheDocument()

    await userEvent.keyboard('{Escape}')

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })
})
