import { FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { EnableBox, EntrypointCmdInputs } from '@qovery/shared/console-shared'
import { Button, ButtonSize, ButtonStyle, InputText, Link } from '@qovery/shared/ui'
import { ConfigureData } from '../../../feature/page-job-create-feature/job-creation-flow.interface'

export interface ConfigureProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  onBack: () => void
  jobType: 'cron' | 'lifecycle'
}

export function Configure(props: ConfigureProps) {
  const { control, formState, setValue, getValues } = useFormContext<ConfigureData>()

  return (
    <div>
      <div className="mb-10">
        <h3 className="text-text-700 text-lg mb-2">Job configuration</h3>
        <p className="text-text-500 text-sm mb-2">
          lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec auctor, nisl eget aliquam
        </p>
      </div>

      <Controller
        name="nb_restarts"
        control={control}
        rules={{
          required: 'Value required',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            type="number"
            className="mb-2"
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            label="Number of restarts"
            error={error?.message}
          />
        )}
      />
      <p className="text-text-400 text-xs mb-3">
        Maximum number of restarts allowed in case of job failure (0 means no failure)
      </p>

      <Controller
        name="max_duration"
        control={control}
        rules={{
          required: 'Value required',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            type="number"
            className="mb-2"
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            label="Max duration in seconds"
            error={error?.message}
          />
        )}
      />

      <p className="text-text-400 text-xs mb-3">
        Maximum duration allowed for the job to run before killing it and mark it as failed
      </p>

      <Controller
        name="port"
        control={control}
        rules={{
          required: 'Value required',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            type="number"
            className="mb-2"
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            label="Port"
            error={error?.message}
          />
        )}
      />

      <p className="text-text-400 text-xs mb-3">
        Port where to run readiness and liveliness probes checks. The port will not be exposed externally
      </p>

      {props.jobType === 'cron' ? (
        <>
          <Controller
            name="schedule"
            control={control}
            rules={{
              required: 'Value required',
            }}
            render={({ field, fieldState: { error } }) => (
              <InputText
                className="mb-2"
                name={field.name}
                onChange={field.onChange}
                value={field.value}
                label="Schedule - Cron expression"
                error={error?.message}
              />
            )}
          />
          <div className="mb-3 flex justify-between">
            <p className="text-text-500 text-xs ">Every minutes</p>
            <Link
              external={true}
              link="https://docs.qovery.com/docs/faq#what-is-a-cron-expression"
              className="text-text-400 !text-xs"
              linkLabel="CRON expression builder"
            />
          </div>
          <EntrypointCmdInputs entrypointRequired />
        </>
      ) : (
        <div className="mt-8 mb-10">
          <h3 className="text-sm font-semibold mb-1">Select events</h3>
          <p className="text-text-500 text-sm mb-3">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquam delectus ea, eius enim illo minima
            molestias, provident quasi saepe sunt totam ut veniam, voluptatibus. Alias blanditiis eum laboriosam
            provident quos?
          </p>

          <EnableBox
            className="mb-3"
            checked={getValues().on_start?.enabled || false}
            title="Start"
            name="on_start"
            description="lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec auctor, nisl eget aliquam"
            setChecked={(checked) => {
              setValue('on_start.enabled', checked)
            }}
          >
            <EntrypointCmdInputs
              className="mt-4"
              cmdArgumentsFieldName="on_start.arguments_string"
              imageEntryPointFieldName="on_start.entrypoint"
            />
          </EnableBox>
          <EnableBox
            className="mb-3"
            name="on_stop"
            checked={getValues().on_stop?.enabled || false}
            setChecked={(checked) => {
              setValue('on_stop.enabled', checked)
            }}
            title="Stop"
            description="lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec auctor, nisl eget aliquam"
          >
            <EntrypointCmdInputs
              className="mt-4"
              cmdArgumentsFieldName="on_stop.arguments_string"
              imageEntryPointFieldName="on_stop.entrypoint"
            />
          </EnableBox>
          <EnableBox
            className="mb-3"
            name="on_delete"
            checked={getValues().on_delete?.enabled || false}
            setChecked={(checked) => {
              setValue('on_delete.enabled', checked)
            }}
            title="Delete"
            description="lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec auctor, nisl eget aliquam"
          >
            <EntrypointCmdInputs
              className="mt-4"
              cmdArgumentsFieldName="on_delete.arguments_string"
              imageEntryPointFieldName="on_delete.entrypoint"
            />
          </EnableBox>
        </div>
      )}

      <form onSubmit={props.onSubmit}>
        <div className="flex justify-between">
          <Button
            onClick={props.onBack}
            type="button"
            className="btn--no-min-w"
            size={ButtonSize.XLARGE}
            style={ButtonStyle.STROKED}
          >
            Cancel
          </Button>
          <Button
            dataTestId="button-submit"
            type="submit"
            disabled={!formState.isValid}
            size={ButtonSize.XLARGE}
            style={ButtonStyle.BASIC}
          >
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}

export default Configure
