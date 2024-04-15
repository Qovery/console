import { type CloudProviderEnum } from 'qovery-typescript-axios'
import { type FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { ClusterResourcesSettingsFeature } from '@qovery/shared/console-shared'
import { ButtonLegacy, ButtonLegacySize, ButtonLegacyStyle, Heading, Section } from '@qovery/shared/ui'

export interface PageSettingsResourcesProps {
  loading?: boolean
  onSubmit: FormEventHandler<HTMLFormElement>
  cloudProvider?: CloudProviderEnum
  clusterRegion?: string
}

export function PageSettingsResources(props: PageSettingsResourcesProps) {
  const { onSubmit, loading } = props
  const { formState } = useFormContext()
  return (
    <div className="flex flex-col justify-between w-full">
      <Section className="p-8 max-w-content-with-navigation-left">
        <Heading className="mb-8">Resources settings</Heading>
        <form onSubmit={onSubmit}>
          <ClusterResourcesSettingsFeature
            cloudProvider={props.cloudProvider}
            fromDetail={true}
            clusterRegion={props.clusterRegion}
          />
          <div className="flex justify-end">
            <ButtonLegacy
              dataTestId="submit-button"
              className="btn--no-min-w"
              size={ButtonLegacySize.LARGE}
              style={ButtonLegacyStyle.BASIC}
              type="submit"
              disabled={!formState.isValid}
              loading={loading}
            >
              Save
            </ButtonLegacy>
          </div>
        </form>
      </Section>
    </div>
  )
}

export default PageSettingsResources
