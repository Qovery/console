import {
  act,
  fireEvent,
  getByDisplayValue,
  getByLabelText,
  getByTestId,
  getByText,
  waitFor,
} from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { KubernetesEnum } from 'qovery-typescript-axios'
import * as storeOrganization from '@qovery/domains/organization'
import { clusterFactoryMock } from '@qovery/shared/factories'
import { ClusterEntity } from '@qovery/shared/interfaces'
import PageSettingsResourcesFeature, { handleSubmit } from './page-settings-resources-feature'

import SpyInstance = jest.SpyInstance

const mockInstanceType = [
  {
    name: 't2.micro',
    cpu: 1,
    ram_in_gb: 1,
    type: 't2.micro',
    architecture: 'arm64',
  },
  {
    name: 't2.small',
    cpu: 1,
    ram_in_gb: 2,
    type: 't2.small',
    architecture: 'arm64',
  },
  {
    name: 't2.medium',
    cpu: 2,
    ram_in_gb: 4,
    type: 't2.medium',
    architecture: 'x86_64',
  },
]

jest.mock('@qovery/domains/organization', () => ({
  ...jest.requireActual('@qovery/domains/organization'),
  fetchAvailableInstanceTypes: jest.fn(),
}))

const mockCluster: ClusterEntity = clusterFactoryMock(1)[0]
mockCluster.kubernetes = KubernetesEnum.MANAGED
mockCluster.instance_type = 't2.micro'
jest.mock('@qovery/domains/organization', () => {
  return {
    ...jest.requireActual('@qovery/domains/organization'),
    editCluster: jest.fn(),
    getClusterState: () => ({
      loadingStatus: 'loaded',
      ids: [mockCluster.id],
      entities: {
        [mockCluster.id]: mockCluster,
      },
      error: null,
    }),
    selectClusterById: () => mockCluster,
    selectInstancesTypes: () => mockInstanceType,
  }
})

const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useParams: () => ({ organizationId: '0', clusterId: mockCluster.id }),
}))

describe('PageSettingsResourcesFeature', () => {
  beforeEach(() => {
    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          results: [...mockInstanceType],
        }),
    }))
  })

  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsResourcesFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should init the value in the inputs', async () => {
    const { baseElement } = render(<PageSettingsResourcesFeature />)

    getByDisplayValue(baseElement, mockCluster.disk_size?.toString() || '')
    getByText(baseElement, `min ${mockCluster?.min_running_nodes} - max ${mockCluster?.max_running_nodes}`)

    await waitFor(() => {
      getByText(baseElement, 't2.micro (1CPU - 1GB RAM - arm64)')
    })
  })

  it('should submit the values', async () => {
    const editClusterSpy: SpyInstance = jest.spyOn(storeOrganization, 'editCluster')
    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          data: {},
        }),
    }))
    const { baseElement } = render(<PageSettingsResourcesFeature />)
    const button = getByTestId(baseElement, 'submit-button')

    expect(button).toBeDisabled()

    const input = getByLabelText(baseElement, 'Disk size (GB)')
    await act(() => {
      fireEvent.input(input, { target: { value: 24 } })
    })

    await waitFor(() => {
      expect(button).not.toBeDisabled()
    })

    const cloneCluster = handleSubmit(
      {
        disk_size: '24',
        nodes: [mockCluster.min_running_nodes, mockCluster.max_running_nodes],
        instance_type: 't2.micro',
      },
      mockCluster
    )

    await waitFor(() => {
      button.click()

      expect(editClusterSpy.mock.calls[0][0].organizationId).toStrictEqual('0')
      expect(editClusterSpy.mock.calls[0][0].clusterId).toStrictEqual(mockCluster.id)
      expect(editClusterSpy.mock.calls[0][0].data).toStrictEqual(cloneCluster)
    })
  })
})
