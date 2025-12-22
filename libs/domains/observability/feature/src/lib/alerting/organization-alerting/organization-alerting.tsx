import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Heading, InputSearch, Section } from '@qovery/shared/ui'
import { AlertRulesOverview } from '../alert-rules-overview/alert-rules-overview'

export function OrganizationAlerting() {
  const { organizationId = '', projectId = '' } = useParams()
  const [filter, setFilter] = useState('')

  return (
    <Section className="w-full px-8 py-6 pb-20">
      <div className="mb-8 border-b border-neutral-250">
        <div className="flex w-full items-center justify-between pb-5">
          <Heading level={1}>Alert rules</Heading>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <InputSearch
          placeholder="Search alert by name, status…"
          className="w-72"
          onChange={(value) => setFilter(value)}
        />
        <AlertRulesOverview organizationId={organizationId} projectId={projectId} filter={filter} />
      </div>
    </Section>
  )
}

export default OrganizationAlerting
