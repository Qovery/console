import { act, fireEvent } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { ClusterAdvancedSettings } from 'qovery-typescript-axios'
import React from 'react'
import * as storeOrganization from '@qovery/domains/organization'
import { clusterFactoryMock } from '@qovery/shared/factories'
import { ClusterEntity } from '@qovery/shared/interfaces'
import * as InitFormValues from './init-form-values/init-form-values'
import PageSettingsAdvancedFeature from './page-settings-advanced-feature'

import SpyInstance = jest.SpyInstance

const mockCluster: ClusterEntity = clusterFactoryMock(1)[0]
const mockAdvancedSettings: Partial<ClusterAdvancedSettings> = {
  'loki.log_retention_in_week': 1,
  'aws.vpc.enable_s3_flow_logs': false,
  'load_balancer.size': '-',
  cloud_provider_container_registry_tags: {},
}

jest.mock('./init-form-values/init-form-values', () => ({
  ...jest.requireActual('./init-form-values/init-form-values'),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: '1', clusterId: mockCluster.id }),
}))

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
}))

jest.mock('@qovery/domains/organization', () => {
  return {
    ...jest.requireActual('@qovery/domains/organization'),
    editClusterAdvancedSettings: jest.fn(),
    fetchClusterAdvancedSettings: jest.fn(),
    fetchDefaultClusterAdvancedSettings: jest.fn(),
    getClusterState: () => ({
      defaultClusterAdvancedSettings: {
        loadingStatus: 'loaded',
        settings: mockAdvancedSettings,
      },
      loadingStatus: 'loaded',
      ids: [mockCluster.id],
      entities: {
        [mockCluster.id]: mockCluster,
      },
      error: null,
    }),
    selectClusterById: () => mockCluster,
  }
})

describe('PageSettingsAdvancedFeature', () => {
  const setState = jest.fn()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const useStateMock: any = (initState: any) => [initState, setState]
  let promise: Promise

  beforeEach(() => {
    mockCluster.advanced_settings = {
      loadingStatus: 'not loaded',
      current_settings: mockAdvancedSettings,
    }
    promise = Promise.resolve()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('should render successfully', async () => {
    const { baseElement } = render(<PageSettingsAdvancedFeature />)
    expect(baseElement).toBeTruthy()

    await act(async () => {
      await promise
    })
  })

  it('should dispatch fetchClusterAdvancedSettings if advanced_settings does not exist', async () => {
    mockCluster.advanced_settings = undefined
    const fetchClusterAdvancedSettingsSpy: SpyInstance = jest.spyOn(storeOrganization, 'fetchClusterAdvancedSettings')
    render(<PageSettingsAdvancedFeature />)
    expect(fetchClusterAdvancedSettingsSpy).toHaveBeenCalled()

    await act(async () => {
      await promise
    })
  })

  // I think the useForm hook also use useState, this is why the first 4th call are to ignored. https://gist.github.com/mauricedb/eb2bae5592e3ddc64fa965cde4afe7bc
  it('should set the keys if application and advanced_settings are defined', async () => {
    mockCluster.advanced_settings!.loadingStatus = 'loaded'
    jest.spyOn(React, 'useState').mockImplementation(useStateMock)
    render(<PageSettingsAdvancedFeature />)
    expect(setState).toHaveBeenNthCalledWith(
      9,
      Object.keys(mockCluster.advanced_settings?.current_settings || {}).sort()
    )
    await act(async () => {
      await promise
    })
  })

  it('should dispatch editClusterAdvancedSettings if form is submitted', async () => {
    mockCluster.advanced_settings!.loadingStatus = 'loaded'
    const editClusterAdvancedSettingsSpy: SpyInstance = jest.spyOn(storeOrganization, 'editClusterAdvancedSettings')

    const { getByLabelText, getByTestId } = render(<PageSettingsAdvancedFeature />)

    await act(() => {
      fireEvent.input(getByLabelText('loki.log_retention_in_week'), { target: { value: '2' } })
      fireEvent.input(getByLabelText('aws.vpc.enable_s3_flow_logs'), { target: { value: 'true' } })
      fireEvent.input(getByLabelText('load_balancer.size'), { target: { value: '/' } })
      fireEvent.input(getByLabelText('cloud_provider_container_registry_tags'), {
        target: { value: '{"test":"test"}' },
      })
    })

    expect(getByTestId('submit-button')).not.toBeDisabled()

    await act(() => {
      getByTestId('submit-button').click()
    })

    expect(editClusterAdvancedSettingsSpy.mock.calls[0][0].clusterId).toBe(mockCluster.id)
    expect(editClusterAdvancedSettingsSpy.mock.calls[0][0].settings).toStrictEqual({
      'loki.log_retention_in_week': 2,
      'aws.vpc.enable_s3_flow_logs': true,
      'load_balancer.size': '/',
      cloud_provider_container_registry_tags: { test: 'test' },
    })

    await act(async () => {
      await promise
    })
  })

  it('should init the form', async () => {
    mockCluster.advanced_settings!.loadingStatus = 'loaded'
    const spy = jest.spyOn(InitFormValues, 'initFormValues')
    render(<PageSettingsAdvancedFeature />)
    expect(spy).toHaveBeenCalled()

    await act(async () => {
      await promise
    })
  })
})
