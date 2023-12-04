import { type ClusterAdvancedSettings } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import {
  useClusterAdvancedSettings,
  useDefaultAdvancedSettings,
  useEditClusterAdvancedSettings,
} from '@qovery/domains/clusters/feature'
import { objectFlattener } from '@qovery/shared/util-js'
import PageSettingsAdvanced from '../../ui/page-settings-advanced/page-settings-advanced'
import { initFormValues } from './init-form-values/init-form-values'

export function PageSettingsAdvancedFeature() {
  const { organizationId = '', clusterId = '' } = useParams()

  const { data: clusterAdvancedSettings, isLoading: isClusterAdvancedSettingsLoading } = useClusterAdvancedSettings({
    organizationId,
    clusterId,
  })
  const { mutateAsync: editClusterAdvancedSettings } = useEditClusterAdvancedSettings()
  const { data: defaultAdvancedSettings } = useDefaultAdvancedSettings()

  const [keys, setKeys] = useState<string[]>([])

  const methods = useForm({ mode: 'onChange' })

  // init the keys when cluster is updated
  useEffect(() => {
    if (clusterAdvancedSettings) {
      setKeys(Object.keys(clusterAdvancedSettings).sort())
    }
  }, [clusterAdvancedSettings])

  // init form
  useEffect(() => {
    if (clusterAdvancedSettings) {
      methods.reset(initFormValues(keys, clusterAdvancedSettings))
    }
  }, [clusterAdvancedSettings, keys, methods])

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
          dataFormatted[key] = defaultAdvancedSettings
            ? defaultAdvancedSettings[key as keyof ClusterAdvancedSettings]
            : ''
        }
        return
      }
      dataFormatted[key] = JSON.parse(dataFormatted[key])
    })

    if (clusterAdvancedSettings) {
      editClusterAdvancedSettings({
        organizationId,
        clusterId,
        clusterAdvancedSettings: dataFormatted,
      })
    }
  })

  return (
    <FormProvider {...methods}>
      <PageSettingsAdvanced
        defaultAdvancedSettings={defaultAdvancedSettings}
        advancedSettings={clusterAdvancedSettings}
        loading={isClusterAdvancedSettingsLoading}
        keys={keys}
        discardChanges={() => methods.reset()}
        onSubmit={() => onSubmit()}
      />
    </FormProvider>
  )
}

export default PageSettingsAdvancedFeature
