import { act, fireEvent, render } from '__tests__/utils/setup-jest'
import * as storeProjects from '@qovery/project'
import PageProjectGeneralFeature from './page-project-general-feature'

import SpyInstance = jest.SpyInstance

jest.mock('@qovery/domains/projects', () => {
  return {
    ...jest.requireActual('@qovery/domains/projects'),
    editProject: jest.fn(),
  }
})

const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: '0', projectId: '0' }),
}))

describe('PageProjectGeneral', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageProjectGeneralFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should dispatch editProject if form is submitted', async () => {
    const editProjectSpy: SpyInstance = jest.spyOn(storeProjects, 'editProject')
    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          data: {},
        }),
    }))

    const { getByTestId } = render(<PageProjectGeneralFeature />)

    await act(() => {
      const inputName = getByTestId('input-name')
      fireEvent.input(inputName, { target: { value: 'hello-world' } })
    })

    expect(getByTestId('submit-button')).not.toBeDisabled()

    await act(() => {
      getByTestId('submit-button').click()
    })

    expect(editProjectSpy).toHaveBeenCalledWith({
      data: {
        name: 'hello-world',
        description: 'description',
      },
      projectId: '0',
    })
  })
})
