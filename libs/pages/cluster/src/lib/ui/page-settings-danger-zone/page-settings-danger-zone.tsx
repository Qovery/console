import { EnvironmentModeEnum } from 'qovery-typescript-axios'
import { ClusterEntity } from '@qovery/shared/interfaces'
import { BlockContentDelete, HelpSection } from '@qovery/shared/ui'

export interface PageSettingsDangerZoneProps {
  deleteCluster: () => void
  cluster?: ClusterEntity
}

export function PageSettingsDangerZone(props: PageSettingsDangerZoneProps) {
  const { deleteCluster, cluster } = props
  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8 max-w-content-with-navigation-left">
        <BlockContentDelete
          title="Uninstall cluster"
          ctaLabel="Delete cluster"
          callback={deleteCluster}
          modalConfirmation={{
            mode: EnvironmentModeEnum.PRODUCTION,
            title: 'Uninstall cluster',
            name: cluster?.name,
          }}
        />
      </div>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/clusters/#deleting-a-cluster',
            linkLabel: 'How to delete my cluster',
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageSettingsDangerZone
