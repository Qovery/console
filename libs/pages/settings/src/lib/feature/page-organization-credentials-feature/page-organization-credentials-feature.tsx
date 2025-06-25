import { Suspense } from 'react'
import { NeedHelp } from '@qovery/shared/assistant/feature'
import { BlockContent, Heading, Section, Skeleton } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { PageOrganizationCredentials } from '../../ui/page-organization-credentials/page-organization-credentials'

const Loader = () =>
  [0, 1, 2, 3].map((_, i) => (
    <div
      key={i}
      className="flex w-full items-center justify-between gap-3 border-b border-neutral-250 px-5 py-4 last:border-0"
    >
      <Skeleton width={200} height={44} show={true} />
      <div className="flex gap-2">
        <Skeleton width={44} height={44} show={true} />
        <Skeleton width={44} height={44} show={true} />
      </div>
    </div>
  ))

export function PageOrganizationCredentialsFeature() {
  useDocumentTitle('Cloud Crendentials - Organization settings')

  return (
    <div className="w-full">
      <Section className="flex max-w-content-with-navigation-left flex-col p-8">
        <div className="space-y-3">
          <Heading>Cloud Credentials</Heading>
          <p className="text-xs text-neutral-400">Manage your Cloud providers credentials</p>
          <NeedHelp />
        </div>

        <BlockContent title="Configured credentials" classNameContent="p-0" className="mt-8">
          <Suspense fallback={<Loader />}>
            <PageOrganizationCredentials />
          </Suspense>
        </BlockContent>
      </Section>
    </div>
  )
}

export default PageOrganizationCredentialsFeature
