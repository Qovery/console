import { BlockContentDelete, HelpSection } from '@console/shared/ui'

export interface PageSettingsDangerZoneProps {
  deleteEnvironment: () => void
}

export function PageSettingsDangerZone(props: PageSettingsDangerZoneProps) {
  const { deleteEnvironment } = props

  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8">
        <BlockContentDelete
          className="w-[580px]"
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
        />
      </div>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/environment/#delete-an-environment',
            linkLabel: 'How to delete my environment',
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageSettingsDangerZone
