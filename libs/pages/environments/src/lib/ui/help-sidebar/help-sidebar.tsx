import { Icon, Link } from '@qovery/shared/ui'

export function HelpSidebar() {
  const LIST = [
    'Cloud cost optimization: Using the Deployment Rules is a good practice to drastically reduce your cost.',
    'Time optimization: Configuring your environments, managing, starting, shutting down all takes valuable time from your developers.',
  ]

  return (
    <div className="w-right-help-sidebar border-l border-element-light-lighter-400 relative">
      <div className="sticky top-14">
        <div className="p-10 border-b border-element-light-lighter-400">
          <span className="flex justify-center items-center rounded bg-purple-500 w-7 h-7 text-sm text-white">
            <Icon name="icon-solid-lightbulb" />
          </span>
          <h2 className="h5 text-zinc-400 mt-5 mb-5">Why using Deployment Rule?</h2>
          <ul className="text-sm ml-2">
            {LIST.map((l, index) => (
              <li
                className="text-zinc-400 mb-2 flex gap-3 before:content-[''] before:w-1 before:h-1 before:rounded-full before:shrink-0 before:mt-2 before:bg-zinc-400"
                key={index}
              >
                {l}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-10">
          <p className="text-sm text-zinc-400 mb-5">Need help? You may find these links useful</p>
          <Link
            className="font-medium text-sky-500 text-sm block mb-3"
            link="https://hub.qovery.com/docs/using-qovery/configuration/deployment-rule/#why-using-deployment-rule"
            linkLabel="How to configure an deployment rule"
            external
            iconRight="icon-solid-arrow-up-right-from-square"
          />
        </div>
      </div>
    </div>
  )
}

export default HelpSidebar
