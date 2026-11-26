/*
 * The builder picker: for a service's build settings in the console. Each size shows its CPU and
 * RAM, how many of the plan's minutes a build minute counts, and what a build minute costs beyond
 * the plan, so a customer picks a bigger builder knowing what it costs. Feed it the sizes from
 * billingUsage.builder_sizes (prices for billing roles) or GET /public/v1/builder-sizes.
 */
import type { BuilderSize } from 'qovery-pricing-typescript-axios'
import { money } from './format'

export interface BuilderPickerProps {
  sizes: BuilderSize[]
  /** The service's build CPU (millicores) and RAM (GiB). */
  cpuMilli: number
  ramGiB: number
  /** Called with the size picked: set build.cpu_max_in_milli and build.ram_max_in_gib to these. */
  onChange: (cpuMilli: number, ramGiB: number, size: BuilderSize) => void
  currency?: string
  /** The service's typical build, in minutes, to show what it counts on each size. */
  typicalBuildMinutes?: number
  disabled?: boolean
  /** Bigger sizes are on request: shown with this action (sales), or as the current size when a contract set one. */
  onContactSales?: () => void
}

/** The size a builder counts as: the smallest that fits both its CPU and its RAM (as pricing-api counts it). */
export function builderSizeFor(sizes: BuilderSize[], cpuMilli: number, ramGiB: number): BuilderSize | undefined {
  return sizes.find((s) => cpuMilli <= s.max_cpu_milli && ramGiB <= s.max_ram_gib)
}

export function BuilderPicker({
  sizes,
  cpuMilli,
  ramGiB,
  onChange,
  currency = 'USD',
  typicalBuildMinutes,
  disabled,
  onContactSales,
}: BuilderPickerProps) {
  const current = builderSizeFor(sizes, cpuMilli, ramGiB)
  // Listed sizes, plus an on-request size the service already builds on (set on its contract).
  const shown = sizes.filter((s) => s.listed !== false || s.code === current?.code)
  const onRequest = sizes.filter((s) => s.listed === false && s.code !== current?.code)
  return (
    <div role="radiogroup" aria-label="Builder size" className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {shown.map((s, i) => {
        const on = current?.code === s.code
        return (
          <button
            key={s.code}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={disabled}
            onClick={() => onChange(s.max_cpu_milli, s.max_ram_gib, s)}
            className={`flex flex-col items-start gap-1 rounded border p-3 text-left transition-colors disabled:opacity-50 ${on ? 'border-brand-strong bg-surface-brand-subtle' : 'border-neutral bg-surface-neutral hover:border-brand-strong'}`}
          >
            <span className="flex w-full items-center justify-between gap-2 text-sm font-medium text-neutral">
              {s.name}
              {i === 0 && <span className="text-sm font-normal text-neutral-subtle">default</span>}
            </span>
            <span className="text-sm text-neutral-subtle">
              {s.max_cpu_milli / 1000} vCPU · {s.max_ram_gib} GiB
            </span>
            {s.description && <span className="text-sm text-neutral-subtle">{s.description}</span>}
            <span className="text-sm text-neutral">
              {s.multiplier === 1 ? '1 build minute counts 1 minute' : `1 build minute counts ${s.multiplier} minutes`}
            </span>
            {typicalBuildMinutes != null && typicalBuildMinutes > 0 && (
              <span className="text-sm text-neutral-subtle">
                A {typicalBuildMinutes}-minute build counts {Math.round(typicalBuildMinutes * s.multiplier)}
              </span>
            )}
            {s.saving ? <span className="text-sm text-positive">{s.saving}% less than its size</span> : null}
            {s.price_per_minute ? (
              <span className="text-sm text-neutral-subtle">
                {money(Math.round(s.price_per_minute), currency)} / min beyond your plan
              </span>
            ) : null}
            {s.prepaid_per_minute ? (
              <span className="text-sm text-positive">
                {money(Math.round(s.prepaid_per_minute), currency)} / min with a year prepaid
              </span>
            ) : null}
          </button>
        )
      })}
      {onRequest.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-dashed border-neutral p-3 sm:col-span-3">
          <span className="text-sm text-neutral-subtle">
            Need more?{' '}
            {onRequest.map((s) => `${s.name} (${s.max_cpu_milli / 1000} vCPU, ${s.max_ram_gib} GiB)`).join(', ')} on
            request
            {onRequest.some((s) => s.saving)
              ? `, up to ${Math.max(...onRequest.map((s) => s.saving ?? 0))}% less than their size`
              : ''}
            .
          </span>
          {onContactSales && (
            <button type="button" onClick={onContactSales} className="text-xs font-medium text-brand hover:underline">
              Talk to us
            </button>
          )}
        </div>
      )}
      <p className="text-sm text-neutral-subtle sm:col-span-3">
        Deploy time always counts once. A builder above the largest size counts in proportion to its CPU and RAM.
      </p>
    </div>
  )
}
