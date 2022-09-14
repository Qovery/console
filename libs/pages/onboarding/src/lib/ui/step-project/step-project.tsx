import { Control, Controller } from 'react-hook-form'
import { Button, ButtonSize, ButtonStyle, InputText } from '@qovery/shared/ui'

export interface StepProjectProps {
  onSubmit: () => void
  control: Control<any, any>
  authLogout: () => void
}

export function StepProject(props: StepProjectProps) {
  const { onSubmit, control, authLogout } = props

  return (
    <div className="pb-10">
      <h1 className="h3 text-text-700 mb-3">
        Create your Organization
        <span className="ml-2" role="img" aria-label="star">
          ✨
        </span>
      </h1>
      <p className="text-sm mb-10 text-text-500">
        You will now create your Organization and a first project within it. Both the Organization and Project name can
        be edited afterwards.
      </p>
      <form onSubmit={onSubmit}>
        <Controller
          name="organization_name"
          control={control}
          rules={{ required: 'Please enter your organization name.' }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              className="mb-3"
              label="Organization name"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
            />
          )}
        />
        <Controller
          name="project_name"
          control={control}
          rules={{ required: 'Please enter your project name.' }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              className="mb-3"
              label="Project name"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
            />
          )}
        />
        <div className="mt-10 pt-5 flex justify-between border-t border-element-light-lighter-400">
          <Button
            onClick={() => authLogout()}
            size={ButtonSize.XLARGE}
            style={ButtonStyle.STROKED}
            iconLeft="icon-solid-arrow-left"
          >
            Disconnect
          </Button>
          <Button size={ButtonSize.XLARGE} style={ButtonStyle.BASIC} type="submit">
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}

export default StepProject
