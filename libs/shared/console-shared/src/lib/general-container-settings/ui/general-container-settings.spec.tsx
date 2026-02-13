import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import selectEvent from 'react-select-event'
import { organizationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { GeneralContainerSettings } from './general-container-settings'

const mockOrganization = organizationFactoryMock(1)[0]

jest.mock('@qovery/shared/util-hooks', () => ({
  useDebounce: () => 'my-custom-image',
}))

jest.mock('@qovery/domains/organizations/feature', () => ({
  ...jest.requireActual('@qovery/domains/organizations/feature'),
  useContainerImages: () => ({
    data: [
      {
        image_name: 'my-image',
        versions: [],
      },
    ],
    isFetching: false,
    refetch: () => Promise.resolve(),
  }),
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

  it('should render inputs available in the requests', async () => {
    renderWithProviders(wrapWithReactHookForm(<GeneralContainerSettings organization={mockOrganization} />))
    await selectEvent.select(screen.getByLabelText('Registry'), ['my-registry'])
    await selectEvent.select(screen.getByLabelText('Image name'), ['my-image'])
    await selectEvent.select(screen.getByLabelText('Image tag'), ['3.0.0'])
    expect(screen.getByText('Image name')).toBeInTheDocument()
    expect(screen.getByText('Image tag')).toBeInTheDocument()
    expect(screen.getAllByText('3.0.0').length).toBeGreaterThan(0)
  })

  it('should render inputs NOT available in the requests', async () => {
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(<GeneralContainerSettings organization={mockOrganization} />)
    )
    // Registry
    await selectEvent.select(screen.getByLabelText('Registry'), ['my-registry'])

    // Image name
    await userEvent.type(screen.getByLabelText('Image name'), 'my-custom-image{enter}')
    expect(screen.getByText('my-custom-image')).toBeInTheDocument()

    // Image tag
    await userEvent.type(screen.getByLabelText('Image tag'), '12.0.0')
    expect(screen.getByDisplayValue('12.0.0')).toBeInTheDocument()
  })
})
