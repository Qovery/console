import { type EnvironmentModeEnum } from 'qovery-typescript-axios'
import { BlockContentDelete } from '@qovery/shared/ui'

export interface PageSettingsDangerZoneProps {
  deleteDatabase: () => void
  databaseName?: string
  environmentMode?: EnvironmentModeEnum
}

export function PageSettingsDangerZone(props: PageSettingsDangerZoneProps) {
  const { deleteDatabase, databaseName, environmentMode } = props
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
            name: databaseName,
          }}
        />
      </div>
    </div>
  )
}

export default PageSettingsDangerZone
