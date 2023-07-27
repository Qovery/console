import { render, waitFor } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import selectEvent from 'react-select-event'
import { organizationFactoryMock } from '@qovery/shared/factories'
import { OrganizationEntity } from '@qovery/shared/interfaces'
import ClusterCredentialsSettings, { ClusterCredentialsSettingsProps } from './cluster-credentials-settings'

const mockOrganization: OrganizationEntity = organizationFactoryMock(1)[0]

describe('ClusterCredentialsSettings', () => {
  const props: ClusterCredentialsSettingsProps = {
    credentials: mockOrganization.credentials?.items,
    openCredentialsModal: jest.fn(),
    loadingStatus: 'not loaded',
  }

  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<ClusterCredentialsSettings {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should have loader', () => {
    const { getByTestId } = render(wrapWithReactHookForm(<ClusterCredentialsSettings {...props} />))
    getByTestId('spinner')
  })

  it('should submit the form on click', async () => {
    props.loadingStatus = 'loaded'

    const { getByLabelText, getByTestId, getAllByDisplayValue } = render(
      wrapWithReactHookForm(<ClusterCredentialsSettings {...props} />, {
        defaultValues: {
          credentials: '0',
        },
      })
    )

    const realSelect = getByLabelText('Credentials')
    const value = mockOrganization.credentials?.items?.[1].name || ''
    await selectEvent.select(realSelect, value)

    await waitFor(() => {
      getByTestId('input-credentials')
      getAllByDisplayValue('1')
    })
  })
})
