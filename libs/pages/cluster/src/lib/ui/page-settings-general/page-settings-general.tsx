import { type FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { ClusterGeneralSettings } from '@qovery/shared/console-shared'
import { BlockContent, Button, Heading, Section } from '@qovery/shared/ui'

export interface PageSettingsGeneralProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  loading?: boolean
}

export function PageSettingsGeneral(props: PageSettingsGeneralProps) {
  const { onSubmit, loading } = props
  const { formState } = useFormContext()

  return (
    <div className="flex flex-col justify-between w-full">
      <Section className="p-8 max-w-content-with-navigation-left">
        <Heading className="mb-8">General settings</Heading>
        <form onSubmit={onSubmit}>
          <BlockContent title="General information">
            <ClusterGeneralSettings fromDetail />
          </BlockContent>
          <div className="flex justify-end">
            <Button type="submit" size="lg" loading={loading} disabled={!formState.isValid}>
              Save
            </Button>
          </div>
        </form>
      </Section>
    </div>
  )
}

export default PageSettingsGeneral
