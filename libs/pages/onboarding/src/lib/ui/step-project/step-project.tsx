import { type Control, Controller } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { ButtonLegacy, ButtonLegacySize, ButtonLegacyStyle, IconAwesomeEnum, InputText } from '@qovery/shared/ui'

export interface StepProjectProps {
  onSubmit: () => void
  control: Control<{
    organization_name: string
    project_name: string
  }>
  authLogout: () => void
  backButton?: boolean
}

export function StepProject(props: StepProjectProps) {
  const { onSubmit, control, authLogout, backButton } = props
  const navigate = useNavigate()

  return (
    <div className="pb-10">
      <h1 className="h3 text-neutral-400 mb-3">
        Create your Organization
        <span className="ml-2" role="img" aria-label="star">
          ✨
        </span>
      </h1>
      <p className="text-sm mb-10 text-neutral-400">
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
        <div className="mt-10 pt-5 flex justify-between border-t border-neutral-200">
          {!backButton ? (
            <ButtonLegacy
              onClick={() => authLogout()}
              size={ButtonLegacySize.XLARGE}
              style={ButtonLegacyStyle.STROKED}
              iconLeft={IconAwesomeEnum.ARROW_LEFT}
            >
              Disconnect
            </ButtonLegacy>
          ) : (
            <ButtonLegacy
              onClick={() => navigate(-1)}
              size={ButtonLegacySize.XLARGE}
              style={ButtonLegacyStyle.STROKED}
              iconLeft={IconAwesomeEnum.ARROW_LEFT}
            >
              Back
            </ButtonLegacy>
          )}
          <ButtonLegacy size={ButtonLegacySize.XLARGE} style={ButtonLegacyStyle.BASIC} type="submit">
            Continue
          </ButtonLegacy>
        </div>
      </form>
    </div>
  )
}

export default StepProject
