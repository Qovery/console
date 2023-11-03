import * as projectsDomain from '@qovery/domains/projects/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import CreateProjectModalFeature, { type CreateProjectModalFeatureProps } from './create-project-modal-feature'

const useCreateProjectMockSpy = jest.spyOn(projectsDomain, 'useCreateProject') as jest.Mock

jest.mock('@tanstack/react-query', () => {
  const queryClient = {
    invalidateQueries: jest.fn(),
  }
  return {
    ...jest.requireActual('@tanstack/react-query'),
    useQueryClient: () => queryClient,
  }
})

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}))

const props: CreateProjectModalFeatureProps = {
  onClose: jest.fn(),
  organizationId: '0',
}

describe('CreateProjectModalFeature', () => {
  beforeEach(() => {
    useCreateProjectMockSpy.mockReturnValue({
      mutateAsync: jest.fn(),
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<CreateProjectModalFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should createProject if form is submitted', async () => {
    const { userEvent } = renderWithProviders(<CreateProjectModalFeature {...props} />)

    const inputName = screen.getByTestId('input-name')
    await userEvent.type(inputName, 'hello-world')

    const inputDescription = screen.getByTestId('input-description')
    await userEvent.type(inputDescription, 'description')

    expect(screen.getByTestId('submit-button')).not.toBeDisabled()

    await userEvent.click(screen.getByTestId('submit-button'))

    expect(useCreateProjectMockSpy().mutateAsync).toHaveBeenCalledWith({
      organizationId: '0',
      projectRequest: {
        name: 'hello-world',
        description: 'description',
      },
    })
  })
})
