import {
  Checkbox,
  HighlightText,
  InputSelect,
  InputSelectSmall,
  InputText,
  InputTextSmall,
  InputToggle,
  Truncate,
} from '@qovery/shared/ui'
import { type CatalogVariableField, type CatalogVariableValue } from '@qovery/shared/util-js'

export interface CatalogVariableInputProps {
  autoFocus?: boolean
  booleanControl?: 'checkbox' | 'toggle'
  error?: string
  field: CatalogVariableField
  // Search text highlighted in the label and description (row layout only).
  highlight?: string
  layout?: 'card' | 'row'
  onChange: (value: CatalogVariableValue) => void
  value: CatalogVariableValue | undefined
}

const DESCRIPTION_TRUNCATE_LIMIT = 200
const formatDescription = (description: string) => description.replace(/([.!?])\s+/g, '$1\n')

export function CatalogVariableDescription({ description, highlight }: { description: string; highlight?: string }) {
  const formattedDescription = formatDescription(description)

  return (
    <p className="line-clamp-3 whitespace-pre-line text-sm text-neutral-subtle">
      {highlight?.trim() ? (
        // Truncating could hide the match, so the full description is shown while searching.
        <HighlightText text={formattedDescription} highlight={highlight} />
      ) : (
        <Truncate
          text={formattedDescription}
          truncateLimit={DESCRIPTION_TRUNCATE_LIMIT}
          defaultTooltipLimit={formattedDescription.length + 1}
          classNameContent="max-w-lg whitespace-pre-line"
        />
      )}
    </p>
  )
}

function CatalogVariableControl({
  autoFocus,
  booleanControl = 'toggle',
  error,
  field,
  onChange,
  value,
}: Omit<CatalogVariableInputProps, 'layout'>) {
  if (field.type === 'bool') {
    if (booleanControl === 'checkbox') {
      return (
        <Checkbox
          name={field.key}
          id={field.key}
          autoFocus={autoFocus}
          checked={typeof value === 'boolean' ? value : false}
          onCheckedChange={(checked) => {
            if (checked === 'indeterminate') return
            onChange(checked)
          }}
        />
      )
    }

    return (
      <InputToggle
        small
        value={typeof value === 'boolean' ? value : false}
        ariaLabel={field.label}
        autoFocus={autoFocus}
        onChange={onChange}
      />
    )
  }

  if (field.allowedValues?.length) {
    return (
      <InputSelectSmall
        name={field.key}
        ariaLabel={field.label}
        inputClassName="h-10"
        defaultValue={typeof value === 'string' ? value : ''}
        items={field.allowedValues.map((allowedValue) => ({ label: allowedValue, value: allowedValue }))}
        onChange={(nextValue) => {
          if (nextValue !== undefined) onChange(nextValue)
        }}
      />
    )
  }

  return (
    <InputTextSmall
      name={field.key}
      id={field.key}
      label={field.label}
      className="w-full [&>div[data-testid=input]]:!h-10 [&>div[data-testid=input]]:!min-h-10"
      type={field.type === 'number' ? 'number' : field.sensitive ? 'password' : 'text'}
      value={typeof value === 'string' ? value : ''}
      error={error}
      hasShowPasswordButton={field.sensitive}
      autoFocus={autoFocus}
      onChange={(event) => onChange(event.currentTarget.value)}
    />
  )
}

function CatalogVariableInputRow({
  autoFocus,
  booleanControl,
  error,
  field,
  highlight,
  onChange,
  value,
}: Omit<CatalogVariableInputProps, 'layout'>) {
  return (
    <div className="flex flex-col gap-4 border-b border-neutral p-4 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-sm text-neutral">
          <HighlightText text={field.label} highlight={highlight} />
        </p>
        {field.description ? (
          <CatalogVariableDescription description={field.description} highlight={highlight} />
        ) : null}
      </div>
      <div className={field.type === 'bool' ? 'flex shrink-0 flex-col items-end' : 'w-full shrink-0 md:w-[400px]'}>
        <CatalogVariableControl
          autoFocus={autoFocus}
          booleanControl={booleanControl}
          error={error}
          field={field}
          onChange={onChange}
          value={value}
        />
        {error && (field.type === 'bool' || field.allowedValues?.length) ? (
          <p className="mt-1 text-xs font-medium text-negative">{error}</p>
        ) : null}
      </div>
    </div>
  )
}

export function CatalogVariableInput({
  autoFocus,
  booleanControl = 'toggle',
  error,
  field,
  highlight,
  layout = 'card',
  onChange,
  value,
}: CatalogVariableInputProps) {
  if (layout === 'row') {
    return (
      <CatalogVariableInputRow
        autoFocus={autoFocus}
        booleanControl={booleanControl}
        error={error}
        field={field}
        highlight={highlight}
        onChange={onChange}
        value={value}
      />
    )
  }

  // Bool fields take precedence over allowedValues: a bool field carrying allowed
  // values must keep emitting booleans, not the allowed-value strings.
  if (field.type === 'bool') {
    if (booleanControl === 'toggle') {
      return (
        <div className="rounded-md border border-neutral bg-surface-neutral px-3 py-3">
          <InputToggle
            small
            align="top"
            name={field.key}
            value={typeof value === 'boolean' ? value : false}
            title={field.label}
            description={field.description}
            ariaLabel={field.label}
            autoFocus={autoFocus}
            onChange={onChange}
          />
          {error ? <p className="mt-1 pl-11 text-xs text-negative">{error}</p> : null}
        </div>
      )
    }

    return (
      <div className="rounded-md border border-neutral bg-surface-neutral px-3 py-3">
        <div className="flex items-center gap-2">
          <Checkbox
            name={field.key}
            id={field.key}
            autoFocus={autoFocus}
            checked={typeof value === 'boolean' ? value : false}
            onCheckedChange={(checked) => {
              if (checked === 'indeterminate') return
              onChange(checked)
            }}
          />
          <label htmlFor={field.key} className="cursor-pointer text-sm leading-5 text-neutral">
            {field.label}
          </label>
        </div>
        {field.description ? (
          <p className="mt-1 pl-6 text-ssm leading-[18px] text-neutral-subtle">{field.description}</p>
        ) : null}
        {error ? <p className="mt-1 pl-6 text-xs text-negative">{error}</p> : null}
      </div>
    )
  }

  if (field.allowedValues?.length) {
    return (
      <InputSelect
        label={field.label}
        value={typeof value === 'string' ? value : ''}
        options={field.allowedValues.map((allowedValue) => ({ label: allowedValue, value: allowedValue }))}
        hint={field.description}
        error={error}
        autoFocus={autoFocus}
        onChange={(value) => {
          if (Array.isArray(value)) return
          onChange(value)
        }}
      />
    )
  }

  return (
    <InputText
      name={field.key}
      label={field.label}
      type={field.type === 'number' ? 'number' : field.sensitive ? 'password' : 'text'}
      value={typeof value === 'string' ? value : ''}
      error={error}
      hint={field.description}
      autoFocus={autoFocus}
      onChange={(event) => onChange(event.currentTarget.value)}
    />
  )
}
