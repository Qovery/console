import { ApplicationAdvancedSettings } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  editApplicationAdvancedSettings,
  fetchApplicationAdvancedSettings,
  fetchDefaultApplicationAdvancedSettings,
  getApplicationsState,
  postApplicationActionsRestart,
  selectApplicationById,
} from '@qovery/domains/application'
import { getServiceType } from '@qovery/shared/enums'
import { GitApplicationEntity } from '@qovery/shared/interfaces'
import { objectFlattener } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store'
import PageSettingsAdvanced from '../../ui/page-settings-advanced/page-settings-advanced'
import { initFormValues } from './utils'

export function PageSettingsAdvancedFeature() {
  const { applicationId = '', environmentId = '' } = useParams()

  const application = useSelector<RootState, GitApplicationEntity | undefined>(
    (state) => selectApplicationById(state, applicationId),
    (a, b) => {
      return a?.id === b?.id && a?.advanced_settings?.loadingStatus === b?.advanced_settings?.loadingStatus
    }
  )
  const defaultSettings = useSelector<RootState, ApplicationAdvancedSettings | undefined>(
    (state) => getApplicationsState(state).defaultApplicationAdvancedSettings.settings
  )
  const [keys, setKeys] = useState<string[]>([])

  const dispatch = useDispatch<AppDispatch>()
  const methods = useForm({ mode: 'onChange' })

  // at the init fetch the default settings advanced settings
  useEffect(() => {
    dispatch(fetchDefaultApplicationAdvancedSettings())
  }, [dispatch, application])

  // when application is ready, and advanced setting has never been fetched before
  useEffect(() => {
    if (application && !application.advanced_settings?.loadingStatus) {
      dispatch(fetchApplicationAdvancedSettings({ applicationId, serviceType: getServiceType(application) }))
    }
  }, [dispatch, application, applicationId])

  // init the keys when application is updated
  useEffect(() => {
    if (application) {
      if (
        application.advanced_settings?.current_settings &&
        application.advanced_settings?.loadingStatus === 'loaded'
      ) {
        setKeys(Object.keys(application.advanced_settings.current_settings).sort())
      }
    }
  }, [application])

  // init form
  useEffect(() => {
    if (application && application.advanced_settings?.loadingStatus === 'loaded') {
      methods.reset(initFormValues(keys, application))
    }
  }, [application, keys, methods])

  const toasterCallback = () => {
    if (application) {
      dispatch(
        postApplicationActionsRestart({ applicationId, environmentId, serviceType: getServiceType(application) })
      )
    }
  }

  const onSubmit = methods.handleSubmit((data) => {
    let dataFormatted = { ...data }

    Object.keys(dataFormatted).forEach((key) => {
      if (key.includes('.')) {
        delete dataFormatted[key]
      }
    })

    dataFormatted = objectFlattener(dataFormatted)
    if (application) {
      dispatch(
        editApplicationAdvancedSettings({
          applicationId,
          settings: dataFormatted,
          serviceType: getServiceType(application),
          toasterCallback,
        })
      )
    }
  })

  return (
    <FormProvider {...methods}>
      <PageSettingsAdvanced
        defaultAdvancedSettings={defaultSettings}
        advancedSettings={application?.advanced_settings?.current_settings}
        loading={application?.advanced_settings?.loadingStatus}
        keys={keys}
        discardChanges={() => {
          methods.reset()
        }}
        onSubmit={() => {
          onSubmit().then()
        }}
      />
    </FormProvider>
  )
}

export default PageSettingsAdvancedFeature
