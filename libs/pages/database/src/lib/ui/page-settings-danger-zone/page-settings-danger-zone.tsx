import { BlockContentDelete } from '@qovery/shared/ui'

export interface PageSettingsDangerZoneProps {
  deleteDatabase: () => void
  databaseName?: string
}

export function PageSettingsDangerZone(props: PageSettingsDangerZoneProps) {
  const { deleteDatabase, databaseName } = props
  return (
    <div className="flex w-full flex-col justify-between">
      <div className="max-w-content-with-navigation-left p-8">
        <BlockContentDelete
          title="Delete database"
          ctaLabel="Delete database"
          callback={deleteDatabase}
          modalConfirmation={{
            title: 'Delete database',
            name: databaseName,
          }}
        />
      </div>
    </div>
  )
}

export default PageSettingsDangerZone
