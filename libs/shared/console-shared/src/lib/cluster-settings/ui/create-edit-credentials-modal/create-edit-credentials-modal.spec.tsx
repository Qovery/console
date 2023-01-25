import { act, fireEvent, getAllByTestId, getByLabelText, getByTestId } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { EnvironmentModeEnum } from 'qovery-typescript-axios'
import selectEvent from 'react-select-event'
import * as storeEnvironment from '@qovery/domains/environment'
import { clusterFactoryMock, environmentFactoryMock } from '@qovery/shared/factories'
import CreateCloneEnvironmentModalFeature, {
  CreateCloneEnvironmentModalFeatureProps,
} from './create-clone-environment-modal-feature'

let props: CreateCloneEnvironmentModalFeatureProps

const mockClusters = clusterFactoryMock(3)
jest.mock('@qovery/domains/organization', () => ({
  ...jest.requireActual('@qovery/domains/organization'),
  selectClustersEntitiesByOrganizationId: () => mockClusters,
}))

jest.mock('@qovery/domains/environment', () => ({
  ...jest.requireActual('@qovery/domains/environment'),
  cloneEnvironment: jest.fn(),
  createEnvironment: jest.fn().mockImplementation(() => Promise.resolve()),
}))

jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useParams: () => ({ projectId: '1', organizationId: '0' }),
}))

const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

describe('CreateCloneEnvironmentModalFeature', () => {
  beforeEach(() => {
    props = {
      onClose: jest.fn(),
      environmentToClone: undefined,
      organizationId: '0',
      projectId: '1',
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('should render successfully', () => {
    const { baseElement } = render(<CreateCloneEnvironmentModalFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })

  describe('creation mode', function () {
    it('should submit form on click on button', async () => {
      // mock the dispatched function
      const spy = jest.spyOn(storeEnvironment, 'createEnvironment')
      mockDispatch.mockImplementation(() => ({
        unwrap: () =>
          Promise.resolve({
            data: {},
          }),
      }))

      const { baseElement } = render(<CreateCloneEnvironmentModalFeature {...props} />)

      const input = getByTestId(baseElement, 'input-text')

      await act(async () => {
        fireEvent.input(input, { target: { value: 'test' } })
      })

      await act(() => {
        selectEvent.select(getByLabelText(baseElement, 'Cluster'), mockClusters[2].name, {
          container: document.body,
        })
      })

      await act(() => {
        selectEvent.select(getByLabelText(baseElement, 'Type'), 'Staging', { container: document.body })
      })

      const submitButton = getByTestId(baseElement, 'submit-button')
      await act(async () => {
        fireEvent.click(submitButton)
      })

      expect(spy).toHaveBeenCalledWith({
        projectId: '1',
        environmentRequest: {
          cluster: mockClusters[2].id,
          mode: EnvironmentModeEnum.STAGING,
          name: 'test',
        },
      })
    })
  })

  describe('cloning mode', function () {
    it('should submit form on click on button', async () => {
      // mock the dispatched function
      const spy = jest.spyOn(storeEnvironment, 'cloneEnvironment')
      mockDispatch.mockImplementation(() => ({
        unwrap: () =>
          Promise.resolve({
            data: {},
          }),
      }))

      const mockEnv = environmentFactoryMock(1)[0]
      const { baseElement } = render(<CreateCloneEnvironmentModalFeature {...props} environmentToClone={mockEnv} />)

      const inputs = getAllByTestId(baseElement, 'input-text')

      await act(async () => {
        fireEvent.input(inputs[1], { target: { value: 'test' } })
      })

      await act(() => {
        selectEvent.select(getByLabelText(baseElement, 'Cluster'), mockClusters[2].name, {
          container: document.body,
        })
      })

      await act(() => {
        selectEvent.select(getByLabelText(baseElement, 'Type'), 'Staging', { container: document.body })
      })

      const submitButton = getByTestId(baseElement, 'submit-button')
      await act(async () => {
        fireEvent.click(submitButton)
      })

      expect(spy).toHaveBeenCalledWith({
        environmentId: mockEnv.id,
        cloneRequest: {
          cluster_id: mockClusters[2].id,
          mode: EnvironmentModeEnum.STAGING,
          name: 'test',
        },
      })
    })
  })
})
