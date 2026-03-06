import { useParams } from '@tanstack/react-router'
import { type Cluster } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form'
import { useClusters } from '@qovery/domains/clusters/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { environmentModeValues } from '@qovery/shared/enums'
import { type Value } from '@qovery/shared/interfaces'
import { Button } from '@qovery/shared/ui'
import { BlockContent, InputSelect, InputText, Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { useEditEnvironment } from '../hooks/use-edit-environment/use-edit-environment'
import { useEnvironment } from '../hooks/use-environment/use-environment'

interface PageSettingsGeneralProps {
  clusters?: Cluster[]
  onSubmit: () => void
  loading: boolean
}

export function PageSettingsGeneral(props: PageSettingsGeneralProps) {
  const { clusters, onSubmit, loading } = props
  const { control, formState, watch } = useFormContext()
  const modeValue = watch('mode')

  const clustersList: Value[] = clusters
    ? clusters?.map((cluster) => {
        const item = {
          label: cluster.name,
          value: cluster.id,
        }
        return item
      })
    : []

  // Filter out PREVIEW from options unless it's the current value
  const modeOptions = environmentModeValues.filter((option) => option.value !== 'PREVIEW' || modeValue === 'PREVIEW')

  return (
    <div className="flex w-full flex-col justify-between">
      <Section className="max-w-content-with-navigation-left p-8">
        <SettingsHeading title="General" />
        <form onSubmit={onSubmit}>
          <BlockContent title="General information">
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Please enter a environment name.' }}
              render={({ field, fieldState: { error } }) => (
                <InputText
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  error={error?.message}
                  label="Environment name"
                  className="mb-3"
                />
              )}
            />
            <Controller
              name="mode"
              control={control}
              rules={{ required: 'Please select a mode' }}
              render={({ field, fieldState: { error } }) => (
                <InputSelect
                  label="Mode"
                  options={modeOptions}
                  onChange={field.onChange}
                  value={field.value}
                  error={error?.message}
                  className="mb-3"
                  disabled={modeValue === 'PREVIEW'}
                />
              )}
            />
            <Controller
              name="cluster_id"
              control={control}
              rules={{ required: 'Please select a cluster' }}
              render={({ field, fieldState: { error } }) => (
                <InputSelect
                  label="Cluster"
                  options={clustersList}
                  onChange={field.onChange}
                  value={field.value}
                  error={error?.message}
                  hint="Cluster cannot be changed. Clone the environment to deploy the same applications on another cluster."
                  disabled
                />
              )}
            />
          </BlockContent>
          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={!formState.isValid} loading={loading}>
              Save
            </Button>
          </div>
        </form>
      </Section>
    </div>
  )
}

export function PageEnvironmentGeneralSettingsForm() {
  const { organizationId = '', environmentId = '' } = useParams({ strict: false })
  useDocumentTitle('Environment - Settings')
  const methods = useForm({
    mode: 'onChange',
  })

  const { data: clusters = [] } = useClusters({ organizationId })

  const { data: environment } = useEnvironment({ environmentId })
  const { mutateAsync: editEnvironment } = useEditEnvironment()

  const [loading, setLoading] = useState(false)

  const onSubmit = methods.handleSubmit(async (data) => {
    setLoading(true)

    if (data) {
      delete data['cluster_id']
      await editEnvironment({ environmentId, payload: data })
      setLoading(false)
    }
  })

  useEffect(() => {
    methods.setValue('name', environment?.name)
    methods.setValue('mode', environment?.mode)
    methods.setValue('cluster_id', environment?.cluster_id)
  }, [methods, environment])

  return (
    <FormProvider {...methods}>
      <PageSettingsGeneral clusters={clusters} onSubmit={onSubmit} loading={loading} />
    </FormProvider>
  )
}
