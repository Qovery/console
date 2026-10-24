import { InputTextSmall, RadioGroup } from '@qovery/shared/ui'
import { type DomainRoute, type RewriteMode, receivedPath, rewriteModeOf } from '../domain-routing'

type RewriteValue = Pick<DomainRoute, 'stripPrefix' | 'rewriteTo'>

export interface RouteRewriteFieldProps {
  path: string
  value: RewriteValue
  onChange: (value: RewriteValue) => void
}

const nextValue = (mode: RewriteMode, current: RewriteValue): RewriteValue => {
  switch (mode) {
    case 'keep':
      return { stripPrefix: false }
    case 'strip':
      return { stripPrefix: true }
    case 'rewrite':
      return { stripPrefix: false, rewriteTo: current.rewriteTo ?? '/' }
  }
}

// Users ask "what does my app receive?", so every choice shows the resulting path.
export function RouteRewriteField({ path, value, onChange }: RouteRewriteFieldProps) {
  const mode = rewriteModeOf(value)
  const { sample, received } = receivedPath({ path, ...value })

  return (
    <fieldset className="flex flex-col gap-2 rounded border border-neutral bg-surface-neutral p-3">
      <legend className="px-1 text-xs font-medium text-neutral-subtle">Rewrite URL</legend>
      <RadioGroup.Root
        value={mode}
        onValueChange={(next) => onChange(nextValue(next as RewriteMode, value))}
        className="flex flex-col gap-2 text-sm text-neutral"
      >
        <label className="flex items-center gap-2">
          <RadioGroup.Item value="keep" />
          Forward the path as is
        </label>
        <label className="flex items-center gap-2 has-[:disabled]:text-neutral-disabled">
          <RadioGroup.Item value="strip" disabled={path === '/'} />
          Remove <code className="text-xs">{path}</code>
        </label>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2">
            <RadioGroup.Item value="rewrite" />
            Replace <code className="text-xs">{path}</code> with
          </label>
          <InputTextSmall
            name="rewriteTo"
            className="w-28"
            inputClassName="font-code"
            placeholder="/v2"
            value={value.rewriteTo ?? ''}
            disabled={mode !== 'rewrite'}
            onChange={(e) => onChange({ stripPrefix: false, rewriteTo: e.target.value })}
          />
        </div>
      </RadioGroup.Root>
      <p className="text-xs text-neutral-subtle">
        <code>{sample}</code> reaches your app as <code className="text-neutral">{received}</code>
      </p>
    </fieldset>
  )
}

export default RouteRewriteField
