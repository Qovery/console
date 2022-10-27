import { act, fireEvent } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { ApplicationAdvancedSettings } from 'qovery-typescript-axios'
import React from 'react'
import * as storeApplication from '@qovery/domains/application'
import { applicationFactoryMock } from '@qovery/domains/application'
import { ApplicationEntity } from '@qovery/shared/interfaces'
import PageSettingsAdvancedFeature from './page-settings-advanced-feature'
import * as Utils from './utils'

import SpyInstance = jest.SpyInstance

const mockApplication: ApplicationEntity = applicationFactoryMock(1)[0]
const mockAdvancedSettings: Partial<ApplicationAdvancedSettings> = {
  'build.timeout_max_sec': 60,
  'deployment.custom_domain_check_enabled': true,
  'liveness_probe.http_get.path': '/',
}

jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
}))

jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useParams: () => ({ applicationId: mockApplication.id }),
}))

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
}))

jest.mock('@qovery/domains/application', () => {
  return {
    ...jest.requireActual('@qovery/domains/application'),
    editApplicationAdvancedSettings: jest.fn(),
    fetchApplicationAdvancedSettings: jest.fn(),
    fetchDefaultApplicationAdvancedSettings: jest.fn(),
    getApplicationsState: () => ({
      defaultApplicationAdvancedSettings: mockAdvancedSettings,
      loadingStatus: 'loaded',
      ids: [mockApplication.id],
      entities: {
        [mockApplication.id]: mockApplication,
      },
      error: null,
    }),
    selectApplicationById: () => mockApplication,
  }
})

describe('PageSettingsAdvancedFeature', () => {
  let useDispatchSpy: SpyInstance
  const setState = jest.fn()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const useStateMock: any = (initState: any) => [initState, setState]
  let promise: Promise

  beforeEach(() => {
    mockApplication.advanced_settings = {
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

  it('should dispatch fetchDefaultApplicationAdvancedSettings', async () => {
    const fetchDefaultApplicationAdvancedSettingsSpy: SpyInstance = jest.spyOn(
      storeApplication,
      'fetchDefaultApplicationAdvancedSettings'
    )
    render(<PageSettingsAdvancedFeature />)
    expect(fetchDefaultApplicationAdvancedSettingsSpy).toHaveBeenCalled()

    await act(async () => {
      await promise
    })
  })

  it('should dispatch fetchApplicationAdvancedSettings if advanced_settings does not exist', async () => {
    mockApplication.advanced_settings = undefined
    const fetchApplicationAdvancedSettingsSpy: SpyInstance = jest.spyOn(
      storeApplication,
      'fetchApplicationAdvancedSettings'
    )
    render(<PageSettingsAdvancedFeature />)
    expect(fetchApplicationAdvancedSettingsSpy).toHaveBeenCalled()

    await act(async () => {
      await promise
    })
  })

  // I think the useForm hook also use useState, this is why the first 4th call are to ignored. https://gist.github.com/mauricedb/eb2bae5592e3ddc64fa965cde4afe7bc
  it('should set the keys if application and advanced_settings are defined', async () => {
    mockApplication.advanced_settings!.loadingStatus = 'loaded'
    jest.spyOn(React, 'useState').mockImplementation(useStateMock)
    render(<PageSettingsAdvancedFeature />)
    expect(setState).toHaveBeenNthCalledWith(
      5,
      Object.keys(mockApplication.advanced_settings?.current_settings || {}).sort()
    )
    await act(async () => {
      await promise
    })
  })

  it('should dispatch editApplicationAdvancedSettings if form is submitted', async () => {
    mockApplication.advanced_settings!.loadingStatus = 'loaded'
    const editApplicationAdvancedSettingsSpy: SpyInstance = jest.spyOn(
      storeApplication,
      'editApplicationAdvancedSettings'
    )

    const { getByLabelText, getByTestId } = render(<PageSettingsAdvancedFeature />)

    await act(() => {
      const input = getByLabelText('build.timeout_max_sec')
      fireEvent.input(input, { target: { value: '63' } })
    })
    expect(getByTestId('submit-button')).not.toBeDisabled()

    await act(() => {
      getByTestId('submit-button').click()
    })

    expect(editApplicationAdvancedSettingsSpy.mock.calls[0][0].applicationId).toBe(mockApplication.id)
    expect(editApplicationAdvancedSettingsSpy.mock.calls[0][0].settings).toStrictEqual({
      'build.timeout_max_sec': 63,
      'deployment.custom_domain_check_enabled': true,
      'liveness_probe.http_get.path': '/',
    })

    await act(async () => {
      await promise
    })
  })

  it('should init the form', async () => {
    mockApplication.advanced_settings!.loadingStatus = 'loaded'
    const spy = jest.spyOn(Utils, 'initFormValues')
    render(<PageSettingsAdvancedFeature />)
    expect(spy).toHaveBeenCalled()

    await act(async () => {
      await promise
    })
  })
})
