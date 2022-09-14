import { Icon } from '@qovery/shared/ui'

export function BenefitsCard() {
  const LIST = [
    'An organization is a shared account where developers can collaborate across many projects at once. This is the where you will manage your projects, team members, clusters and billing.',
    'A project allows you to group a set of applications and their dependencies (databases & other services) into environments (prod, staging, dev etc..). An organization can contain multiple projects.',
  ]

  return (
    <div className="w-80 bg-white border border-element-light-lighter-500 rounded-md">
      <div className="p-8">
        <span className="text-4xl" role="img" aria-label="light">
          💡
        </span>
        <h2 className="h5 text-text-700 mt-5 mb-5">What is an organization, what is a project?</h2>
        <ul className="text-sm ml-2">
          {LIST.map((l, index) => (
            <li
              className="text-text-500 mb-2 flex gap-3 before:content-[''] before:w-1 before:h-1 before:rounded-full before:shrink-0 before:mt-2 before:bg-text-500"
              key={index}
            >
              {l}
            </li>
          ))}
        </ul>
      </div>
      <div className="p-8 hidden">
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
  )
}

export default BenefitsCard
