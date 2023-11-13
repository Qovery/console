import { type BaseLink } from '@qovery/shared/ui'
import { PageGeneral } from '../../ui/page-general/page-general'

export function PageGeneralFeature() {
  const listHelpfulLinks: BaseLink[] = [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/environment/',
      linkLabel: 'How to manage my environment',
    },
  ]

  return <PageGeneral listHelpfulLinks={listHelpfulLinks} />
}

export default PageGeneralFeature
