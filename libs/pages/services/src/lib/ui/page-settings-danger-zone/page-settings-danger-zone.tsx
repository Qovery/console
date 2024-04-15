import { type Environment } from 'qovery-typescript-axios'
import { BlockContentDelete } from '@qovery/shared/ui'

export interface PageSettingsDangerZoneProps {
  deleteEnvironment: () => void
  environment?: Environment
}

export function PageSettingsDangerZone(props: PageSettingsDangerZoneProps) {
  const { deleteEnvironment, environment } = props

  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8 max-w-content-with-navigation-left">
        <BlockContentDelete
          title="Delete Environment"
          list={[
            {
              text: 'Databases',
            },
            {
              text: 'Applications',
            },
          ]}
          ctaLabel="Delete environment"
          callback={deleteEnvironment}
          modalConfirmation={{
            mode: environment?.mode,
            title: 'Delete environment',
            name: environment?.name,
          }}
        />
      </div>
    </div>
  )
}

export default PageSettingsDangerZone
