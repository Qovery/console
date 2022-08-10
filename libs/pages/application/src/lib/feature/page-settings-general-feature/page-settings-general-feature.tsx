import PageSettingsGeneral from '../../ui/page-settings-general/page-settings-general'

export function PageSettingsGeneralFeature() {
  const onSubmit = () => {
    console.log('submit')
  }

  return (
    <div>
      <PageSettingsGeneral onSubmit={onSubmit} />
    </div>
  )
}

export default PageSettingsGeneralFeature
