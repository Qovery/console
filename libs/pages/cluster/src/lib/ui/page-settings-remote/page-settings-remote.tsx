import { type FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { ClusterRemoteSettings, SettingsHeading } from '@qovery/shared/console-shared'
import { Button, Section } from '@qovery/shared/ui'

export interface PageSettingsRemoteProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  loading: boolean
}

export function PageSettingsRemote(props: PageSettingsRemoteProps) {
  const { onSubmit, loading } = props
  const { formState } = useFormContext()

  return (
    <div className="flex flex-col justify-between w-full">
      <Section className="p-8 max-w-content-with-navigation-left">
        <SettingsHeading title="Remote access" />
        <form onSubmit={onSubmit}>
          <ClusterRemoteSettings fromDetail />
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

export default PageSettingsRemote
