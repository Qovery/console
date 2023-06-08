import { FormProvider, useForm } from 'react-hook-form'
import PageSettingsHealthchecks from '../../ui/page-settings-healthchecks/page-settings-healthchecks'

export function PageSettingsHealthchecksFeature() {
  const methods = useForm({ mode: 'onChange' })

  return (
    <FormProvider {...methods}>
      <PageSettingsHealthchecks loading={'loaded'} />
    </FormProvider>
  )
}

export default PageSettingsHealthchecksFeature
