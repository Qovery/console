import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import selectEvent from 'react-select-event'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import ClusterCredentialsSettings, { type ClusterCredentialsSettingsProps } from './cluster-credentials-settings'

describe('ClusterCredentialsSettings', () => {
  const props: ClusterCredentialsSettingsProps = {
    credentials: [
      {
        name: 'my-credential',
        id: '000-000-000',
      },
    ],
    openCredentialsModal: jest.fn(),
    loading: true,
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<ClusterCredentialsSettings {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should have loader', () => {
    renderWithProviders(wrapWithReactHookForm(<ClusterCredentialsSettings {...props} />))
    screen.getByTestId('spinner')
  })

  it('should submit the form on click', async () => {
    props.loading = false

    renderWithProviders(
      wrapWithReactHookForm(<ClusterCredentialsSettings {...props} />, {
        defaultValues: {
          credentials: '0',
        },
      })
    )

    const realSelect = screen.getByLabelText('Credentials')
    await selectEvent.select(realSelect, ['my-credential'])

    screen.getByTestId('input-credentials')
    screen.getAllByDisplayValue('000-000-000')
  })
})
