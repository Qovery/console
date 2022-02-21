import { useDocumentTitle } from '@console/shared/utils'

/* eslint-disable-next-line */
export interface StepCompanyProps {}

export function StepCompany(props: StepCompanyProps) {
  useDocumentTitle('Onboarding Personalize - Qovery')

  return (
    <div>
      <h1 className="h3 text-text-700 mb-3">About your company</h1>
      <p className="text-sm mb-10 text-text-500">
        Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim
        velit mollit.
      </p>
    </div>
  )
}

export default StepCompany
