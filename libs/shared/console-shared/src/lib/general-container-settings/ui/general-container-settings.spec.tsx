import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import selectEvent from 'react-select-event'
import { organizationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import GeneralContainerSettings from './general-container-settings'

const mockOrganization = organizationFactoryMock(1)[0]

jest.mock('@qovery/domains/organizations/feature', () => ({
  ...jest.requireActual('@qovery/domains/organizations/feature'),
  useContainerVersions: () => ({
    data: [
      {
        image_name: 'my-image',
        versions: ['1.1.0', '2.0.0', '3.0.0'],
      },
    ],
  }),
  useContainerRegistries: () => ({
    data: [
      {
        id: '0',
        created_at: '2022-07-21T09:59:42.01426Z',
        updated_at: '2022-07-21T09:59:42.01426Z',
        kind: 'DOCKER_HUB',
        name: 'my-registry',
      },
    ],
  }),
}))

describe('CreateGeneralContainer', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<GeneralContainerSettings />))
    expect(baseElement).toBeTruthy()
  })

  it('should render default inputs', () => {
    renderWithProviders(wrapWithReactHookForm(<GeneralContainerSettings />))
    screen.getByTestId('input-select-registry')
    screen.getByTestId('input-text-image-name')
  })

  it('should render image tag input', async () => {
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(<GeneralContainerSettings organization={mockOrganization} />)
    )
    await selectEvent.select(screen.getByLabelText('Registry'), ['my-registry'])
    await userEvent.type(screen.getByTestId('input-text-image-name'), 'my-image')
    const imageTag = await screen.findByTestId('input-text-image-tag')
    expect(imageTag).toBeInTheDocument()
  })
})
