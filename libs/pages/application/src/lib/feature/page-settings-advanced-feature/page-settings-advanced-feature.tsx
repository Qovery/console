import { ApplicationAdvancedSettings } from 'qovery-typescript-axios'
import { useCallback, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router'
import {
  editApplicationAdvancedSettings,
  fetchApplicationAdvancedSettings,
  fetchDefaultApplicationAdvancedSettings,
  getApplicationsState,
  selectApplicationById,
} from '@console/domains/application'
import { ApplicationEntity } from '@console/shared/interfaces'
import { AppDispatch, RootState } from '@console/store/data'
import PageSettingsAdvanced from '../../ui/page-settings-advanced/page-settings-advanced'

export function sortAlphabetically(a: string, b: string): number {
  if (a < b) {
    return -1
  }
  if (a > b) {
    return 1
  }
  return 0
}

export function flattenObject(ob: any): { [key: string]: string } {
  const toReturn: { [key: string]: string } = {}

  for (const i in ob) {
    if (!Object.prototype.hasOwnProperty.call(ob, i)) continue

    if (typeof ob[i] == 'object' && ob[i] !== null) {
      const flatObject = flattenObject(ob[i])
      for (const x in flatObject) {
        if (!Object.prototype.hasOwnProperty.call(flatObject, x)) continue

        // converting string to boolean or number if it's boolean or number
        try {
          toReturn[i + '.' + x] = JSON.parse(flatObject[x])
        } catch (e) {
          toReturn[i + '.' + x] = flatObject[x]
        }
      }
    } else {
      toReturn[i] = ob[i]
    }
  }
  return toReturn
}

export function PageSettingsAdvancedFeature() {
  const { applicationId = '' } = useParams()

  const application = useSelector<RootState, ApplicationEntity | undefined>(
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

  const initForm = useCallback(() => {
    const values: { [key: string]: string } = {}
    if (application) {
      keys.forEach((key) => {
        if (application.advanced_settings?.current_settings) {
          values[key] =
            application.advanced_settings.current_settings[key as keyof ApplicationAdvancedSettings]?.toString() || ''
        }
      })

      methods.reset(values)
    }
  }, [application, keys, methods])

  useEffect(() => {
    dispatch(fetchDefaultApplicationAdvancedSettings())
  }, [dispatch])

  useEffect(() => {
    if (application && !application.advanced_settings?.loadingStatus) {
      dispatch(fetchApplicationAdvancedSettings({ applicationId }))
    }
  }, [dispatch, application, applicationId])

  useEffect(() => {
    if (application) {
      if (application.advanced_settings?.current_settings) {
        setKeys(Object.keys(application.advanced_settings.current_settings).sort(sortAlphabetically))
      }
    }
  }, [application])

  useEffect(() => {
    initForm()
  }, [initForm])

  const onSubmit = methods.handleSubmit((data) => {
    let dataFormatted = { ...data }

    Object.keys(dataFormatted).forEach((key) => {
      if (key.includes('.')) {
        delete dataFormatted[key]
      }
    })

    dataFormatted = flattenObject(dataFormatted)
    dispatch(editApplicationAdvancedSettings({ applicationId, settings: dataFormatted }))
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
        onSubmit={onSubmit}
      />
    </FormProvider>
  )
}

export default PageSettingsAdvancedFeature
