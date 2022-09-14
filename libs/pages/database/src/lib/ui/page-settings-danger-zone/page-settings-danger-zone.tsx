import { EnvironmentModeEnum } from 'qovery-typescript-axios'
import { DatabaseEntity } from '@qovery/shared/interfaces'
import { BlockContentDelete, HelpSection } from '@qovery/shared/ui'

export interface PageSettingsDangerZoneProps {
  deleteDatabase: () => void
  database?: DatabaseEntity
  environmentMode?: EnvironmentModeEnum
}

export function PageSettingsDangerZone(props: PageSettingsDangerZoneProps) {
  const { deleteDatabase, database, environmentMode } = props
  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8 max-w-content-with-navigation-left">
        <BlockContentDelete
          title="Delete database"
          ctaLabel="Delete database"
          callback={deleteDatabase}
          modalConfirmation={{
            mode: environmentMode,
            title: 'Delete database',
            description: 'To confirm the deletion of your database, please type the name of the database:',
            name: database?.name,
          }}
        />
      </div>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/database/#delete-your-database-instance',
            linkLabel: 'How to delete my database',
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageSettingsDangerZone
