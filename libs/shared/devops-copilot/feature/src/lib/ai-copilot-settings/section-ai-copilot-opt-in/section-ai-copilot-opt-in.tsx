import { type Organization } from 'qovery-typescript-axios'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { BlockContent, Button, Callout, Checkbox, Heading, Icon, LoaderSpinner, Section } from '@qovery/shared/ui'

export interface SectionAICopilotOptInProps {
  organization?: Organization
  isLoading?: boolean
  onEnable: () => void
}

interface OptInFormData {
  hasAcceptedTerms: boolean
}

export function SectionAICopilotOptIn({ organization, isLoading, onEnable }: SectionAICopilotOptInProps) {
  const methods = useForm<OptInFormData>({
    mode: 'onChange',
    defaultValues: {
      hasAcceptedTerms: false,
    },
  })

  const {
    control,
    formState: { isValid },
    handleSubmit,
  } = methods

  const onSubmit = handleSubmit(() => {
    onEnable()
  })

  return (
    <FormProvider {...methods}>
      <Section>
        <div className="mb-8">
          <Heading className="mb-2">AI Copilot Configuration</Heading>
          <p className="text-xs text-neutral-400">Configure your Copilot</p>
        </div>
        <Callout.Root color="purple" className="mb-6">
          <Callout.Icon>
            <Icon iconName="flask" />
          </Callout.Icon>
          <Callout.Text>
            <Callout.TextHeading>Beta Feature</Callout.TextHeading>
            <Callout.TextDescription>
              The AI Copilot is currently in beta. This is an experimental feature and functionality may change. Billing
              terms are not final and will be communicated before any charges apply.
            </Callout.TextDescription>
          </Callout.Text>
        </Callout.Root>
        <BlockContent title="Opt-in to AI Copilot" classNameContent="p-0">
          {isLoading ? (
            <div className="flex justify-center p-5">
              <LoaderSpinner className="w-5" />
            </div>
          ) : (
            <form onSubmit={onSubmit} className="p-6">
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      <Icon iconName="robot" className="mr-2 text-brand-500" />
                      <p className="text-sm font-medium text-neutral-400">Opt-in to AI Copilot</p>
                    </div>
                    <p className="text-xs text-neutral-350">
                      Please review and accept the following terms to enable AI Copilot for your organization.
                    </p>
                  </div>

                  <div className="max-h-80 overflow-y-auto rounded border border-neutral-250 bg-white p-4">
                    <h3 className="mb-3 text-sm font-semibold text-neutral-400">
                      Qovery AI Copilot - Additional Terms of Service
                    </h3>
                    <div className="space-y-4 text-xs text-neutral-350">
                      <div>
                        <p className="mb-2 font-semibold text-neutral-400">1. Introduction</p>
                        <p>
                          These AI Copilot Additional Terms ("AI Terms") supplement and are incorporated into the Qovery
                          Terms of Service. By enabling the AI Copilot feature, you agree to these AI Terms on behalf of
                          your organization.
                        </p>
                        <p className="mt-2">
                          The AI Copilot is an optional feature that leverages Anthropic's Claude AI model (Sonnet) to
                          assist users with the Qovery platform through intelligent documentation retrieval and
                          automated actions (subject to user confirmation).
                        </p>
                      </div>

                      <div>
                        <p className="mb-2 font-semibold text-neutral-400">2. Feature Description</p>
                        <p className="mb-1">The AI Copilot provides:</p>
                        <ul className="ml-4 list-disc space-y-1">
                          <li>Intelligent assistance for using the Qovery service</li>
                          <li>Execution of platform actions based on user instructions (after confirmation)</li>
                          <li>Contextual documentation and guidance retrieval</li>
                          <li>Integration with your Qovery organization's resources and configurations</li>
                        </ul>
                        <p className="mt-2">The AI Copilot operates in two modes:</p>
                        <ul className="ml-4 list-disc space-y-1">
                          <li>
                            <span className="font-medium">Read-Only Mode:</span> The AI Copilot can view your
                            infrastructure configuration, provide recommendations, and answer questions, but cannot make
                            any modifications to your resources
                          </li>
                          <li>
                            <span className="font-medium">Read-Write Mode:</span> The AI Copilot can view and modify
                            your infrastructure configuration after explicit user confirmation for each action
                          </li>
                        </ul>
                      </div>

                      <div>
                        <p className="mb-2 font-semibold text-neutral-400">3. Enablement and Authorization</p>
                        <p className="mb-2">
                          <span className="font-medium">3.1. Administrator Activation:</span> Only users with
                          Administrator-level privileges may accept these AI Terms and enable the AI Copilot for their
                          organization.
                        </p>
                        <p className="mb-2">
                          <span className="font-medium">3.2. Organization-Wide Scope:</span> By enabling the AI Copilot,
                          the Administrator activates the feature for all team members within the organization.
                        </p>
                        <p>
                          <span className="font-medium">3.3. Voluntary Adoption:</span> Use of the AI Copilot is
                          entirely optional and not required to use the Qovery platform.
                        </p>
                      </div>

                      <div>
                        <p className="mb-2 font-semibold text-neutral-400">4. Third-Party AI Services</p>
                        <p className="mb-2">
                          <span className="font-medium">4.1. Anthropic Integration:</span> The AI Copilot is powered by
                          Anthropic's Claude AI model, subject to Anthropic's Commercial Terms.
                        </p>
                        <p>
                          <span className="font-medium">4.2. Data Processing:</span> By enabling this feature, you
                          acknowledge that your queries and relevant platform context may be processed by Anthropic's AI
                          services in accordance with their terms and privacy policies.
                        </p>
                      </div>

                      <div>
                        <p className="mb-2 font-semibold text-neutral-400">
                          5. User Responsibilities and Acceptable Use
                        </p>
                        <p className="mb-2">
                          <span className="font-medium">5.1. Proper Usage:</span> You agree to use the AI Copilot solely
                          for its intended purpose of assisting with legitimate Qovery platform operations.
                        </p>
                        <p className="mb-1">
                          <span className="font-medium">5.2. Prohibited Activities:</span> You must not:
                        </p>
                        <ul className="ml-4 list-disc space-y-1">
                          <li>Attempt to manipulate, jailbreak, or bypass the AI model's safety mechanisms</li>
                          <li>Use the AI Copilot for purposes unrelated to the Qovery platform</li>
                          <li>Exploit the feature to gain unauthorized access or perform malicious activities</li>
                          <li>
                            Share, distribute, or repurpose AI-generated content in ways that violate applicable laws or
                            third-party rights
                          </li>
                        </ul>
                        <p className="mt-2">
                          <span className="font-medium">5.3. Confirmation of Actions:</span> You are responsible for
                          reviewing and confirming all actions proposed by the AI Copilot before execution. The
                          confirmation step is a critical safeguard that you must not circumvent.
                        </p>
                      </div>

                      <div>
                        <p className="mb-2 font-semibold text-neutral-400">6. Limitations of Liability</p>
                        <p className="mb-2">
                          <span className="font-medium">6.1. AI-Generated Responses:</span> The AI Copilot provides
                          suggestions and executes actions based on AI-generated interpretations. Qovery makes no
                          warranties regarding the accuracy, completeness, or appropriateness of AI-generated responses.
                        </p>
                        <p className="mb-1">
                          <span className="font-medium">6.2. User Accountability:</span> You acknowledge and agree that:
                        </p>
                        <ul className="ml-4 list-disc space-y-1">
                          <li>You bear sole responsibility for all actions taken using the AI Copilot</li>
                          <li>
                            Qovery is not liable for any damages, losses, or service disruptions resulting from AI
                            Copilot usage, including but not limited to: misconfigured resources, unintended deletions
                            or modifications, service interruptions, or data loss
                          </li>
                        </ul>
                        <p className="mt-2">
                          <span className="font-medium">6.3. No Guarantee of Safeguards:</span> While Qovery implements
                          safeguards and confirmation mechanisms, you acknowledge that no system is infallible, and you
                          assume all risk associated with using the AI Copilot.
                        </p>
                        <p className="mt-2">
                          <span className="font-medium">6.4. AS-IS Provision:</span> THE AI COPILOT IS PROVIDED "AS IS"
                          AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.
                        </p>
                      </div>

                      <div>
                        <p className="mb-2 font-semibold text-neutral-400">7. Suspension and Termination Rights</p>
                        <p className="mb-2">
                          <span className="font-medium">7.1. Qovery's Rights:</span> Qovery reserves the right, at its
                          sole discretion and without prior notice, to suspend or revoke access to the AI Copilot
                          feature for your organization, suspend or terminate your Qovery account and services, or
                          investigate suspected violations of these AI Terms.
                        </p>
                        <p>
                          <span className="font-medium">7.2. Grounds for Suspension:</span> Actions that may result in
                          suspension or termination include, but are not limited to: attempts to jailbreak, manipulate,
                          or bypass AI model constraints, abusive or malicious use, violations of applicable laws, or
                          any violation of these AI Terms or the Qovery Terms of Service.
                        </p>
                      </div>

                      <div>
                        <p className="mb-2 font-semibold text-neutral-400">8. Changes to These Terms</p>
                        <p>
                          Qovery may modify these AI Terms at any time. Continued use of the AI Copilot after changes
                          constitutes acceptance of the modified terms. Material changes will be communicated through
                          the Qovery platform or via email.
                        </p>
                      </div>

                      <div>
                        <p className="mb-2 font-semibold text-neutral-400">9. Data and Privacy</p>
                        <p className="mb-2">
                          <span className="font-medium">9.1. Data Usage:</span> Information processed through the AI
                          Copilot, including queries, commands, and platform context, may be used to provide the service
                          and improve feature functionality.
                        </p>
                        <p>
                          <span className="font-medium">9.2. Retention:</span> Conversation history and AI interactions
                          are stored in accordance with Qovery's data retention policies and applicable privacy
                          regulations.
                        </p>
                      </div>

                      <div>
                        <p className="mb-2 font-semibold text-neutral-400">10. Severability</p>
                        <p>
                          If any provision of these AI Terms is found to be unenforceable or invalid, that provision
                          will be limited or eliminated to the minimum extent necessary, and the remaining provisions
                          will remain in full force and effect.
                        </p>
                      </div>

                      <div>
                        <p className="mb-2 font-semibold text-neutral-400">11. Governing Law</p>
                        <p>
                          These AI Terms are governed by the same laws and jurisdiction provisions as the Qovery Terms
                          of Service.
                        </p>
                      </div>

                      <div>
                        <p className="mb-2 font-semibold text-neutral-400">12. Contact</p>
                        <p>
                          For questions regarding these AI Terms, please contact:{' '}
                          <a href="mailto:support@qovery.com" className="text-brand-500 hover:underline">
                            support@qovery.com
                          </a>
                        </p>
                      </div>

                      <div className="border-t border-neutral-250 pt-4">
                        <p className="font-medium text-neutral-400">
                          By clicking "I Accept" and enabling the AI Copilot, you acknowledge that you:
                        </p>
                        <ul className="ml-4 mt-2 list-disc space-y-1">
                          <li>Have read and understood these AI Copilot Additional Terms</li>
                          <li>Have the authority to bind your organization to these terms</li>
                          <li>Accept these terms on behalf of your organization and all its users</li>
                          <li>Understand the risks associated with AI-assisted operations</li>
                          <li>Agree to use the AI Copilot responsibly and in compliance with these terms</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Controller
                    name="hasAcceptedTerms"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <label className="flex cursor-pointer items-start gap-3">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => field.onChange(checked === true)}
                          className="mt-0.5 flex-shrink-0"
                        />
                        <span className="text-sm text-neutral-400">
                          I have read and accept the AI Copilot Terms of Service
                        </span>
                      </label>
                    )}
                  />

                  <Button type="submit" size="md" color="brand" disabled={!isValid} className="mt-4">
                    <Icon iconName="circle-check" className="mr-2" />
                    Enable AI Copilot
                  </Button>
                </div>
              </div>
            </form>
          )}
        </BlockContent>
      </Section>
    </FormProvider>
  )
}

export default SectionAICopilotOptIn
