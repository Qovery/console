import { useParams } from '@tanstack/react-router'
import { type ClusterAdvancedSettings as ClusterAdvancedSettingsType } from 'qovery-typescript-axios'
import { useEffect, useMemo, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useClusterAdvancedSettings } from '../hooks/use-cluster-advanced-settings/use-cluster-advanced-settings'
import { useDefaultAdvancedSettings } from '../hooks/use-default-advanced-settings/use-default-advanced-settings'
import { useEditClusterAdvancedSettings } from '../hooks/use-edit-cluster-advanced-settings/use-edit-cluster-advanced-settings'
import { buildClusterAdvancedSettingsPayload } from './build-cluster-advanced-settings-payload'
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

  const methods = useForm<{ [key: string]: string }>({ mode: 'onChange' })
  const [formBaseline, setFormBaseline] = useState<ClusterAdvancedSettingsType>()

  const keys = useMemo(() => Object.keys(clusterAdvancedSettings ?? {}).sort(), [clusterAdvancedSettings])

  useEffect(() => {
    if (clusterAdvancedSettings) {
      methods.reset(initFormValues(keys, clusterAdvancedSettings))
      setFormBaseline(clusterAdvancedSettings)
    }
  }, [clusterAdvancedSettings, keys, methods])

  const onSubmit = methods.handleSubmit((data) => {
    const payload = buildClusterAdvancedSettingsPayload(data, defaultAdvancedSettings)

    if (clusterAdvancedSettings) {
      editClusterAdvancedSettings(
        {
          organizationId,
          clusterId,
          clusterAdvancedSettings: payload,
        },
        {
          onSuccess: () => {
            methods.reset(data)
            setFormBaseline(payload)
          },
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
        formBaseline={formBaseline}
      />
    </FormProvider>
  )
}

export default ClusterAdvancedSettingsFeature
