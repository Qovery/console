import { EnvironmentModeEnum } from 'qovery-typescript-axios'
import selectEvent from 'react-select-event'
import * as clustersDomain from '@qovery/domains/clusters/feature'
import * as environmentDomains from '@qovery/domains/environment'
import { clusterFactoryMock, environmentFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import CreateCloneEnvironmentModalFeature, {
  type CreateCloneEnvironmentModalFeatureProps,
} from './create-clone-environment-modal-feature'

let props: CreateCloneEnvironmentModalFeatureProps

const useClustersMockSpy = jest.spyOn(clustersDomain, 'useClusters') as jest.Mock
const useCreateEnvironmentMockSpy = jest.spyOn(environmentDomains, 'useCreateEnvironment') as jest.Mock
const useCloneEnvironmentMockSpy = jest.spyOn(environmentDomains, 'useCloneEnvironment') as jest.Mock

const mockClusters = clusterFactoryMock(3)

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
    useClustersMockSpy.mockReturnValue({
      data: mockClusters,
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<CreateCloneEnvironmentModalFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })

  describe('creation mode', function () {
    it('should submit form on click on button', async () => {
      const { userEvent } = renderWithProviders(<CreateCloneEnvironmentModalFeature {...props} />)

      const input = screen.getByTestId('input-text')

      await userEvent.type(input, 'test')

      await selectEvent.select(screen.getByLabelText('Cluster'), mockClusters[2].name, {
        container: document.body,
      })

      await selectEvent.select(screen.getByLabelText('Type'), 'Staging', { container: document.body })

      const submitButton = screen.getByTestId('submit-button')
      await userEvent.click(submitButton)

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
      const { userEvent } = renderWithProviders(
        <CreateCloneEnvironmentModalFeature {...props} environmentToClone={mockEnv} />
      )

      const inputs = screen.getAllByTestId('input-text')

      await userEvent.clear(inputs[1])
      await userEvent.type(inputs[1], 'test')

      await selectEvent.select(screen.getByLabelText('Cluster'), mockClusters[2].name, {
        container: document.body,
      })

      await selectEvent.select(screen.getByLabelText('Type'), 'Staging', { container: document.body })

      const submitButton = screen.getByTestId('submit-button')
      await userEvent.click(submitButton)

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
