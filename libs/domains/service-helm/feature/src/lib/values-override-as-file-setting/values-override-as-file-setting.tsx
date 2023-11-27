export type Tabs = 'GIT_REPOSITORY' | 'YAML'

export interface ValuesOverrideAsFileSettingProps {
  currentTab: Tabs
  setCurrentTab: (tab: Tabs) => void
}

export function ValuesOverrideAsFileSetting({ currentTab, setCurrentTab }: ValuesOverrideAsFileSettingProps) {
  const switchActiveClassName = 'bg-neutral-150 border border-neutral-250 cursor-default'

  return (
    <>
      <div className="flex h-9 text-xs font-medium rounded overflow-hidden">
        <button
          className={`w-full border rounded-l ${
            currentTab === 'GIT_REPOSITORY'
              ? switchActiveClassName
              : 'border-neutral-200 text-neutral-350 border-r-0 transition hover:bg-neutral-100 hover:text-neutral-500'
          }`}
          onClick={(event) => {
            event.preventDefault()
            setCurrentTab('GIT_REPOSITORY')
          }}
        >
          Git repository
        </button>
        <button
          className={`w-full border rounded-r ${
            currentTab === 'YAML'
              ? switchActiveClassName
              : 'border-neutral-200 text-neutral-350 border-l-0 transition hover:bg-neutral-100 hover:text-neutral-500'
          }`}
          onClick={(event) => {
            event.preventDefault()
            setCurrentTab('YAML')
          }}
        >
          Raw YAML
        </button>
      </div>
      {currentTab === 'YAML' && <div>Not available</div>}
    </>
  )
}

export default ValuesOverrideAsFileSetting
