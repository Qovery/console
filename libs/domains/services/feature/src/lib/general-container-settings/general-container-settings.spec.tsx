import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import selectEvent from 'react-select-event'
import { organizationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { GeneralContainerSettings } from './general-container-settings'

const mockOrganization = organizationFactoryMock(1)[0]

jest.mock('@qovery/shared/util-hooks', () => ({
  useDebounce: () => 'my-custom-image',
}))

jest.mock('../hooks/use-container-registries/use-container-registries', () => ({
  useContainerRegistries: () => ({
    data: [
      {
        id: '0',
        created_at: '2022-07-21T09:59:42.01426Z',
        updated_at: '2022-07-21T09:59:42.01426Z',
        kind: 'DOCKER_HUB',
        name: 'my-registry',
      },
      {
        id: '1',
        created_at: '2022-07-21T09:59:42.01426Z',
        updated_at: '2022-07-21T09:59:42.01426Z',
        kind: 'ECR',
        name: 'my-ecr-registry',
      },
    ],
  }),
}))

jest.mock('../hooks/use-container-images/use-container-images', () => ({
  useContainerImages: ({ containerRegistryId }: { containerRegistryId: string }) => {
    const dataByRegistry: Record<string, { image_name: string; versions: string[] }[]> = {
      '0': [{ image_name: 'my-image', versions: [] }],
      '1': [{ image_name: 'my-ecr-image', versions: [] }],
    }
    return {
      data: dataByRegistry[containerRegistryId] ?? [],
      isFetching: false,
      refetch: () => Promise.resolve(),
    }
  },
}))

jest.mock('../hooks/use-container-versions/use-container-versions', () => ({
  useContainerVersions: () => ({
    data: [
      {
        image_name: 'my-image',
        versions: ['1.1.0', '2.0.0', '3.0.0'],
      },
    ],
  }),
}))

const defaultProps = {
  organizationId: mockOrganization.id,
  openContainerRegistryCreateEditModal: jest.fn(),
}

describe('CreateGeneralContainer', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<GeneralContainerSettings {...defaultProps} />))
    expect(baseElement).toBeTruthy()
  })

  it('should render inputs available in the requests', async () => {
    renderWithProviders(wrapWithReactHookForm(<GeneralContainerSettings {...defaultProps} />))
    await selectEvent.select(screen.getByLabelText('Registry'), ['my-registry'])
    await selectEvent.select(screen.getByLabelText('Image name'), ['my-image'])
    await selectEvent.select(screen.getByLabelText('Image tag'), ['3.0.0'])
    expect(screen.getByText('Image name')).toBeInTheDocument()
    expect(screen.getByText('Image tag')).toBeInTheDocument()
    expect(screen.getAllByText('3.0.0').length).toBeGreaterThan(0)
  })

  it('should render inputs NOT available in the requests', async () => {
    const { userEvent } = renderWithProviders(wrapWithReactHookForm(<GeneralContainerSettings {...defaultProps} />))
    // Registry
    await selectEvent.select(screen.getByLabelText('Registry'), ['my-registry'])

    // Image name
    await userEvent.type(screen.getByLabelText('Image name'), 'my-custom-image{enter}')
    expect(screen.getByText('my-custom-image')).toBeInTheDocument()

    // Image tag
    await userEvent.type(screen.getByLabelText('Image tag'), '12.0.0')
    expect(screen.getByDisplayValue('12.0.0')).toBeInTheDocument()
  })

  it('should reset image name and tag when registry changes', async () => {
    const defaultValues = {
      registry: '0',
      image_name: 'my-image',
      image_tag: '1.1.0',
    }

    renderWithProviders(
      wrapWithReactHookForm(<GeneralContainerSettings {...defaultProps} />, {
        defaultValues,
      })
    )

    expect(screen.getByText('my-image')).toBeInTheDocument()
    expect(screen.getByText('1.1.0')).toBeInTheDocument()

    await selectEvent.select(screen.getByLabelText('Registry'), ['my-ecr-registry'])

    expect(screen.queryByText('my-image')).not.toBeInTheDocument()
    expect(screen.queryByText('1.1.0')).not.toBeInTheDocument()
  })

  it('should show image list from the selected registry only', async () => {
    const { userEvent } = renderWithProviders(wrapWithReactHookForm(<GeneralContainerSettings {...defaultProps} />))

    await selectEvent.select(screen.getByLabelText('Registry'), ['my-registry'])
    await userEvent.click(screen.getByLabelText('Image name'))
    expect(screen.getByText('my-image')).toBeInTheDocument()
    expect(screen.queryByText('my-ecr-image')).not.toBeInTheDocument()

    await selectEvent.select(screen.getByLabelText('Registry'), ['my-ecr-registry'])
    await userEvent.click(screen.getByLabelText('Image name'))
    expect(screen.getByText('my-ecr-image')).toBeInTheDocument()
    expect(screen.queryByText('my-image')).not.toBeInTheDocument()
  })
})
