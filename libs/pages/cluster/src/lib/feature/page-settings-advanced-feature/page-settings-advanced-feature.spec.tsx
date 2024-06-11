import { act, fireEvent, render } from '__tests__/utils/setup-jest'
import { type ClusterAdvancedSettings } from 'qovery-typescript-axios'
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import React from 'react'
import * as clustersDomain from '@qovery/domains/clusters/feature'
import { clusterFactoryMock } from '@qovery/shared/factories'
import * as InitFormValues from './init-form-values/init-form-values'
import PageSettingsAdvancedFeature from './page-settings-advanced-feature'

const useClusterAdvancedSettingsMockSpy = jest.spyOn(clustersDomain, 'useClusterAdvancedSettings') as jest.Mock
const useDefaultAdvancedSettingsMockSpy = jest.spyOn(clustersDomain, 'useDefaultAdvancedSettings') as jest.Mock
const useEditClusterAdvancedSettingsMockSpy = jest.spyOn(clustersDomain, 'useEditClusterAdvancedSettings') as jest.Mock
const mockCluster = clusterFactoryMock(1)[0]
const mockAdvancedSettings: ClusterAdvancedSettings = {
  'loki.log_retention_in_week': 1,
  'aws.vpc.enable_s3_flow_logs': false,
  'load_balancer.size': '-',
  'cloud_provider.container_registry.tags': {},
}

jest.mock('./init-form-values/init-form-values', () => ({
  ...jest.requireActual('./init-form-values/init-form-values'),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: '1', clusterId: mockCluster.id }),
}))

describe('PageSettingsAdvancedFeature', () => {
  const setState = jest.fn()
  const editClusterAdvancedSettingsSpy = jest.fn()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const useStateMock: any = (initState: any) => [initState, setState]
  let promise: Promise

  beforeEach(() => {
    useClusterAdvancedSettingsMockSpy.mockReturnValue({ data: mockAdvancedSettings, isLoading: false })
    useDefaultAdvancedSettingsMockSpy.mockReturnValue({ data: {}, isLoading: false })

    useEditClusterAdvancedSettingsMockSpy.mockReturnValue({
      mutateAsync: editClusterAdvancedSettingsSpy,
    })
    promise = Promise.resolve()
  })

  afterAll(() => {
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

  it('should fetch ClusterAdvancedSettings if advanced_settings does not exist', async () => {
    useClusterAdvancedSettingsMockSpy.mockReturnValueOnce({ data: undefined, isLoading: false })
    render(<PageSettingsAdvancedFeature />)
    expect(useClusterAdvancedSettingsMockSpy).toHaveBeenCalled()

    await act(async () => {
      await promise
    })
  })

  // I think the useForm hook also use useState, this is why the first 4th call are to ignored. https://gist.github.com/mauricedb/eb2bae5592e3ddc64fa965cde4afe7bc
  it('should set the keys if application and advanced_settings are defined', async () => {
    jest.spyOn(React, 'useState').mockImplementation(useStateMock)
    render(<PageSettingsAdvancedFeature />)
    expect(setState).toHaveBeenNthCalledWith(9, Object.keys(mockAdvancedSettings || {}).sort())
    await act(async () => {
      await promise
    })
  })

  it('should edit ClusterAdvancedSettings if form is submitted', async () => {
    const { getByLabelText, getByTestId } = render(<PageSettingsAdvancedFeature />)

    await act(() => {
      fireEvent.input(getByLabelText('loki.log_retention_in_week'), { target: { value: '2' } })
      fireEvent.input(getByLabelText('aws.vpc.enable_s3_flow_logs'), { target: { value: 'true' } })
      fireEvent.input(getByLabelText('load_balancer.size'), { target: { value: '/' } })
      fireEvent.input(getByLabelText('cloud_provider.container_registry.tags'), {
        target: { value: '{"test":"test"}' },
      })
    })

    expect(getByTestId('submit-button')).toBeEnabled()

    await act(() => {
      getByTestId('submit-button').click()
    })

    expect(editClusterAdvancedSettingsSpy).toHaveBeenCalledWith({
      clusterId: mockCluster.id,
      organizationId: '1',
      clusterAdvancedSettings: {
        'loki.log_retention_in_week': 2,
        'aws.vpc.enable_s3_flow_logs': true,
        'load_balancer.size': '/',
        'cloud_provider.container_registry.tags': { test: 'test' },
      },
    })

    await act(async () => {
      await promise
    })
  })

  it('should init the form', async () => {
    const spy = jest.spyOn(InitFormValues, 'initFormValues')
    render(<PageSettingsAdvancedFeature />)
    expect(spy).toHaveBeenCalled()

    await act(async () => {
      await promise
    })
  })
})
