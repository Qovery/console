import { FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router'
import { SERVICES_URL } from '@qovery/shared/router'
import { BlockContent, Button, ButtonSize, ButtonStyle, InputText } from '@qovery/shared/ui'
import { GeneralData } from '../../../feature/page-application-create-feature/application-creation-flow.interface'

export interface PageDatabaseCreateGeneralProps {
  onSubmit: FormEventHandler<HTMLFormElement>
}

export function PageDatabaseCreateGeneral(props: PageDatabaseCreateGeneralProps) {
  const { control, formState } = useFormContext<GeneralData>()
  const { organizationId = '', environmentId = '', projectId = '' } = useParams()
  const navigate = useNavigate()

  return (
    <div>
      <div className="mb-10">
        <h3 className="text-text-700 text-lg mb-2">General informations</h3>
        <p className="text-text-500 text-sm mb-2">
          General settings allow you to set up your application name, git repository or container settings.
        </p>
      </div>

      <form onSubmit={props.onSubmit}>
        <Controller
          name="name"
          control={control}
          rules={{
            required: 'Please enter a name',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              className="mb-3"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              label="Database name"
              error={error?.message}
            />
          )}
        />

        <BlockContent title="Select the mode for you database">
          <h2>Hey</h2>
        </BlockContent>

        <div className="flex justify-between">
          <Button
            onClick={() => navigate(SERVICES_URL(organizationId, projectId, environmentId))}
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

export default PageDatabaseCreateGeneral
