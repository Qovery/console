import { Icon } from '@qovery/shared/ui'

export function BenefitsCard() {
  const LIST = [
    'An organization is a shared account where developers can collaborate across many projects at once. This is the where you will manage your projects, team members, clusters and billing.',
    'A project allows you to group a set of applications and their dependencies (databases & other services) into environments (prod, staging, dev etc..). An organization can contain multiple projects.',
  ]

  return (
    <div className="w-80 rounded-md border border-neutral-250 bg-white">
      <div className="p-8">
        <span className="text-4xl" role="img" aria-label="light">
          💡
        </span>
        <h2 className="h5 mb-5 mt-5 text-neutral-400">What is an organization, what is a project?</h2>
        <ul className="ml-2 text-sm">
          {LIST.map((l, index) => (
            <li
              className="mb-2 flex gap-3 text-neutral-400 before:mt-2 before:h-1 before:w-1 before:shrink-0 before:rounded-full before:bg-neutral-400 before:content-['']"
              key={index}
            >
              {l}
            </li>
          ))}
        </ul>
      </div>
      <div className="hidden p-8">
        <p className="mb-5 text-sm text-neutral-400">You may find these links useful</p>
        <a
          href="https://hub.qovery.com/docs/using-qovery/configuration/environment/"
          target="_blank"
          rel="noreferrer"
          className="link mb-3 block text-sm text-sky-500"
        >
          How to configure an environment <Icon name="icon-solid-arrow-up-right-from-square" />
        </a>
        <a
          href="https://hub.qovery.com/docs/using-qovery/configuration/environment/"
          target="_blank"
          rel="noreferrer"
          className="link block text-sm text-sky-500"
        >
          Set parameters on my environment <Icon name="icon-solid-arrow-up-right-from-square" />
        </a>
      </div>
    </div>
  )
}

export default BenefitsCard
