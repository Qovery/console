import { Button, Icon } from '@console/shared/ui'

export interface NoRulesProps {
  list: string[]
  linkNewRule: string
}

export function NoRules(props: NoRulesProps) {
  const { linkNewRule, list } = props

  return (
    <div className="flex-grow overflow-y-auto flex">
      <div className="flex justify-center items-center flex-grow">
        <div className="flex flex-col items-center">
          <img
            className="w-12 pointer-events-none user-none mb-5"
            src="/assets/images/event-placeholder-light.svg"
            alt="Event placeholder"
          />
          <h2 className="text-base text-text-600 font-medium mb-1">
            Create your first Deployment Rules <span role="img">🕹</span>
          </h2>
          <p className="text-sm text-text-500 max-w-[420px] text-center mb-5">
            Events enable you to Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint.
          </p>
          <Button link={linkNewRule}>Create Deployment Rule</Button>
        </div>
      </div>
      <div className="w-right-help-sidebar border-l border-element-light-lighter-400">
        <div className="p-10 border-b border-element-light-lighter-400">
          <span className="flex justify-center items-center rounded bg-accent1-500 w-7 h-7 text-sm text-white">
            <Icon name="icon-solid-lightbulb" />
          </span>
          <h2 className="h5 text-text-700 mt-5 mb-5">What is an organization, what is a project?</h2>
          <ul className="text-sm ml-2">
            {list.map((l, index) => (
              <li
                className="text-text-500 mb-2 flex gap-3 before:content-[''] before:w-1 before:h-1 before:rounded-full before:shrink-0 before:mt-2 before:bg-text-500"
                key={index}
              >
                {l}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-10">
          <p className="text-sm text-text-500 mb-5">You may find these links useful</p>
          <a
            href="https://hub.qovery.com/docs/using-qovery/configuration/environment/"
            target="_blank"
            rel="noreferrer"
            className="link text-accent2-500 text-sm block mb-3"
          >
            How to configure an environment <Icon name="icon-solid-arrow-up-right-from-square" />
          </a>
          <a
            href="https://hub.qovery.com/docs/using-qovery/configuration/environment/"
            target="_blank"
            rel="noreferrer"
            className="link text-accent2-500 text-sm block"
          >
            Set parameters on my environment <Icon name="icon-solid-arrow-up-right-from-square" />
          </a>
        </div>
      </div>
    </div>
  )
}

export default NoRules
