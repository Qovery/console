import type { Component } from '@chargebee/chargebee-js-types/cb-types/hosted_fields/common/base-types'
import type { Events } from '@chargebee/chargebee-js-types/cb-types/hosted_fields/common/enums'
import type { CbToken, ComponentOptions } from '@chargebee/chargebee-js-types/cb-types/hosted_fields/common/types'
import type CbInstance from '@chargebee/chargebee-js-types/cb-types/models/cb-instance'
import Color from 'color'
import { CHARGEBEE_PUBLISHABLE_KEY } from '@qovery/shared/util-node-env'

interface ChargebeeTokenizeResult extends CbToken {
  card?: {
    last4: string
    brand: string
    expiry_month: number
    expiry_year: number
  }
}

type ChargebeeGlobal = {
  init(config: { site: string; publishableKey: string }): CbInstance
}

const CHARGEBEE_SITE = 'qovery'

let chargebeeInstance: CbInstance | null = null
let chargebeeLoadPromise: Promise<CbInstance> | null = null

/**
 * Load Chargebee.js script dynamically
 * This ensures we only load the script once and reuse the instance
 */
export function loadChargebee(): Promise<CbInstance> {
  // Return existing promise if already loading
  if (chargebeeLoadPromise) {
    return chargebeeLoadPromise
  }

  // Return existing instance if already loaded
  if (chargebeeInstance) {
    return Promise.resolve(chargebeeInstance)
  }

  chargebeeLoadPromise = new Promise((resolve, reject) => {
    // Check if Chargebee is already loaded globally
    const chargebeeGlobal = (window as Window & { Chargebee?: ChargebeeGlobal }).Chargebee
    if (chargebeeGlobal) {
      chargebeeInstance = chargebeeGlobal.init({
        site: CHARGEBEE_SITE,
        publishableKey: CHARGEBEE_PUBLISHABLE_KEY,
      })
      if (!chargebeeInstance) {
        reject(new Error('Failed to initialize Chargebee'))
        return
      }
      // Load components module for React wrapper
      chargebeeInstance
        .load('components')
        .then(() => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          resolve(chargebeeInstance!)
        })
        .catch(() => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          resolve(chargebeeInstance!)
        })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://js.chargebee.com/v2/chargebee.js'
    script.async = true

    script.onload = () => {
      const chargebeeGlobal = (window as Window & { Chargebee?: ChargebeeGlobal }).Chargebee
      if (!chargebeeGlobal) {
        reject(new Error('Chargebee.js failed to load'))
        return
      }

      chargebeeInstance = chargebeeGlobal.init({
        site: CHARGEBEE_SITE,
        publishableKey: CHARGEBEE_PUBLISHABLE_KEY,
      })
      if (!chargebeeInstance) {
        reject(new Error('Failed to initialize Chargebee'))
        return
      }
      // Load components module for React wrapper
      chargebeeInstance
        .load('components')
        .then(() => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          resolve(chargebeeInstance!)
        })
        .catch((error: Error) => {
          console.warn('Failed to load Chargebee components module:', error)
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          resolve(chargebeeInstance!)
        })
    }

    script.onerror = () => {
      reject(new Error('Failed to load Chargebee.js script'))
    }

    document.head.appendChild(script)
  })

  return chargebeeLoadPromise
}

/**
 * Get the Chargebee instance (must be loaded first)
 */
export function getChargebeeInstance(): CbInstance | null {
  return chargebeeInstance
}

export interface CardDetails {
  number: string
  cvv: string
  expiryMonth: number
  expiryYear: number
}

export interface ChargebeeTokenResult {
  token: string
  card: {
    lastFourDigits: string
    brand: string
    expiryMonth: number
    expiryYear: number
  }
}

export const fieldCardStyles = () => {
  const styles = getComputedStyle(document.documentElement)
  const getColor = (color: string) => Color(styles.getPropertyValue(color)).rgb().string()

  return {
    base: {
      color: getColor('--neutral-12'),
      iconColor: getColor('--neutral-10'),
      fontWeight: '400',
      fontFamily: 'Roboto, Helvetica, sans-serif',
      fontSize: '14px',
      lineHeight: '1.25rem',
      letterSpacing: '0.0025em',
      fontSmoothing: 'antialiased',
      '::placeholder': {
        color: getColor('--neutral-10'),
      },
      ':focus': {
        color: getColor('--neutral-12'),
      },
      ':hover': {
        color: getColor('--neutral-12'),
      },
    },
    invalid: {
      color: getColor('--negative-11'),
      iconColor: getColor('--negative-11'),
      ':focus': {
        color: getColor('--negative-11'),
      },
    },
  }
}
