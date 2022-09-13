import { FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { IconEnum, ServiceTypeEnum } from '@console/shared/enums'
import { Button, ButtonSize, ButtonStyle, InputSelect, InputText, Link } from '@console/shared/ui'
import { GlobalData } from '../../../../../../services/src/lib/feature/page-application-create-feature/interfaces.interface'

export interface PageApplicationCreateGeneralProps {
  onSubmit: FormEventHandler<HTMLFormElement>
}

export function PageApplicationCreateGeneral(props: PageApplicationCreateGeneralProps) {
  const { control, formState, getValues, watch } = useFormContext<GlobalData>()
  console.log(control, formState, getValues().applicationSource)
  watch('applicationSource')

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
            required: 'Please enter a variable key.',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              className="mb-6"
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
        {getValues().applicationSource}
        {getValues().applicationSource === ServiceTypeEnum.APPLICATION && (
          <div>
            <p className="mb-3 text-sm text-text-500">
              For Applications created from a Registry, fill the informations below
            </p>
            <Controller
              name="registry"
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
          </div>
        )}

        {getValues().applicationSource === ServiceTypeEnum.CONTAINER && <h1>Container</h1>}

        <div className="flex justify-between">
          <Button type="button" size={ButtonSize.XLARGE} style={ButtonStyle.STROKED}>
            Cancel
          </Button>
          <Button type="submit" size={ButtonSize.XLARGE} style={ButtonStyle.BASIC}>
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}

export default PageApplicationCreateGeneral
