import { FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { IconEnum, ServiceTypeEnum } from '@qovery/shared/enums'
import { OrganizationEntity } from '@qovery/shared/interfaces'
import { Button, ButtonSize, ButtonStyle, InputSelect, InputText, Link } from '@qovery/shared/ui'
import { GlobalData } from '../../../feature/page-application-create-feature/interfaces.interface'
import PageApplicationCreateGeneralContainer from './page-application-create-general-container/page-application-create-general-container'
import PageApplicationCreateGeneralGitApplication from './page-application-create-general-git-application/page-application-create-general-git-application'

export interface PageApplicationCreateGeneralProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  organization?: OrganizationEntity
}

export function PageApplicationCreateGeneral(props: PageApplicationCreateGeneralProps) {
  const { control, getValues, watch, formState } = useFormContext<GlobalData>()
  watch('applicationSource')

  watch((data) => {
    console.log(data)
  })

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
          name="applicationSource"
          control={control}
          rules={{
            required: 'Please select a source.',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputSelect
              className="mb-6"
              onChange={field.onChange}
              value={field.value}
              options={[
                { value: ServiceTypeEnum.APPLICATION, label: 'Git provider', icon: IconEnum.GITHUB },
                { value: ServiceTypeEnum.CONTAINER, label: 'Container Registry', icon: IconEnum.GITHUB },
              ]}
              label="Application source"
              error={error?.message}
            />
          )}
        />

        <div className="border-b border-b-element-light-lighter-400 mb-6"></div>
        {getValues().applicationSource === ServiceTypeEnum.APPLICATION && (
          <PageApplicationCreateGeneralGitApplication />
        )}

        {getValues().applicationSource === ServiceTypeEnum.CONTAINER && (
          <PageApplicationCreateGeneralContainer organization={props.organization} />
        )}

        <div className="flex justify-between">
          <Button type="button" size={ButtonSize.XLARGE} style={ButtonStyle.STROKED}>
            Cancel
          </Button>
          <Button type="submit" disabled={!formState.isValid} size={ButtonSize.XLARGE} style={ButtonStyle.BASIC}>
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}

export default PageApplicationCreateGeneral
