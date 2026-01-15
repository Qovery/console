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
                      Qovery AI DevOps Copilot - AI service terms and conditions
                    </h3>
                    <div className="space-y-4 text-xs text-neutral-350">
                      <div>
                        <p className="mb-2 font-semibold text-neutral-400">1. Company information</p>
                        <p>
                          BIRDSIGHT is a French simplified joint stock company, registered under number 852 571 108 with
                          the Registry of Trade and Companies of Paris, whose head office is located at 128 rue de la
                          Boétie, 75008 PARIS (the "Company").
                        </p>
                        <p className="mt-2">
                          The Company may be contacted via the following email address: support@qovery.com
                        </p>
                      </div>

                      <div>
                        <p className="mb-2 font-semibold text-neutral-400">2. Company's AI Service</p>
                        <p className="mb-2">
                          The Company offers to its customers (the "Customer(s)") services enabling them to deploy their
                          applications on their cloud provider (hereinafter referred to as the "Applications") (the
                          "Services") via an API or the tool https://console.qovery.com (hereinafter together referred
                          to as the "Platform").
                        </p>
                        <p>
                          Among the services, the Company offers access to an AI-based assistance feature that performs
                          actions based on the Customers' instructions or helps them with documentation (hereinafter
                          referred to as the "AI Service").
                        </p>
                      </div>

                      <div>
                        <p className="mb-2 font-semibold text-neutral-400">
                          3. Contractual documents and information regarding the AI Service Terms and Conditions
                        </p>
                        <p className="mb-2">
                          <span className="font-medium">Function of the AI Service Terms and Conditions:</span> These
                          terms and conditions (the "AI Service Terms and Conditions") complete the General Terms and
                          Conditions (the "General Terms and Conditions") that govern the terms and conditions of the
                          different services provided by the Company through the Platform.
                        </p>
                        <p className="mb-1">The AI Service Terms and Conditions specifically define:</p>
                        <ul className="ml-4 list-disc space-y-1">
                          <li>the terms of use of the AI Service,</li>
                          <li>the respective obligations of the parties in connection with the AI Service.</li>
                        </ul>
                        <p className="mt-2">
                          In the event of contradiction between the General Terms and Conditions and the AI Service
                          Terms and Conditions, the latter shall prevail.
                        </p>
                        <p className="mt-2">
                          The Customer acknowledges that the AI Service is based on Anthropic's large language models.
                          The Customer undertakes to have read the Anthropic's Terms of Service available here:{' '}
                          <a
                            href="https://www.anthropic.com/legal/commercial-terms"
                            className="text-brand-500 hover:underline"
                          >
                            https://www.anthropic.com/legal/commercial-terms
                          </a>
                          .
                        </p>
                        <p className="mt-2">
                          <span className="font-medium">Location of the AI Service Terms and Conditions:</span> The
                          Customer can find them in the AI Service activation settings on the Platform.
                        </p>
                        <p className="mt-2">
                          <span className="font-medium">Acceptance of the AI Service Terms and Conditions:</span> The
                          Customer accepts the AI Service Terms and Conditions by ticking a box when activating the AI
                          Service on the Platform. If the Customer does not accept all the AI Service Terms and
                          Conditions, they cannot access the AI Service.
                        </p>
                      </div>

                      <div>
                        <p className="mb-2 font-semibold text-neutral-400">4. Access to the AI Service</p>
                        <p className="mb-2">
                          The Customer can access the AI Service by going directly to the Platform, in the settings of
                          their account, and activate the AI Service. The AI Service can only be activated by
                          administrator accounts.
                        </p>
                        <p className="mb-2">
                          Once activated, the AI Service will only be accessible to the Users whose accesses have been
                          created by the Customer in accordance with the conditions set out in the Company's General
                          Terms and Conditions (the "Users").
                        </p>
                        <p>
                          The Customer is solely responsible for creating accesses for Users, for setting their access
                          rights to the AI Service and for their personal use of the Platform.
                        </p>
                      </div>

                      <div>
                        <p className="mb-2 font-semibold text-neutral-400">5. Duration of the AI Service</p>
                        <p>
                          The AI service may only be provided to the Customer during the active subscription period in
                          effect according to the General Terms and Conditions.
                        </p>
                      </div>

                      <div>
                        <p className="mb-2 font-semibold text-neutral-400">6. Financial terms</p>
                        <p className="mb-2">
                          The price of the AI Service is indicated on the Platform or in the specific quotation accepted
                          by the Customer, if any.
                        </p>
                        <p className="mb-2">
                          Unless otherwise specified in the quotation, if any, the applicable payment terms are those
                          set out in the Company's Terms and Conditions.
                        </p>
                        <p className="mb-1">
                          The Customer is hereby informed and expressly agrees that any payment delay of all or part of
                          any payable amount due to the Company at its due term shall automatically entail, and from the
                          day following the payment date indicated on the invoice:
                        </p>
                        <ul className="ml-4 list-disc space-y-1">
                          <li>
                            The forfeiture of the term of all amounts payable by the Customer and their immediate
                            payability, regardless of the terms of payment that had been provided;
                          </li>
                          <li>The immediate suspension of the AI Service until full payment of all amounts due;</li>
                          <li>
                            If the Customer is a professional, invoicing of a late payment interest, for the Company's
                            benefit, at the rate of 3 times the legal interest rate, calculated on the total of all
                            amounts due by the Customer, and a flat indemnity of 40 euros as recovery fees, without
                            prejudice of any further compensation in the event effective recovery fees should be higher
                            than this amount.
                          </li>
                        </ul>
                      </div>

                      <div>
                        <p className="mb-2 font-semibold text-neutral-400">7. Intellectual property rights</p>
                        <p className="mb-2">
                          <span className="font-medium">7.1 Intellectual property rights of the Company:</span> The
                          systems, software, structures, infrastructures, databases and content (text, images, graphics,
                          music, logos, trademarks, databases, etc.) used by the Company on the Platform, are protected
                          by all intellectual property rights, or rights for the creators of databases, in force. Any
                          dismantling, decompilation, deciphering, extracting, reusing, copying and, more generally, any
                          reproduction, representation, publishing or use of all or part of any of these items, without
                          the Company's authorization, is strictly prohibited and could lead to prosecution.
                        </p>
                        <p className="mb-2">
                          The license granted to the Customer and the Users for the duration specified in the article
                          "Duration of the AI Service", which is non-exclusive, personal and non-transferable, does not
                          entail any transfer of ownership.
                        </p>
                        <p className="mb-2">
                          <span className="font-medium">7.2 Intellectual Property of the Customers:</span> The purpose
                          of the AI Service is to assist the Customers in deploying their Applications.
                        </p>
                        <p className="mb-2">
                          In order to use the AI Service, the Customer must provide instructions to the AI tool by
                          uploading content to the Platform ("Content").
                        </p>
                        <p>
                          Customers acknowledge and accept that through placing Content on the Platform, they
                          voluntarily provide access to their code and data related to their Applications. This access
                          does not confer to the Company any intellectual property rights relating to the Customer's
                          code, Content and Applications, which remain entirely and exclusively the property of the
                          Customer.
                        </p>
                      </div>

                      <div>
                        <p className="mb-2 font-semibold text-neutral-400">8. Company's obligations</p>
                        <p className="mb-1">
                          The Company undertakes to ensure that the results of its use of the AI Service comply with the
                          Company's obligations under the General Terms and Conditions, and in particular:
                        </p>
                        <ul className="ml-4 list-disc space-y-1">
                          <li>Not infringe in any way on the rights of third parties;</li>
                          <li>Not contain any vulnerabilities or security flaws.</li>
                        </ul>
                        <p className="mt-2">
                          The Company undertakes, to the extent possible, to assist the Customer in fulfilling its
                          obligations in accordance with applicable regulations, in particular Regulation (EU) 2024/
                          1689 of the European Parliament and of the Council of June 13, 2024, laying down harmonized
                          rules concerning artificial intelligence (the "AI Regulation"). In this regard, the Company
                          undertakes to cooperate in good faith with the Customer for any request related to compliance
                          with the AI Regulation.
                        </p>
                        <p className="mt-2">
                          In the event of the discovery of an incident, risk, or non-compliance related to data or
                          development practices, the Company will immediately inform the Customer by any appropriate
                          written means and propose appropriate corrective measures.
                        </p>
                      </div>

                      <div>
                        <p className="mb-2 font-semibold text-neutral-400">9. Customer's obligations</p>
                        <p className="mb-2">
                          <span className="font-medium">8.1 Concerning the provision of information:</span> The Customer
                          undertakes to provide the Company with all the information required to activate and use the AI
                          Service.
                        </p>
                        <p className="mb-2">
                          <span className="font-medium">8.2 Concerning the Customer's account:</span> The Customer is
                          solely responsible for creating access for Users and for setting their access rights to the AI
                          Service.
                        </p>
                        <p className="mb-2">
                          The Customer must immediately contact the Company using the contact details provided in
                          article "Company information" if they find that their account has been used to use the AI
                          Service without their knowledge. The Customer acknowledges that the Company shall have the
                          right to take all appropriate measures in such a case.
                        </p>
                        <p className="mb-2">
                          <span className="font-medium">8.3 Concerning the use of the AI Service:</span> The Customer is
                          responsible for the use of the AI Service by the Users and any information they share in this
                          context. They are also responsible for the use of the AI Service and any information shared by
                          Users including as Content. The Customer undertakes to ensure that the AI Service is used
                          exclusively by them and/or Users, who are subject to the same obligations as the Customer in
                          their use of the AI Service.
                        </p>
                        <p className="mb-2">
                          The Company shall not be held liable for the use of the AI Service by the Customer and/or
                          Users, nor for any harmful consequences of such use for the Customer or third parties.
                          Furthermore, the Company cannot be held liable for any use or any decision made by the
                          Customer on the basis of their use of the AI Service, it is reminded that the AI Service is
                          only an assistance tool.
                        </p>
                        <p className="mb-2">
                          It is the responsibility of the Customer and Users to exercise discretion in interpreting and
                          using this information generated by the AI Service.
                        </p>
                        <p className="mb-2">
                          The Customer acknowledges that AI systems may be subject to bias and that this may potentially
                          affect the results, recommendations, or decisions generated by the AI Service.
                        </p>
                        <p className="mb-2">
                          The Company does not wish the AI Service to be used for high-risk purposes and does not wish
                          to be a provider of high-risk AI. Consequently:
                        </p>
                        <ul className="ml-4 list-disc space-y-1">
                          <li>
                            the Customer shall refrain from modifying the AI Service and/or using it for high-risk
                            purposes,
                          </li>
                          <li>
                            the Customer shall refrain from using the AI Service for any purpose indicated as high-risk
                            by the regulations on AI.
                          </li>
                        </ul>
                        <p className="mt-2">
                          The Customer undertakes to comply with the conditions of use set forth in the Anthropic's
                          Terms of Service (
                          <a
                            href="https://www.anthropic.com/legal/commercial-terms"
                            className="text-brand-500 hover:underline"
                          >
                            https://www.anthropic.com/legal/commercial-terms
                          </a>
                          ).
                        </p>
                        <p className="mb-1 mt-2">
                          The Customer undertakes not to use the AI Service for purposes other than those for which it
                          was designed, and in particular to:
                        </p>
                        <ul className="ml-4 list-disc space-y-1">
                          <li>engage in any illegal or fraudulent activity,</li>
                          <li>undermine public order and morality,</li>
                          <li>infringe the rights of third parties in any way whatsoever,</li>
                          <li>violate any contractual, legislative or regulatory provision,</li>
                          <li>
                            engage in any activity likely to interfere with a third party's computer system, in
                            particular for the purpose of violating its integrity or security,
                          </li>
                          <li>promote their services and/or websites or those of a third party,</li>
                          <li>
                            assist or incite a third party to commit one or more of the acts or activities listed above.
                          </li>
                        </ul>
                        <p className="mb-1 mt-2">The Customer also refrains from:</p>
                        <ul className="ml-4 list-disc space-y-1">
                          <li>
                            copying, modifying or misappropriating any element belonging to the Company or any concepts
                            it exploits within the framework of the AI Service,
                          </li>
                          <li>
                            engaging in any behavior likely to interfere with or hijack the Company's computer systems
                            or undermine its computer security measures,
                          </li>
                          <li>infringing Company's financial, commercial or moral rights and interests,</li>
                          <li>
                            marketing, transferring or otherwise giving access in any way whatsoever to the AI Service,
                            to information hosted on the Platform or to any element belonging to the Company.
                          </li>
                        </ul>
                        <p className="mt-2">
                          The quality of the AI Service depends directly on the clarity of the Content uploaded by the
                          Customer.
                        </p>
                        <p className="mt-2">
                          The Customer is solely responsible for Content of any kind that they upload using the AI
                          Service, including the accuracy and completeness of the Content, and the Company cannot be
                          held liable in any way for any errors, typos, omissions or information that may mislead the AI
                          Service.
                        </p>
                        <p className="mb-1 mt-2">
                          The Customer agrees not to upload any Content (this list is not exhaustive):
                        </p>
                        <ul className="ml-4 list-disc space-y-1">
                          <li>
                            infringing public order and morality (pornographic, obscene, indecent, shocking or
                            unsuitable for a family audience, defamatory, abusive, violent, racist, xenophobic or
                            revisionist),
                          </li>
                          <li>
                            infringing the rights of third parties (counterfeit content, infringement of personality
                            rights, etc.) and more generally violating a contractual, legislative or regulatory
                            provision,
                          </li>
                          <li>prejudicial to third parties in any way whatsoever,</li>
                          <li>harmful to the computer systems of third parties.</li>
                        </ul>
                        <p className="mt-2">
                          The Customer shall indemnify the Company against any claim and/or action that may be brought
                          against it as a result of the breach of any of the Customer's obligations. The Customer shall
                          indemnify the Company for any loss suffered and reimburse the Company for any sums it may have
                          to bear as a result.
                        </p>
                      </div>

                      <div>
                        <p className="mb-2 font-semibold text-neutral-400">9 End of AI Service</p>
                        <p className="mb-2">
                          The Customer may terminate the AI Service by going directly to the Platform, in the settings
                          of their account, and deactivate the AI Service. The AI Service can only be deactivated by
                          administrator accounts. The Customer and/or the users no longer have access to the AI Service
                          once deactivated.
                        </p>
                        <p>
                          The AI Service will be automatically terminated with the end of the Company's services in
                          accordance with the General Terms and Conditions.
                        </p>
                      </div>

                      <div>
                        <p className="mb-2 font-semibold text-neutral-400">10 Sanctions in the event of breach</p>
                        <p className="mb-1">
                          In the event of a breach of any of the Customer's obligations under the AI Service Terms and
                          Conditions, the Company may:
                        </p>
                        <ul className="ml-4 list-disc space-y-1">
                          <li>suspend or terminate the Customer's access to the AI Service,</li>
                          <li>publish on the Platform any information message the Company deems useful,</li>
                          <li>
                            notify any competent authority, cooperate with it and provide it with any information that
                            may be useful in investigating and punishing illegal or illicit activities,
                          </li>
                          <li>take any legal action.</li>
                        </ul>
                        <p className="mt-2">
                          These sanctions are without prejudice to any damages that the Company may claim from the
                          Customer.
                        </p>
                        <p className="mt-2">
                          The Company will request the Customer by any useful written means to remedy the breach within
                          a maximum period of 15 calendar days. AI Service will be terminated at the end of this period
                          if the breach is not remedied, without any right for the Customer to be reimbursed for any
                          prepaid fees.
                        </p>
                      </div>

                      <div>
                        <p className="mb-2 font-semibold text-neutral-400">
                          11 Modification of AI Service Terms and Conditions
                        </p>
                        <p className="mb-2">
                          The Company may modify the AI Service Terms and Conditions at any time and will inform the
                          Customer by any pertinent channel.
                        </p>
                        <p className="mb-2">
                          Modified AI Service Terms and Conditions apply when the Customer's subscription is renewed.
                        </p>
                        <p className="mb-2">
                          Any Customer who does not agree with the amended AI Service Terms and Conditions must
                          unsubscribe from the AI Service according to the provisions set out in Article "End of AI
                          Service".
                        </p>
                        <p>
                          If the Customer uses the AI Service after the entry into force of the modified AI Service
                          Terms and Conditions, the Company considers that the Customer has accepted them.
                        </p>
                      </div>

                      <div>
                        <p className="mb-2 font-semibold text-neutral-400">12 Consumer Mediation</p>
                        <p className="mb-2">
                          In the event of any dispute with the Company, in relation to these AI Service Terms and
                          Conditions, individual Customers have the right to seek recourse, free of charge, to a
                          consumer mediator, for purposes of finding an amicable settlement, pursuant to articles L611-1
                          et seq. and articles R152-1 et seq. of the French Consumer Code.
                        </p>
                        <p className="mb-1">
                          To this end, individual Customers may contact the following consumer mediator:
                        </p>
                        <p className="mt-2">
                          Centre de médiation de la consommation de conciliateurs de justice (CM2C)
                          <br />
                          Postal address: 14 rue Saint Jean 75017 Paris
                          <br />
                          Phone : 06 09 20 48 86
                          <br />
                          <a href="https://www.cm2c.net" className="text-brand-500 hover:underline">
                            https://www.cm2c.net
                          </a>
                        </p>
                      </div>

                      <div>
                        <p className="mb-2 font-semibold text-neutral-400">13 Applicable law</p>
                        <p>The AI Service Terms and Conditions are governed by French law.</p>
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
