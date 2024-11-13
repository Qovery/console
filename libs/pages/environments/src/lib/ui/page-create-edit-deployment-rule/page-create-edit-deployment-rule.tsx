import { type Cluster } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { type Control, Controller, type FieldValues } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { environmentModeValues, timezoneValues, weekdaysValues } from '@qovery/shared/enums'
import { type Value } from '@qovery/shared/interfaces'
import { ENVIRONMENTS_DEPLOYMENT_RULES_URL, ENVIRONMENTS_URL } from '@qovery/shared/routes'
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

export interface PageCreateEditDeploymentRuleProps {
  title: string
  control?: Control<FieldValues>
  btnLabel?: string
  onSubmit: () => void
  clusters?: Cluster[]
  defaultAutoStop?: boolean
}

export function PageCreateEditDeploymentRule(props: PageCreateEditDeploymentRuleProps) {
  const { title, control, onSubmit, clusters, btnLabel = 'Create rule', defaultAutoStop = false } = props
  const { organizationId, projectId } = useParams()
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
    <div className="mt-2 rounded bg-white">
      <div className="flex">
        <div className="flex-grow overflow-y-auto">
          <Section className="px-10 py-7">
            <div className="max-w-[620px]">
              <Link
                color="brand"
                size="xs"
                to={ENVIRONMENTS_URL(organizationId, projectId) + ENVIRONMENTS_DEPLOYMENT_RULES_URL}
                className="mb-2"
              >
                <Icon name="icon-solid-arrow-left" className="mr-1 text-xs" />
                Back{' '}
              </Link>

              <Heading className="mb-2">{title}</Heading>

              <div className="mb-10">
                <p className="text-xs leading-5 text-neutral-400">
                  Declaring deployment rules at the project level allows you to apply defaults rule to all newly created
                  environments.
                </p>
              </div>

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

                  <p className="text-xs text-neutral-350">
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
                  <Button className="mb-14" size="lg" type="submit">
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

export default PageCreateEditDeploymentRule
