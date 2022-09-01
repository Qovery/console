import { act, fireEvent, getByTestId } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { EnvironmentModeEnum } from 'qovery-typescript-axios'
import * as storeEnvironment from '@console/domains/environment'
import { clusterFactoryMock } from '@console/domains/organization'
import { changeSelectValueByLabel } from '@console/shared/ui'
import CreateCloneEnvironmentModalFeature, {
  CreateCloneEnvironmentModalFeatureProps,
} from './create-clone-environment-modal-feature'

let props: CreateCloneEnvironmentModalFeatureProps

const mockClusters = clusterFactoryMock(3)
jest.mock('@console/domains/organization', () => ({
  ...jest.requireActual('@console/domains/organization'),
  selectClustersEntitiesByOrganizationId: () => mockClusters,
}))

jest.mock('@console/domains/environment', () => ({
  ...jest.requireActual('@console/domains/environment'),
  cloneEnvironment: jest.fn(),
  createEnvironment: jest.fn().mockImplementation(() => Promise.resolve()),
}))

jest.mock('react-router', () => ({
  ...(jest.requireActual('react-router') as any),
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

      await changeSelectValueByLabel(baseElement, 'input-select-cluster', mockClusters[2].name)

      const submitButton = getByTestId(baseElement, 'submit-button')
      await act(async () => {
        fireEvent.click(submitButton)
      })

      expect(spy).toHaveBeenCalledWith({
        projectId: '1',
        environmentRequest: {
          cluster_id: mockClusters[2].id,
          mode: EnvironmentModeEnum.STAGING,
          name: 'test',
        },
      })
    })
  })
})
