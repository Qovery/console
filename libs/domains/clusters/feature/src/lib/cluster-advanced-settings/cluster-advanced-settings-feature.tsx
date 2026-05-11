import { useParams } from '@tanstack/react-router'
import { type ClusterAdvancedSettings as ClusterAdvancedSettingsType } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { objectFlattener } from '@qovery/shared/util-js'
import { useClusterAdvancedSettings } from '../hooks/use-cluster-advanced-settings/use-cluster-advanced-settings'
import { useDefaultAdvancedSettings } from '../hooks/use-default-advanced-settings/use-default-advanced-settings'
import { useEditClusterAdvancedSettings } from '../hooks/use-edit-cluster-advanced-settings/use-edit-cluster-advanced-settings'
import { ClusterAdvancedSettings } from './cluster-advanced-settings'
import { initFormValues } from './init-form-values'

export function ClusterAdvancedSettingsFeature() {
  const { organizationId = '', clusterId = '' } = useParams({ strict: false })

  const { data: clusterAdvancedSettings, isLoading: isClusterAdvancedSettingsLoading } = useClusterAdvancedSettings({
    organizationId,
    clusterId,
  })
  const { mutateAsync: editClusterAdvancedSettings } = useEditClusterAdvancedSettings()
  const { data: defaultAdvancedSettings } = useDefaultAdvancedSettings()

  const [keys, setKeys] = useState<string[]>([])

  const methods = useForm<{ [key: string]: string }>({ mode: 'onChange' })

  useEffect(() => {
    if (clusterAdvancedSettings) {
      setKeys(Object.keys(clusterAdvancedSettings).sort())
    }
  }, [clusterAdvancedSettings])

  useEffect(() => {
    if (clusterAdvancedSettings) {
      methods.reset(initFormValues(keys, clusterAdvancedSettings))
    }
  }, [clusterAdvancedSettings, keys, methods])

  const onSubmit = methods.handleSubmit((data) => {
    let dataFormatted: Record<string, string> = { ...data }

    Object.keys(dataFormatted).forEach((key) => {
      if (key.includes('.')) {
        delete dataFormatted[key]
      }
    })

    dataFormatted = objectFlattener(dataFormatted) as Record<string, string>

    const payload: Record<string, unknown> = { ...dataFormatted }

    Object.keys(dataFormatted).forEach((key) => {
      try {
        payload[key] = JSON.parse(dataFormatted[key])
      } catch {
        if (dataFormatted[key] === '') {
          const defaultVal = defaultAdvancedSettings
            ? defaultAdvancedSettings[key as keyof ClusterAdvancedSettingsType]
            : ''
          payload[key] = typeof defaultVal === 'object' ? defaultVal : defaultVal ?? ''
        }
      }
    })

    if (clusterAdvancedSettings) {
      editClusterAdvancedSettings(
        {
          organizationId,
          clusterId,
          clusterAdvancedSettings: payload as ClusterAdvancedSettingsType,
        },
        {
          onSuccess: () => methods.reset(data),
        }
      )
    }
  })

  return (
    <FormProvider {...methods}>
      <ClusterAdvancedSettings
        onSubmit={() => onSubmit()}
        loading={isClusterAdvancedSettingsLoading}
        clusterAdvancedSettings={clusterAdvancedSettings}
        defaultAdvancedSettings={defaultAdvancedSettings}
      />
    </FormProvider>
  )
}

export default ClusterAdvancedSettingsFeature
