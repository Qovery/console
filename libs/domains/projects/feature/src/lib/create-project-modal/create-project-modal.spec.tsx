import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useCreateProject from '../hooks/use-create-project/use-create-project'
import CreateProjectModalFeature, { type CreateProjectModalProps } from './create-project-modal'

const useCreateProjectMockSpy = jest.spyOn(useCreateProject, 'useCreateProject') as jest.Mock

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}))

const props: CreateProjectModalProps = {
  onClose: jest.fn(),
  organizationId: '0',
}

describe('CreateProjectModalFeature', () => {
  beforeEach(() => {
    useCreateProjectMockSpy.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({ id: '1' }),
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

    expect(screen.getByTestId('submit-button')).toBeEnabled()

    await userEvent.click(screen.getByTestId('submit-button'))

    expect(useCreateProjectMockSpy().mutateAsync).toHaveBeenCalledWith({
      organizationId: '0',
      projectRequest: {
        name: 'hello-world',
        description: 'description',
      },
    })
  })

  it('should handle error when creating project', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => jest.fn())
    useCreateProjectMockSpy.mockReturnValue({
      mutateAsync: jest.fn().mockRejectedValue(new Error('Test error')),
    })

    const { userEvent } = renderWithProviders(<CreateProjectModalFeature {...props} />)

    const inputName = screen.getByTestId('input-name')
    await userEvent.type(inputName, 'hello-world')

    await userEvent.click(screen.getByTestId('submit-button'))

    expect(consoleErrorSpy).toHaveBeenCalled()
    consoleErrorSpy.mockRestore()
  })
})
