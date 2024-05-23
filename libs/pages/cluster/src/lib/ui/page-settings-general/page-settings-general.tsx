import { type FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { ClusterGeneralSettings, SettingsHeading } from '@qovery/shared/console-shared'
import { BlockContent, Button, Section } from '@qovery/shared/ui'

export interface PageSettingsGeneralProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  loading?: boolean
}

export function PageSettingsGeneral(props: PageSettingsGeneralProps) {
  const { onSubmit, loading } = props
  const { formState } = useFormContext()

  return (
    <div className="flex w-full flex-col justify-between">
      <Section className="max-w-content-with-navigation-left p-8">
        <SettingsHeading title="General settings" />
        <form onSubmit={onSubmit}>
          <BlockContent title="General information">
            <ClusterGeneralSettings fromDetail />
          </BlockContent>
          <div className="flex justify-end">
            <Button data-testid="submit-button" type="submit" size="lg" loading={loading} disabled={!formState.isValid}>
              Save
            </Button>
          </div>
        </form>
      </Section>
    </div>
  )
}

export default PageSettingsGeneral
