import { Icon } from '@console/shared/ui'

export function BenefitsCard() {
  const LIST = [
    'An environment help you to amet minim mollit non deserunt.',
    'Ullamco est sit aliqua dolor do amet sint.',
    'Velit officia consequat duis enim velit mollit.',
    'Exercitation veniam consequat sunt nostrud amet.',
  ]

  return (
    <div className="w-80 bg-white border border-element-light-lighter-500 rounded-md ml-10">
      <div className="p-8 border-b border-element-light-lighter-500">
        <span className="text-4xl" role="img" aria-label="light">
          💡
        </span>
        <h2 className="h5 text-text-700 mt-5 mb-5">What are the benefits</h2>
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
      <div className="p-8">
        <p className="text-sm text-text-500 mb-5">You may find these links useful</p>
        <a
          href="https://hub.qovery.com/docs/getting-started/what-is-qovery/"
          target="_blank"
          rel="noreferrer"
          className="link text-accent2-500 text-sm block mb-3"
        >
          How to configure an environment <Icon name="icon-solid-arrow-up-right-from-square" />
        </a>
        <a
          href="https://hub.qovery.com/docs/getting-started/what-is-qovery/"
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
