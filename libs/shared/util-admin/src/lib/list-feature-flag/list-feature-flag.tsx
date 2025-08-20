import { posthog } from 'posthog-js'
import { useEffect, useState } from 'react'
import { Button, Checkbox, Icon, Popover } from '@qovery/shared/ui'
import { Flag } from '../hooks/use-flags/use-flags'

export function ListFeatureFlag() {
  const [localFlags, setLocalFlags] = useState<Record<string, boolean>>({})
  const flagKeys = Object.values(Flag)

  useEffect(() => {
    const initialFlags: Record<string, boolean> = {}
    flagKeys.forEach((key) => {
      const stored = localStorage.getItem(`flag-override-${key}`)
      if (stored !== null) {
        initialFlags[key] = stored === 'true'
      } else {
        initialFlags[key] = posthog.isFeatureEnabled(key) ?? false
      }
    })
    setLocalFlags(initialFlags)
  }, [flagKeys])

  const toggleFlag = (flagKey: string) => {
    const newValue = !localFlags[flagKey]

    setLocalFlags((prev) => ({
      ...prev,
      [flagKey]: newValue,
    }))

    localStorage.setItem(`flag-override-${flagKey}`, newValue.toString())
    window.dispatchEvent(new Event('storage'))
  }

  const resetAllFlags = () => {
    const resetFlags: Record<string, boolean> = {}

    flagKeys.forEach((flagKey) => {
      localStorage.removeItem(`flag-override-${flagKey}`)
      const posthogValue = posthog.isFeatureEnabled(flagKey) ?? false
      resetFlags[flagKey] = posthogValue
    })

    setLocalFlags(resetFlags)
    window.dispatchEvent(new Event('storage'))
  }

  const getEnabledCount = () => {
    return flagKeys.filter((flagKey) => localFlags[flagKey]).length
  }

  return (
    <div className="flex items-center gap-2">
      <Popover.Root>
        <Popover.Trigger>
          <Button variant="outline" size="xs" className="gap-1.5">
            Feature Flags ({getEnabledCount()}/{flagKeys.length})
            <Icon iconName="chevron-down" />
          </Button>
        </Popover.Trigger>
        <Popover.Content className="w-80 p-0">
          <div className="flex flex-col gap-4 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-neutral-400">Feature Flags</span>
              <Button variant="outline" size="xs" onClick={resetAllFlags}>
                Reset All
              </Button>
            </div>
            <div className="max-h-64 space-y-3 overflow-y-auto">
              {flagKeys.map((flagKey) => (
                <div key={flagKey} className="flex items-start gap-3">
                  <label className="flex flex-1 cursor-pointer items-start gap-2">
                    <Checkbox
                      checked={localFlags[flagKey] || false}
                      onCheckedChange={() => toggleFlag(flagKey)}
                      color="brand"
                    />
                    <div className="truncate text-sm font-medium text-neutral-400">{flagKey}</div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </Popover.Content>
      </Popover.Root>
    </div>
  )
}
