import { StepCompany } from '@console/pages/onboarding/ui'
import { useDocumentTitle } from '@console/shared/utils'

export function OnboardingCompany() {
  useDocumentTitle('Onboarding Personalize - Qovery')

  const dataSize = [
    {
      label: '1-10',
      value: '1-10',
    },
    {
      label: '11-50',
      value: '11-50',
    },
    {
      label: '51-200',
      value: '51-200',
    },
    {
      label: '201-500',
      value: '201-500',
    },
    {
      label: '500+',
      value: '500+',
    },
  ]

  const dataRole = [
    {
      label: 'Tech Lead',
      value: 'tech-lead',
    },
    {
      label: 'Software Developer',
      value: 'software-developer',
    },
    {
      label: 'DevOps',
      value: 'devops',
    },
    {
      label: 'Product/Project Manager',
      value: 'product-project-manager',
    },
    {
      label: 'CTO',
      value: 'cto',
    },
    {
      label: 'Founder',
      value: 'founder',
    },
    {
      label: 'Other',
      value: 'other',
    },
  ]

  return <StepCompany dataSize={dataSize} dataRole={dataRole} />
}

export default OnboardingCompany
