# Copy — Qovery Console

## Voice

**Technical but human.** Qovery's users are engineers — they understand infra jargon and don't need it softened. But they're humans operating under pressure, so copy should guide rather than lecture, and inform rather than alarm.

**Not robotic, not cheerful.** Avoid both the cold machine tone ("Error: operation failed") and performative friendliness ("Oops! Something went wrong 😅"). Be direct and useful.

---

## Tone Rules

| Do                                                                          | Don't                                          |
| --------------------------------------------------------------------------- | ---------------------------------------------- |
| State what happened + what to do next                                       | State only an error code with no context       |
| Use active voice ("Deploy failed" not "Deployment was not completed")       | Use passive voice to obscure agency            |
| Match the user's technical register ("cluster", "namespace", "pipeline")    | Translate technical terms into vague metaphors |
| Use sentence case for UI labels                                             | Use ALL CAPS or Title Case For Everything      |
| Be specific about the failing entity ("Service `api-prod` failed to start") | Be generic ("An error occurred")               |
| Write labels as nouns or noun phrases                                       | Write labels as full sentences with periods    |

---

## Addressing the User

We address the user as **"you"** — this is consistent across the product. Don't switch to impersonal constructions ("the user can…", "one may…") or second-person plural ("users should…"). Keep it direct: "You need to deploy your service first."

---

## UI Copy Patterns

| Element             | Rule                                                                                                                                               |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button              | Lead with the verb. 1–2 words ideal, 3 max. If it needs more, the surrounding context isn't doing its job.                                         |
| Destructive button  | Name the object: "Delete service", not "Confirm"                                                                                                   |
| Labels and headings | Sentence case. No trailing periods. Questions get `?`, statements get nothing.                                                                     |
| Hint below a field  | One line max. Clarifies a constraint or format — not a feature description. "Must be lowercase" is a hint. "Services are deployable units" is not. |
| Modal title         | Name the action, not the object. "Delete environment" not "Environment". Never "Settings", "Edit", or "Details" alone.                             |
| Tooltip             | One sentence, no period. For icon-only controls, make it a verb phrase: "Copy to clipboard"                                                        |

---

## Empty States

Three-part pattern: **what's missing** + **why it matters** + **how to fix it**.

Don't use copy like "Nothing here!" — it's unhelpful. Name the missing thing and give the user a clear next step.

---

## Confirmation Dialogs (Destructive Actions)

1. **Heading:** "Delete [entity name]?" — name the thing being deleted
2. **Body:** One sentence on what will happen and whether it's reversible: "This will permanently delete `my-cluster` and all its environments. This action cannot be undone."
3. **Primary button:** The action verb + object: "Delete cluster" (not "Confirm" or "OK")
4. **Cancel button:** "Cancel"

---

## Numbers and Technical Values

- Byte sizes: "1.2 GB", not "1200 MB" (humanize)
- Resource counts: "3 services" (don't abbreviate to "3 svc")
- Percentages: "85%" — no space between number and %
- Code values: always in code formatting — `` `my-namespace` ``, not plain quotes
