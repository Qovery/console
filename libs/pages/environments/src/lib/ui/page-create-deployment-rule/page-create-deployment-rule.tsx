import {
  BaseLink,
  Button,
  ButtonSize,
  ButtonStyle,
  HelpSection,
  Icon,
  InputSelect,
  InputSelectMultiple,
  InputText,
  InputTextArea,
  InputToggle,
  Tooltip,
} from '@console/shared/ui'
import { useNavigate } from 'react-router-dom'
import { Control, Controller } from 'react-hook-form'
import { useState } from 'react'
import { Cluster } from 'qovery-typescript-axios'
import { Value } from '@console/shared/interfaces'

export interface PageCreateDeploymentRuleProps {
  listHelpfulLinks: BaseLink[]
  control: Control<any, any>
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

  const LIST = [
    'An environment help you to amet minim mollit non deserunt.',
    'Ullamco est sit aliqua dolor do amet sint.',
    'Velit officia consequat duis enim velit mollit.',
    'Exercitation veniam consequat sunt nostrud amet.',
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
    <div className="mt-2 bg-white rounded flex flex-grow">
      <div className="flex h-full flex-col flex-grow">
        <div className="py-7 px-10 flex-grow">
          <div className="max-w-[620px]">
            {/* <div className="flex gap-4 mb-3 items-center">
              <ButtonIcon
                icon="icon-solid-arrow-left"
                style={ButtonIconStyle.STROKED}
                className="!bg-element-light-lighter-300"
                onClick={() => navigate(-1)}
              />
              <h1 className="font-bold text-base text-text-600">Create rule</h1>
            </div> */}
            <Button size={ButtonSize.TINY} style={ButtonStyle.FLAT} onClick={() => navigate(-1)} className="!px-0 mb-1">
              <Icon name="icon-solid-arrow-left" className="mr-1 text-xs" />
              Back
            </Button>

            <h1 className="font-bold text-xl text-text-700 mb-2">Create rule</h1>

            <div className="mb-10">
              <p className="text-text-500 text-xs">
                Automatically create a preview environment when a merge request is submitted on one of your
                applications. Your environment will be cloned with the application synchronised on the branch waiting to
                be merged.
              </p>
            </div>

            <form onSubmit={onSubmit}>
              <div className="border border-element-light-lighter-500 bg-element-light-lighter-200 rounded mb-5">
                <div className="flex items-center justify-between h-9 px-4 border-b border-element-light-lighter-500">
                  <h2 className="font-medium text-text-600 text-sm">Matching rule definition</h2>
                  <Tooltip content="Information">
                    <div>
                      <Icon name="icon-solid-circle-info" className="text-sm text-text-400" />
                    </div>
                  </Tooltip>
                </div>
                <div className="p-5">
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
                    rules={{ required: 'Plase add a matching condition' }}
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
                </div>
              </div>

              <div className="border border-element-light-lighter-500 bg-element-light-lighter-200 rounded mb-5">
                <div className="flex items-center justify-between h-9 px-4 border-b border-element-light-lighter-500">
                  <h2 className="font-medium text-text-500 text-sm">Setup to apply - General</h2>
                </div>
                <div className="p-5">
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
                        className="mb-1"
                      />
                    )}
                  />
                  <p className="text-xs text-text-400 mb-3">
                    Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint.
                  </p>
                  <div className="flex items-center gap-3 mb-1">
                    <Controller
                      name="auto_deploy"
                      control={control}
                      render={({ field }) => <InputToggle value={field.value} onChange={field.onChange} small />}
                    />
                    <p className="text-text-500 text-sm font-medium">Auto-deploy</p>
                  </div>
                  <p className="text-xs text-text-400 mb-3">
                    Your environment will auto-stop amet minim mollit non deserunt ullamco est sit aliqua dolor do amet
                    sint.
                  </p>
                  <div className="flex items-center gap-3 mb-1">
                    <Controller
                      name="auto_delete"
                      control={control}
                      render={({ field }) => <InputToggle value={field.value} onChange={field.onChange} small />}
                    />
                    <p className="text-text-500 text-sm font-medium">Auto-delete</p>
                  </div>
                  <p className="text-xs text-text-400 mb-3">
                    Your environment will auto-stop amet minim mollit non deserunt ullamco est sit aliqua dolor do amet
                    sint.
                  </p>
                </div>
              </div>

              <div className="border border-element-light-lighter-500 bg-element-light-lighter-200 rounded mb-5">
                <div className="flex items-center justify-between h-9 px-4 border-b border-element-light-lighter-500">
                  <h2 className="font-medium text-text-500 text-sm">Setup to apply - Start & stop</h2>
                  <Tooltip content="Information">
                    <div>
                      <Icon name="icon-solid-circle-info" className="text-sm text-text-400" />
                    </div>
                  </Tooltip>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-1">
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
                          small
                        />
                      )}
                    />
                    <p className="text-text-500 text-sm font-medium">Deploy on specific timeframe</p>
                  </div>
                  <p className="text-xs text-text-400 mb-3">
                    The rule will only be applied to new environments that match the regex you specify here. Leave this
                    field empty if you want the rule to be applied to all new environments.
                  </p>
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
                </div>
              </div>
              <Button size={ButtonSize.NORMAL} style={ButtonStyle.BASIC} type="submit">
                Create rule
              </Button>
            </form>
          </div>
        </div>
        <HelpSection description="Need help? You may find these links useful" links={listHelpfulLinks}></HelpSection>
      </div>
      <div className="w-right-help-sidebar border-l border-element-light-lighter-400">
        <div className="p-10 border-b border-element-light-lighter-400">
          <span className="flex justify-center items-center rounded bg-accent1-500 w-7 h-7 text-sm text-white">
            <Icon name="icon-solid-lightbulb" />
          </span>
          <h2 className="h5 text-text-700 mt-5 mb-5">What is an organization, what is a project?</h2>
          <ul className="text-sm ml-2">
            {LIST.map((l, index) => (
              <li
                className="text-text-500 mb-2 flex gap-3 before:content-[''] before:w-1 before:h-1 before:rounded-full before:shrink-0 before:mt-2 before:bg-text-500"
                key={index}
              >
                {l}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-10">
          <p className="text-sm text-text-500 mb-5">You may find these links useful</p>
          <a
            href="https://hub.qovery.com/docs/using-qovery/configuration/environment/"
            target="_blank"
            rel="noreferrer"
            className="link text-accent2-500 text-sm block mb-3"
          >
            How to configure an environment <Icon name="icon-solid-arrow-up-right-from-square" />
          </a>
          <a
            href="https://hub.qovery.com/docs/using-qovery/configuration/environment/"
            target="_blank"
            rel="noreferrer"
            className="link text-accent2-500 text-sm block"
          >
            Set parameters on my environment <Icon name="icon-solid-arrow-up-right-from-square" />
          </a>
        </div>
      </div>
    </div>
  )
}

export default PageCreateDeploymentRule
