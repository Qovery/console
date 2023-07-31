import {
  type ChangeEvent,
  type FocusEvent,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
  useEffect,
  useRef,
  useState,
} from 'react'
import { usePaymentInputs } from 'react-payment-inputs'
import { CardImages } from 'react-payment-inputs/images'
import {
  amexCrediCard,
  dinersclubCreditCard,
  discoverCreditCard,
  hipercardCreditCard,
  jcbCreditCard,
  mastercardCreditCard,
  placeholderCreditCard,
  unionpayCreditCard,
  visaCreditCard,
} from './images/credit-card-images'

export const imagesCreditCart: CardImages = {
  visa: visaCreditCard,
  jcb: jcbCreditCard,
  amex: amexCrediCard,
  discover: discoverCreditCard,
  dinersclub: dinersclubCreditCard,
  hipercard: hipercardCreditCard,
  mastercard: mastercardCreditCard,
  unionpay: unionpayCreditCard,
  placeholder: placeholderCreditCard,
}

export interface InputCreditCardProps {
  name: string
  label: string
  value?: string | number | undefined
  type?: 'number' | 'expiry' | 'cvc'
  onChange?: (e: FormEvent<HTMLInputElement>) => void
  error?: string
  disabled?: boolean
  dataTestId?: string
  className?: string
  brand?: string
}

export function InputCreditCard(props: InputCreditCardProps) {
  const { name, label, value = '', onChange, error, disabled, dataTestId, className = '' } = props

  const inputRef = useRef<HTMLDivElement>(null)
  const [focused, setFocused] = useState(false)
  const [currentValue, setCurrentValue] = useState(value)
  const { getCardNumberProps, getExpiryDateProps, getCVCProps, getCardImageProps } = usePaymentInputs()
  const [inputAttribute, setInputAttribute] = useState<{
    'aria-label': string
    autoComplete: string
    id: string
    name: string
    placeholder: string
    type: string
    onBlur: MouseEvent<HTMLInputElement>
    onChange: ChangeEvent<HTMLInputElement>
    onFocus: FocusEvent<HTMLInputElement>
    onKeyPress: KeyboardEvent<HTMLInputElement>
  }>()

  useEffect(() => {
    setCurrentValue(value)
  }, [value, setCurrentValue])

  const hasFocus = focused
  const hasLabelUp =
    hasFocus || (currentValue?.toString() && currentValue?.toString().length > 0) ? 'input--label-up' : ''

  const hasError = error && error.length > 0 ? 'input--error' : ''

  const isDisabled = disabled ? 'input--disabled !border-element-light-lighter-500' : ''

  useEffect(() => {
    switch (props.type) {
      case 'number':
        setInputAttribute({
          ...getCardNumberProps({
            onChange: (e: ChangeEvent<HTMLInputElement>) => {
              if (onChange) onChange(e)
              setCurrentValue(e.currentTarget.value)
            },
            onBlur: () => setFocused(false),
            onFocus: () => setFocused(true),
          }),
        })
        break
      case 'expiry':
        setInputAttribute({
          ...getExpiryDateProps({
            onChange: (e: ChangeEvent<HTMLInputElement>) => {
              if (onChange) onChange(e)
              setCurrentValue(e.currentTarget.value)
            },
            onBlur: () => setFocused(false),
            onFocus: () => setFocused(true),
          }),
        })
        break
      case 'cvc':
        setInputAttribute({
          ...getCVCProps({
            onChange: (e: ChangeEvent<HTMLInputElement>) => {
              if (onChange) onChange(e)
              setCurrentValue(e.currentTarget.value)
            },
            onBlur: () => setFocused(false),
            onFocus: () => setFocused(true),
          }),
        })
        break
    }
  }, [props.type, getCardNumberProps, getExpiryDateProps, getCVCProps, onChange, setCurrentValue, setFocused])

  return (
    <div className={className} data-testid={`${dataTestId || 'input-text'}-wrapper`}>
      <div className="relative">
        <div
          aria-label="input-container"
          className={`input ${props.type === 'number' ? '!pl-12' : ''} ${isDisabled} ${hasError} ${hasLabelUp} `}
          ref={inputRef}
        >
          {props.type === 'number' && (
            <svg
              data-testid="credit-card-image"
              className="absolute -translate-x-full -ml-3 -translate-y-1/2 top-1/2 z-10 w-6 h-4"
              {...(!props.brand
                ? getCardImageProps({ images: imagesCreditCart })
                : { children: imagesCreditCart[props.brand as keyof CardImages] })}
            ></svg>
          )}
          <div className={`${disabled ? 'pointer-events-none' : ''}`}>
            <label htmlFor={label} className={`${hasFocus ? 'text-xs' : 'text-sm translate-y-2'}`}>
              {label}
            </label>
            {inputAttribute && (
              <input
                data-testid={dataTestId || 'input-text'}
                {...inputAttribute}
                placeholder={undefined}
                name={name}
                id={label}
                className={`input__value ${props.type === 'number' ? '!pl-12' : ''}`}
                disabled={disabled}
                value={currentValue}
              />
            )}
          </div>
        </div>
      </div>
      {error && <p className="px-4 mt-1 font-medium text-xs text-error-500">{error}</p>}
    </div>
  )
}

export default InputCreditCard
