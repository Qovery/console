import { act, fireEvent, render } from '__tests__/utils/setup-jest'
import * as storeProjects from '@qovery/domains/projects'
import CreateProjectModalFeature, { CreateProjectModalFeatureProps } from './create-project-modal-feature'

import SpyInstance = jest.SpyInstance

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useNavigate: () => mockedUsedNavigate,
}))

jest.mock('@qovery/domains/projects', () => ({
  ...jest.requireActual('@qovery/domains/projects'),
  postProject: jest.fn().mockImplementation(() => Promise.resolve()),
}))

const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

describe('CreateProjectModalFeature', () => {
  const props: CreateProjectModalFeatureProps = {
    onClose: jest.fn(),
    organizationId: '0',
    goToEnvironment: false,
  }

  it('should render successfully', () => {
    const { baseElement } = render(<CreateProjectModalFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should dispatch postProject if form is submitted', async () => {
    const postProjectSpy: SpyInstance = jest.spyOn(storeProjects, 'postProject')
    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          data: {},
        }),
    }))

    const { getByTestId } = render(<CreateProjectModalFeature {...props} />)

    await act(() => {
      const inputName = getByTestId('input-name')
      fireEvent.input(inputName, { target: { value: 'hello-world' } })
    })

    await act(() => {
      const inputName = getByTestId('input-description')
      fireEvent.input(inputName, { target: { value: 'description' } })
    })

    expect(getByTestId('submit-button')).not.toBeDisabled()

    await act(() => {
      getByTestId('submit-button').click()
    })

    expect(postProjectSpy).toHaveBeenCalledWith({
      name: 'hello-world',
      description: 'description',
      organizationId: '0',
    })
  })
})
