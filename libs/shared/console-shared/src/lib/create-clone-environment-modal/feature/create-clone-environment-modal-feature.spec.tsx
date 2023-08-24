import { act, fireEvent, getAllByTestId, getByLabelText, getByTestId, render } from '__tests__/utils/setup-jest'
import { EnvironmentModeEnum } from 'qovery-typescript-axios'
import selectEvent from 'react-select-event'
import * as environmentDomains from '@qovery/domains/environment'
import { clusterFactoryMock, environmentFactoryMock } from '@qovery/shared/factories'
import CreateCloneEnvironmentModalFeature, {
  type CreateCloneEnvironmentModalFeatureProps,
} from './create-clone-environment-modal-feature'

let props: CreateCloneEnvironmentModalFeatureProps

const useCreateEnvironmentMockSpy = jest.spyOn(environmentDomains, 'useCreateEnvironment') as jest.Mock
const useCloneEnvironmentMockSpy = jest.spyOn(environmentDomains, 'useCloneEnvironment') as jest.Mock

const mockClusters = clusterFactoryMock(3)
jest.mock('@qovery/domains/organization', () => ({
  ...jest.requireActual('@qovery/domains/organization'),
  selectClustersEntitiesByOrganizationId: () => mockClusters,
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ projectId: '1', organizationId: '0' }),
}))

describe('CreateCloneEnvironmentModalFeature', () => {
  beforeEach(() => {
    props = {
      onClose: jest.fn(),
      environmentToClone: undefined,
      organizationId: '0',
      projectId: '1',
    }

    useCreateEnvironmentMockSpy.mockReturnValue({
      mutate: jest.fn(),
    })
  })

  it('should render successfully', () => {
    const { baseElement } = render(<CreateCloneEnvironmentModalFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })

  describe('creation mode', function () {
    it('should submit form on click on button', async () => {
      const { baseElement } = render(<CreateCloneEnvironmentModalFeature {...props} />)

      const input = getByTestId(baseElement, 'input-text')

      await act(async () => {
        fireEvent.input(input, { target: { value: 'test' } })
      })

      await selectEvent.select(getByLabelText(baseElement, 'Cluster'), mockClusters[2].name, {
        container: document.body,
      })

      await selectEvent.select(getByLabelText(baseElement, 'Type'), 'Staging', { container: document.body })

      const submitButton = getByTestId(baseElement, 'submit-button')
      await act(async () => {
        fireEvent.click(submitButton)
      })

      expect(useCreateEnvironmentMockSpy().mutate).toHaveBeenCalledWith({
        projectId: '1',
        data: {
          cluster: mockClusters[2].id,
          mode: EnvironmentModeEnum.STAGING,
          name: 'test',
        },
      })
    })
  })

  describe('cloning mode', function () {
    it('should submit form on click on button', async () => {
      useCloneEnvironmentMockSpy.mockReturnValue({
        mutate: jest.fn(),
      })

      const mockEnv = environmentFactoryMock(1)[0]
      const { baseElement } = render(<CreateCloneEnvironmentModalFeature {...props} environmentToClone={mockEnv} />)

      const inputs = getAllByTestId(baseElement, 'input-text')

      await act(async () => {
        fireEvent.input(inputs[1], { target: { value: 'test' } })
      })

      await selectEvent.select(getByLabelText(baseElement, 'Cluster'), mockClusters[2].name, {
        container: document.body,
      })

      await selectEvent.select(getByLabelText(baseElement, 'Type'), 'Staging', { container: document.body })

      const submitButton = getByTestId(baseElement, 'submit-button')
      await act(async () => {
        fireEvent.click(submitButton)
      })

      expect(useCloneEnvironmentMockSpy().mutate).toHaveBeenCalledWith({
        environmentId: mockEnv.id,
        data: {
          cluster_id: mockClusters[2].id,
          mode: EnvironmentModeEnum.STAGING,
          name: 'test',
        },
      })
    })
  })
})
