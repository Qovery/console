import * as projectsDomain from '@qovery/domains/projects/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PageProjectGeneralFeature from './page-project-general-feature'

const useEditProjectMockSpy = jest.spyOn(projectsDomain, 'useEditProject') as jest.Mock

jest.mock('@qovery/domains/projects/feature', () => {
  return {
    ...jest.requireActual('@qovery/domains/projects/feature'),
    useProject: () => ({
      data: {
        name: 'name',
        description: 'description',
      },
    }),
  }
})

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: '0', projectId: '0' }),
}))

describe('PageProjectGeneral', () => {
  beforeEach(() => {
    useEditProjectMockSpy.mockReturnValue({
      mutateAsync: jest.fn(),
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageProjectGeneralFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should editProject if form is submitted', async () => {
    const { userEvent } = renderWithProviders(<PageProjectGeneralFeature />)

    const inputName = screen.getByTestId('input-name')
    await userEvent.clear(inputName)
    await userEvent.type(inputName, 'hello-world')

    expect(screen.getByTestId('submit-button')).toBeEnabled()

    await userEvent.click(screen.getByTestId('submit-button'))

    expect(useEditProjectMockSpy().mutateAsync).toHaveBeenCalledWith({
      projectId: '0',
      projectRequest: {
        name: 'hello-world',
        description: 'description',
      },
    })
  })
})
