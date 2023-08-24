import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  editClusterAdvancedSettings,
  fetchClusterAdvancedSettings,
  fetchDefaultClusterAdvancedSettings,
  getClusterState,
  postClusterActionsDeploy,
  selectClusterById,
} from '@qovery/domains/organization'
import { type AdvancedSettings, type ClusterEntity, type LoadingStatus } from '@qovery/shared/interfaces'
import { objectFlattener } from '@qovery/shared/utils'
import { type AppDispatch, type RootState } from '@qovery/state/store'
import PageSettingsAdvanced from '../../ui/page-settings-advanced/page-settings-advanced'
import { initFormValues } from './init-form-values/init-form-values'

export function PageSettingsAdvancedFeature() {
  const { organizationId = '', clusterId = '' } = useParams()

  const cluster = useSelector<RootState, ClusterEntity | undefined>((state) => selectClusterById(state, clusterId))
  const defaultSettingsLoadingStatus = useSelector<RootState, LoadingStatus>(
    (state) => getClusterState(state).defaultClusterAdvancedSettings.loadingStatus
  )
  const defaultSettings = useSelector<RootState, AdvancedSettings | undefined>(
    (state) => getClusterState(state).defaultClusterAdvancedSettings.settings
  )
  const [keys, setKeys] = useState<string[]>([])

  const dispatch = useDispatch<AppDispatch>()
  const methods = useForm({ mode: 'onChange' })

  // at the init fetch the default settings advanced settings
  useEffect(() => {
    if (!cluster?.advanced_settings?.loadingStatus && defaultSettingsLoadingStatus === 'not loaded') {
      dispatch(fetchDefaultClusterAdvancedSettings())
    }
  }, [cluster, defaultSettingsLoadingStatus])

  // when cluster is ready, and advanced setting has never been fetched before
  useEffect(() => {
    if (cluster && !cluster.advanced_settings?.loadingStatus) {
      dispatch(fetchClusterAdvancedSettings({ organizationId, clusterId }))
    }
  }, [dispatch, cluster, organizationId, clusterId])

  // init the keys when cluster is updated
  useEffect(() => {
    if (cluster?.advanced_settings?.current_settings && cluster.advanced_settings?.loadingStatus === 'loaded') {
      setKeys(Object.keys(cluster?.advanced_settings.current_settings).sort())
    }
  }, [cluster])

  // init form
  useEffect(() => {
    if (cluster && cluster.advanced_settings?.loadingStatus === 'loaded') {
      methods.reset(initFormValues(keys, cluster))
    }
  }, [cluster, keys, methods])

  const toasterCallback = () => {
    if (cluster) {
      dispatch(postClusterActionsDeploy({ organizationId, clusterId }))
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

    // below is a hack to handle the weird way the payload behaves
    // empty string must be sent as ''
    // empty numbers must be sent as null
    // the thing is we don't know in advance if the value is a string or a number
    // the interface has this information, but we can't check the type of the property of the interface
    // we can't do ClusterAdvanceSettings[key] === 'string' or 'number'
    // so if field is empty string replace by value found in defaultSettings (because default value is well typed)
    Object.keys(dataFormatted).forEach((key) => {
      // check if we can convert this string to object
      try {
        JSON.parse(dataFormatted[key])
      } catch (e) {
        if (dataFormatted[key] === '') {
          dataFormatted[key] = defaultSettings ? defaultSettings[key as keyof AdvancedSettings] : ''
        }
        return
      }
      dataFormatted[key] = JSON.parse(dataFormatted[key])
    })

    if (cluster) {
      dispatch(
        editClusterAdvancedSettings({
          organizationId,
          clusterId,
          settings: dataFormatted,
          toasterCallback,
        })
      )
    }
  })

  return (
    <FormProvider {...methods}>
      <PageSettingsAdvanced
        defaultAdvancedSettings={defaultSettings}
        advancedSettings={cluster?.advanced_settings?.current_settings}
        loading={cluster?.advanced_settings?.loadingStatus}
        keys={keys}
        discardChanges={() => methods.reset()}
        onSubmit={() => onSubmit()}
      />
    </FormProvider>
  )
}

export default PageSettingsAdvancedFeature
