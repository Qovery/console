import { Heading, Icon, Link, Section } from '@qovery/shared/ui'

export function NotFoundPage({ error }: { error?: unknown }) {
  const errorTyped = error as Error

  return (
    <Section className="bg-white rounded-sm flex-grow items-center justify-center">
      <div className="text-center flex flex-col gap-3 items-center justify-center w-[500px] -mt-[100px]">
        <img
          className="pointer-events-none user-none w-[170px]"
          src="/assets/images/event-placeholder-light.svg"
          alt="Event placeholder"
        />
        <div>
          <Heading className="text-neutral-400 font-medium">{errorTyped?.name ?? '404'}</Heading>
          <p className="text-sm text-neutral-350">{errorTyped?.message ?? 'Not found'}</p>
        </div>
        <Link as="button" to="/" size="md" className="flex gap-2">
          Go to correct URL
          <Icon iconName="arrow-right" />
        </Link>
      </div>
    </Section>
  )
}

export default NotFoundPage
