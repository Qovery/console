import { createFileRoute, useParams } from '@tanstack/react-router'
import { type ClusterAdvancedSettings as ClusterAdvancedSettingsType } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import {
  ClusterAdvancedSettings,
  useClusterAdvancedSettings,
  useDefaultAdvancedSettings,
  useEditClusterAdvancedSettings,
} from '@qovery/domains/clusters/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Section } from '@qovery/shared/ui'
import { objectFlattener } from '@qovery/shared/util-js'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/cluster/$clusterId/settings/advanced-settings'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId = '', clusterId = '' } = useParams({ strict: false })

  const { data: clusterAdvancedSettings, isLoading: isClusterAdvancedSettingsLoading } = useClusterAdvancedSettings({
    organizationId,
    clusterId,
  })
  const { mutateAsync: editClusterAdvancedSettings } = useEditClusterAdvancedSettings()
  const { data: defaultAdvancedSettings } = useDefaultAdvancedSettings()

  const methods = useForm({ mode: 'onChange' })

  useEffect(() => {
    if (clusterAdvancedSettings) {
      const keys = Object.keys(clusterAdvancedSettings).sort()
      const values: { [key: string]: string } = {}

      keys.forEach((key) => {
        const value = clusterAdvancedSettings[key as keyof ClusterAdvancedSettingsType]
        values[key] = (typeof value === 'object' ? JSON.stringify(value) : value?.toString()) || ''
      })

      methods.reset(values)
    }
  }, [clusterAdvancedSettings, methods])

  const onSubmit = methods.handleSubmit((data) => {
    let dataFormatted = { ...data }

    // below is a hack to handle the weird way the payload behaves
    // empty string must be sent as ''
    // empty numbers must be sent as null
    // the thing is we don't know in advance if the value is a string or a number
    // the interface has this information, but we can't check the type of the property of the interface
    // we can't do ClusterAdvanceSettings[key] === 'string' or 'number'
    // so if field is empty string replace by value found in defaultSettings (because default value is well typed)
    Object.keys(dataFormatted).forEach((key) => {
      if (key.includes('.')) {
        delete dataFormatted[key]
      }
    })

    dataFormatted = objectFlattener(dataFormatted)

    Object.keys(dataFormatted).forEach((key) => {
      // check if we can convert this string to object
      try {
        JSON.parse(dataFormatted[key])
      } catch (e) {
        if (dataFormatted[key] === '') {
          dataFormatted[key] = defaultAdvancedSettings
            ? defaultAdvancedSettings[key as keyof ClusterAdvancedSettingsType]?.toString() || ''
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
      <div className="flex w-full flex-col justify-between">
        <Section className="p-8">
          <SettingsHeading
            title="Advanced Settings"
            description="Any change to this section will be applied after triggering a cluster update."
          />

          <ClusterAdvancedSettings
            onSubmit={onSubmit}
            loading={isClusterAdvancedSettingsLoading}
            clusterAdvancedSettings={clusterAdvancedSettings}
            defaultAdvancedSettings={defaultAdvancedSettings}
          />
        </Section>
      </div>
    </FormProvider>
  )
}
