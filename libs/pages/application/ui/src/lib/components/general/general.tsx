/* eslint-disable-next-line */
import { ApplicationEntity } from '@console/shared/interfaces'
import { BaseLink, HelpSection, Skeleton } from '@console/shared/ui'
import About from '../about/about'

export interface GeneralProps {
  application?: ApplicationEntity
  listHelpfulLinks: BaseLink[]
}

export function GeneralPage(props: GeneralProps) {
  const { application, listHelpfulLinks } = props

  return (
    <div className="mt-2 bg-white rounded flex flex-grow">
      <div className="flex h-full flex-col flex-grow">
        <div className="py-7 px-10 flex-grow">
          <div className="flex border border-element-light-lighter-400 mb-4">
            <div className="flex-1 border-r border-element-light-lighter-400 px-6 py-3">
              <strong className="text-sm mb-1 text-text-400">Running Instances</strong>
              <Skeleton height={16} width={48} show={application?.instances?.loadingStatus === 'loading'}>
                <div className="h4 text-black">–</div>
              </Skeleton>
            </div>
            <div className="flex-1  px-6 py-3">
              <strong className="text-sm mb-1 text-text-400">Service Stability</strong>
              <div className="h4 text-black">–</div>
            </div>
          </div>

          {application?.instances && application?.instances.items?.length && (
            <table className="w-full border border-element-light-lighter-400">
              <thead>
                <tr className="text-xs text-text-400 font-medium">
                  <td className="border border-element-light-lighter-400 px-6 py-4">Instance name</td>
                  <td className="border border-element-light-lighter-400 px-6 py-4">RAM usage</td>
                  <td className="border border-element-light-lighter-400 px-6 py-4">vCPU</td>
                  <td className="border border-element-light-lighter-400 px-6 py-4">Storage</td>
                </tr>
              </thead>
              <tbody>
                {application.instances.items?.map((instance) => {
                  return (
                    <tr className="text-xs text-text-500 font-medium" key={instance.name}>
                      <td className="border border-element-light-lighter-400 px-6 py-4">{instance.name}</td>
                      <td className="border border-element-light-lighter-400 px-6 py-4">
                        {instance.memory?.consumed_in_percent}%
                      </td>
                      <td className="border border-element-light-lighter-400 px-6 py-4">
                        {instance.cpu?.consumed_in_percent}%
                      </td>
                      <td className="border border-element-light-lighter-400 px-6 py-4">–</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
        <HelpSection description="Need help? You may find these links useful" links={listHelpfulLinks}></HelpSection>
      </div>
      <div className="w-left-help-sidebar py-10 border-l border-element-light-lighter-400">
        <About
          description={application?.description || ''}
          link={{
            link: application?.git_repository?.url || '',
            linkLabel: application?.git_repository?.provider,
            external: true,
          }}
          buildMode={application?.build_mode}
          gitProvider={application?.git_repository?.provider}
        />
      </div>
    </div>
  )
}

export default GeneralPage
