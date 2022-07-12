import {
  BaseLink,
  Button,
  ButtonSize,
  ButtonStyle,
  BlockContent,
  HelpSection,
  Icon,
  InputSelect,
  InputSelectMultiple,
  InputText,
  InputTextArea,
  InputToggle,
} from '@console/shared/ui'
import { useNavigate } from 'react-router-dom'
import { Control, Controller } from 'react-hook-form'
import { useState } from 'react'
import { Cluster } from 'qovery-typescript-axios'
import { Value } from '@console/shared/interfaces'
import HelpSidebar from '../help-sidebar/help-sidebar'

export interface PageCreateDeploymentRuleProps {
  listHelpfulLinks: BaseLink[]
  control?: Control<any, any>
  onSubmit: () => void
  clusters?: Cluster[]
}

export function PageCreateDeploymentRule(props: PageCreateDeploymentRuleProps) {
  const { listHelpfulLinks, control, onSubmit, clusters } = props

  const [autoStop, setAutoStop] = useState(false)

  const modeSelection = [
    {
      label: 'Development',
      value: 'DEVELOPMENT',
    },
    {
      label: 'Production',
      value: 'PRODUCTION',
    },
    {
      label: 'Staging',
      value: 'STAGING',
    },
  ]

  const timezoneSelection = [
    {
      label: 'UTC',
      value: 'UTC',
    },
  ]

  const weekdaysSelection = [
    {
      label: 'Monday',
      value: 'MONDAY',
    },
    {
      label: 'Tuesday',
      value: 'TUESDAY',
    },
    {
      label: 'Wednesday',
      value: 'WEDNESDAY',
    },
    {
      label: 'Thursday',
      value: 'THURSDAY',
    },
    {
      label: 'Friday',
      value: 'FRIDAY',
    },
    {
      label: 'Saturday',
      value: 'SATURDAY',
    },
    {
      label: 'Sunday',
      value: 'SUNDAY',
    },
  ]

  const navigate = useNavigate()

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
    <div className="mt-2 bg-white rounded">
      <div className="flex flex-grow">
        <div className="py-7 px-10 flex-grow h-[calc(100vh-393px)] overflow-y-auto">
          <div className="max-w-[620px]">
            <Button size={ButtonSize.TINY} style={ButtonStyle.FLAT} onClick={() => navigate(-1)} className="!px-0 mb-1">
              <Icon name="icon-solid-arrow-left" className="mr-1 text-xs" />
              Back
            </Button>

            <h1 className="font-bold text-xl text-text-700 mb-2">Create rule</h1>

            <div className="mb-10">
              <p className="text-text-500 text-xs leading-5">
                Automatically create a preview environment when a merge request is submitted on one of your
                applications. Your environment will be cloned with the application synchronised on the branch waiting to
                be merged.
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
                    <InputTextArea
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      label="Matching Condition - Environment Name"
                      className="mb-3"
                      error={error?.message}
                    />
                  )}
                />

                <p className="text-xs text-text-400">
                  Use wildcards to specify just part of the name of the target environment.
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
                      items={modeSelection}
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
                      items={clustersList}
                      onChange={field.onChange}
                      value={field.value}
                      error={error?.message}
                      className="mb-5"
                    />
                  )}
                />
                <div className="flex items-center gap-3 mb-4">
                  <Controller
                    name="auto_deploy"
                    control={control}
                    render={({ field }) => (
                      <InputToggle value={field.value} onChange={field.onChange} title="Auto-deploy" small />
                    )}
                  />
                </div>
                <div className="flex items-center gap-3 mb-1">
                  <Controller
                    name="auto_delete"
                    control={control}
                    render={({ field }) => (
                      <InputToggle value={field.value} onChange={field.onChange} title="Auto-delete" small />
                    )}
                  />
                </div>
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
                        description="The rule will only be applied to new environments that match the regex you specify here. Leave this field empty if you want the rule to be applied to all new environments."
                        small
                      />
                    )}
                  />
                </div>
                <Controller
                  name="weekdays"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <InputSelectMultiple
                      label="Which days"
                      value={field.value}
                      options={weekdaysSelection}
                      error={error?.message}
                      onChange={field.onChange}
                      className="mb-3"
                      disabled={!autoStop}
                    />
                  )}
                />
                <Controller
                  name="timezone"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <InputSelect
                      label="Timezone"
                      items={timezoneSelection}
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

              <Button size={ButtonSize.NORMAL} style={ButtonStyle.BASIC} type="submit">
                Create rule
              </Button>
            </form>
          </div>
        </div>
        <HelpSidebar />
      </div>
      <div className="bg-white rounded-b w-full">
        <HelpSection description="Need help? You may find these links useful" links={listHelpfulLinks}></HelpSection>
      </div>
    </div>
  )
}

export default PageCreateDeploymentRule
