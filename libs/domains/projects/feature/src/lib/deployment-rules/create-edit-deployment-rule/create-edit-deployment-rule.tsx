import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from '@tanstack/react-router'
import { type Value as ApiValue, type Cluster, type ProjectDeploymentRuleRequest } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { type Control, Controller, type FieldValues, useForm } from 'react-hook-form'
import { environmentModeValues, timezoneValues, weekdaysValues } from '@qovery/shared/enums'
import { type Value } from '@qovery/shared/interfaces'
import {
  BlockContent,
  Button,
  Heading,
  Icon,
  InputSelect,
  InputText,
  InputTextArea,
  InputToggle,
  Link,
  Section,
} from '@qovery/shared/ui'
import { dateToHours } from '@qovery/shared/util-dates'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { queries } from '@qovery/state/util-queries'
import { useCreateDeploymentRule } from '../../hooks/use-create-deployment-rule/use-create-deployment-rule'
import { useDeploymentRule } from '../../hooks/use-deployment-rule/use-deployment-rule'
import { useEditDeploymentRule } from '../../hooks/use-edit-deployment-rule/use-edit-deployment-rule'

export function CreateDeploymentRule() {
  const { organizationId = '', projectId = '' } = useParams({ strict: false })
  useDocumentTitle('Create Deployment Rule - Qovery')

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm()
  const navigate = useNavigate()

  const { mutateAsync: createDeploymentRule } = useCreateDeploymentRule()
  const { data: clusters } = useQuery({
    ...queries.clusters.list({ organizationId }),
    select(items) {
      items?.sort(({ name: nameA }, { name: nameB }) => nameA.localeCompare(nameB))
      return items as Cluster[]
    },
  })

  useEffect(() => {
    setValue('timezone', 'UTC')
    setValue('start_time', '08:00')
    setValue('stop_time', '19:00')
    setValue('mode', 'PRODUCTION')
    setValue('auto_stop', false)
    setValue('weekdays', weekdaysValues)
  }, [setValue])

  const onSubmit = handleSubmit(async (data) => {
    if (!data) {
      return
    }

    const fields = data as ProjectDeploymentRuleRequest
    fields.start_time = `1970-01-01T${fields.start_time}:00.000Z`
    fields.stop_time = `1970-01-01T${fields.stop_time}:00.000Z`
    fields.weekdays = data['weekdays'][0].value ? data['weekdays'].map((day: ApiValue) => day.value) : data['weekdays']

    try {
      await createDeploymentRule({ projectId, deploymentRuleRequest: fields })
      navigate({ to: `/organization/${organizationId}/project/${projectId}/deployment-rules` })
    } catch (error) {
      console.error(error)
    }
  })

  return (
    <CreateEditDeploymentRule
      title="Create rule"
      control={control}
      clusters={clusters}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    />
  )
}

export function EditDeploymentRule() {
  const { organizationId = '', projectId = '', deploymentRuleId = '' } = useParams({ strict: false })
  useDocumentTitle('Edit Deployment Rule - Qovery')

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm()
  const navigate = useNavigate()

  const { data: deploymentRule } = useDeploymentRule({ projectId, deploymentRuleId })
  const { data: clusters } = useQuery({
    ...queries.clusters.list({ organizationId }),
    select(items) {
      items?.sort(({ name: nameA }, { name: nameB }) => nameA.localeCompare(nameB))
      return items as Cluster[]
    },
  })
  const { mutateAsync: editDeploymentRule } = useEditDeploymentRule()

  useEffect(() => {
    const startTime = deploymentRule?.start_time && dateToHours(deploymentRule.start_time)
    const stopTime = deploymentRule?.stop_time && dateToHours(deploymentRule.stop_time)

    setValue('id', deploymentRule?.id)
    setValue('name', deploymentRule?.name)
    setValue('timezone', 'UTC')
    setValue('start_time', startTime)
    setValue('stop_time', stopTime)
    setValue('mode', deploymentRule?.mode)
    setValue('auto_stop', deploymentRule?.auto_stop)
    setValue('weekdays', deploymentRule?.weekdays)
    setValue('wildcard', deploymentRule?.wildcard)
    setValue('description', deploymentRule?.description)
    setValue('cluster_id', deploymentRule?.cluster_id)
  }, [deploymentRule, setValue])

  const onSubmit = handleSubmit(async (data) => {
    if (!data) {
      return
    }

    const fields = data as ProjectDeploymentRuleRequest & { id?: string }
    fields.start_time = `1970-01-01T${fields.start_time}:00.000Z`
    fields.stop_time = `1970-01-01T${fields.stop_time}:00.000Z`
    delete fields.id

    try {
      await editDeploymentRule({
        projectId,
        deploymentRuleId,
        deploymentRuleRequest: fields,
      })
      navigate({ to: `/organization/${organizationId}/project/${projectId}/deployment-rules` })
    } catch (error) {
      console.error(error)
    }
  })

  return (
    <CreateEditDeploymentRule
      title={`Edit ${deploymentRule?.name ?? ''}`}
      btnLabel="Edit rule"
      control={control}
      clusters={clusters}
      onSubmit={onSubmit}
      defaultAutoStop={deploymentRule?.auto_stop}
      isSubmitting={isSubmitting}
    />
  )
}

export interface CreateEditDeploymentRuleProps {
  title: string
  control?: Control<FieldValues>
  btnLabel?: string
  onSubmit: () => void
  clusters?: Cluster[]
  defaultAutoStop?: boolean
  isSubmitting?: boolean
}

export function CreateEditDeploymentRule(props: CreateEditDeploymentRuleProps) {
  const {
    title,
    control,
    onSubmit,
    clusters,
    btnLabel = 'Create rule',
    defaultAutoStop = false,
    isSubmitting = false,
  } = props
  const { organizationId, projectId } = useParams({ strict: false })
  const [autoStop, setAutoStop] = useState(defaultAutoStop)

  useEffect(() => {
    setAutoStop(defaultAutoStop)
  }, [defaultAutoStop])

  const clustersList: Value[] = clusters
    ? clusters?.map((cluster) => {
        const item = {
          label: cluster.name,
          value: cluster.id,
        }
        return item
      })
    : []

  return (
    <div className="mt-2">
      <div className="flex">
        <div className="flex-grow overflow-y-auto">
          <Section className="pt-6">
            <Link
              color="brand"
              size="xs"
              to="/organization/$organizationId/project/$projectId/deployment-rules"
              params={{ organizationId, projectId }}
              className="mb-2"
            >
              <Icon iconName="arrow-left" className="mr-1 text-xs" />
              Back{' '}
            </Link>

            <div className="mb-8 flex w-full justify-between gap-2 border-b border-neutral">
              <div className="flex flex-col gap-2 pb-6">
                <Heading>{title}</Heading>
                <p className="max-w-2xl text-sm text-neutral-subtle">
                  Declaring deployment rules at the project level allows you to apply defaults rule to all newly created
                  environments.
                </p>
              </div>
            </div>

            <div className="max-w-content-with-navigation-left">
              <form onSubmit={onSubmit}>
                <BlockContent title="Matching rule definition">
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: 'Please enter a name.' }}
                    render={({ field, fieldState: { error } }) => (
                      <InputText
                        name={field.name}
                        onChange={field.onChange}
                        value={field.value}
                        error={error?.message}
                        label="Rule name"
                        className="mb-3"
                      />
                    )}
                  />
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <InputTextArea
                        name={field.name}
                        value={field.value}
                        onChange={field.onChange}
                        label="Description (optional)"
                        className="mb-3"
                      />
                    )}
                  />
                  <Controller
                    name="wildcard"
                    control={control}
                    rules={{ required: 'Please add a matching condition' }}
                    render={({ field, fieldState: { error } }) => (
                      <InputText
                        name={field.name}
                        value={field.value}
                        onChange={field.onChange}
                        label="Matching Condition - Environment Name"
                        className="mb-3"
                        error={error?.message}
                      />
                    )}
                  />

                  <p className="text-xs text-neutral-subtle">
                    Use wildcards to specify just part of the name of the target environment (ex: [PR] Dev-*).
                  </p>
                </BlockContent>

                <BlockContent title="Setup to apply - General">
                  <Controller
                    name="mode"
                    control={control}
                    rules={{ required: 'Please select a mode' }}
                    render={({ field, fieldState: { error } }) => (
                      <InputSelect
                        label="Mode"
                        options={environmentModeValues}
                        onChange={field.onChange}
                        value={field.value}
                        error={error?.message}
                        className="mb-3"
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
                        className="mb-5"
                      />
                    )}
                  />
                </BlockContent>

                <BlockContent title="Setup to apply - Start & stop">
                  <div className="flex items-center gap-3">
                    <Controller
                      name="auto_stop"
                      control={control}
                      render={({ field }) => (
                        <InputToggle
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e)
                            setAutoStop(e)
                          }}
                          className="mb-5"
                          title="Deploy on specific timeframe"
                          description="Specify a timeframe to automatically start & stop your environment."
                          small
                          align="top"
                        />
                      )}
                    />
                  </div>
                  <Controller
                    name="weekdays"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <InputSelect
                        label="Which days"
                        value={field.value}
                        options={weekdaysValues}
                        error={error?.message}
                        onChange={field.onChange}
                        className="mb-3"
                        disabled={!autoStop}
                        isMulti={true}
                      />
                    )}
                  />
                  <Controller
                    name="timezone"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <InputSelect
                        label="Timezone"
                        options={timezoneValues}
                        onChange={field.onChange}
                        value={field.value}
                        error={error?.message}
                        className="mb-3"
                        disabled
                      />
                    )}
                  />
                  <div className="flex w-full gap-3">
                    <Controller
                      name="start_time"
                      control={control}
                      rules={{ required: 'Please enter a start time.' }}
                      render={({ field, fieldState: { error } }) => (
                        <InputText
                          name={field.name}
                          type="time"
                          onChange={field.onChange}
                          value={field.value}
                          error={error?.message}
                          label="Start time"
                          className="flex-grow"
                          disabled={!autoStop}
                        />
                      )}
                    />
                    <Controller
                      name="stop_time"
                      control={control}
                      rules={{ required: 'Please enter a stop time.' }}
                      render={({ field, fieldState: { error } }) => (
                        <InputText
                          name={field.name}
                          type="time"
                          onChange={field.onChange}
                          value={field.value}
                          error={error?.message}
                          label="Stop time"
                          className="flex-grow"
                          disabled={!autoStop}
                        />
                      )}
                    />
                  </div>
                </BlockContent>
                <div className="flex justify-end">
                  <Button className="mb-14" size="lg" type="submit" loading={isSubmitting}>
                    {btnLabel}
                  </Button>
                </div>
              </form>
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}
