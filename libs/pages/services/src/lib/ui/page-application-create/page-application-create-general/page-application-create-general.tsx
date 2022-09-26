import { FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { OrganizationEntity } from '@qovery/shared/interfaces'
import { SERVICES_URL } from '@qovery/shared/router'
import { Button, ButtonSize, ButtonStyle, InputSelect, InputText, Link } from '@qovery/shared/ui'
import { GeneralData } from '../../../feature/page-application-create-feature/application-creation-flow.interface'
import CreateGeneralContainer from './create-general-container/create-general-container'
import CreateGeneralGitApplication from './create-general-git-application/create-general-git-application'

export interface PageApplicationCreateGeneralProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  organization?: OrganizationEntity
}

export function PageApplicationCreateGeneral(props: PageApplicationCreateGeneralProps) {
  const { control, getValues, watch, formState } = useFormContext<GeneralData>()
  const { organizationId = '', environmentId = '', projectId = '' } = useParams()
  const navigate = useNavigate()

  watch('serviceType')

  return (
    <div>
      <div className="mb-10">
        <h3 className="text-text-700 text-lg mb-2">Application General Data</h3>
        <p className="text-text-500 text-sm mb-2">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cupiditate dignissimos earum fugiat fugit impedit in
          ipsa natus, quam sunt voluptate. Amet animi cupiditate, dignissimos eos excepturi maiores praesentium vero
          voluptates!
        </p>
        <Link link="#" linkLabel="link" external={true} />
      </div>

      <form onSubmit={props.onSubmit}>
        <Controller
          name="name"
          control={control}
          rules={{
            required: 'Value required',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              className="mb-3"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              label="Application name"
              error={error?.message}
            />
          )}
        />
        <Controller
          name="serviceType"
          control={control}
          rules={{
            required: 'Please select a source.',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputSelect
              dataTestId="input-select-source"
              className="mb-6"
              onChange={field.onChange}
              value={field.value}
              options={[
                { value: ServiceTypeEnum.APPLICATION, label: 'Git provider' },
                { value: ServiceTypeEnum.CONTAINER, label: 'Container Registry' },
              ]}
              label="Application source"
              error={error?.message}
            />
          )}
        />

        <div className="border-b border-b-element-light-lighter-400 mb-6"></div>
        {getValues().serviceType === ServiceTypeEnum.APPLICATION && <CreateGeneralGitApplication />}

        {getValues().serviceType === ServiceTypeEnum.CONTAINER && (
          <CreateGeneralContainer organization={props.organization} />
        )}

        <div className="flex justify-between">
          <Button
            onClick={() => navigate(SERVICES_URL(organizationId, projectId, environmentId))}
            type="button"
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

export default PageApplicationCreateGeneral
