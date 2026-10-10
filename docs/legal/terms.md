---
title: Terms of Service
description: The contract for using Formhaus Cloud, the hosted form backend operated by Fabrique-Futur LLC.
sidebar: false
---

# Formhaus Cloud Terms of Service

::: warning Draft, pending legal review
This document is a draft and is not in effect. Items marked [VERIFY] must be confirmed before launch.
:::

**Effective date: [EFFECTIVE DATE]**

These Terms of Service ("**Terms**") are a binding agreement between **Fabrique-Futur LLC**, a Wyoming limited liability company ("**Fabrique-Futur**," "**we**," "**us**," "**our**"), and the person or organization that uses **Formhaus Cloud** (the "**Service**"). You accept these Terms when you create an account, claim a form, create an API key, publish a form through the Service, or let an AI agent publish a form for you. If you accept on behalf of a company or other entity, you represent that you have authority to bind it, and "**you**" and "**Customer**" mean that entity.

If you do not agree to these Terms, do not use the Service.

---

## 1. Definitions

- **Service**: the hosted Formhaus Cloud service, including the submission endpoint and REST API at api.formhaus.dev, the remote MCP server at api.formhaus.dev/mcp, the dashboard at app.formhaus.dev, hosted form pages and the embed script at f.formhaus.dev, and related email notifications and webhooks.
- **Open-Source Project**: the Formhaus form definition format, `@formhaus/core`, `@formhaus/react`, `@formhaus/vue`, `@formhaus/mcp`, the Figma plugin, the JSON Schema and the documentation at formhaus.dev, published under the MIT License.
- **Form**: a form definition published to the Service, with its versions and settings.
- **Respondent**: a person who fills in or submits a Form.
- **Submission Data**: the values a Respondent submits to a Form, and the metadata the Service records with them (submission time, user agent, referrer and skipped steps).
- **Customer Data**: your Forms and their Submission Data.
- **Account Data**: the data about you that we need to run your account, such as your email address, sessions, plan, billing records and API key metadata.
- **API Key**: a secret key (prefix `fh_live_`) that authenticates requests to the REST API and the MCP server for your account, including a key that you give to an AI agent.
- **Agent**: software, including an AI model or coding assistant, that calls the Service on behalf of a person.
- **Unclaimed Form**: a Form published without an API Key, which no account owns yet.
- **Owner**: the account that has claimed or created a Form.
- **Sub-processor**: a third party we engage to process Customer Data, as listed on the [Sub-processors](./sub-processors.md) page.

---

## 2. The Service and the Open-Source Project

These Terms apply only to the Service. The Open-Source Project is licensed under the MIT License. Its license, not these Terms, governs your use of it, and you can use it without the Service.

We grant you a non-exclusive, non-transferable, revocable right to use the Service while these Terms are in effect, subject to these Terms and the limits of your plan.

We may add, change or remove features. We will not materially reduce the core functions of a paid plan during a paid period without notice.

---

## 3. Eligibility and accounts

- You must be at least 18 years old to use the Service. The Service is intended for use in a business, trade or profession, including running your own projects as a developer or creator. [VERIFY: founder decision on whether personal, non-business use is in scope.] Nothing in these Terms limits non-waivable consumer rights that mandatory law gives you.
- You sign in with a one-time link sent to your email address. You must use an email address that you control and keep it current. Anyone with access to that mailbox can access your account.
- You are responsible for all activity under your account, including activity through your API Keys and through Agents that you let act for you.
- Tell us at legal@formhaus.dev without delay if you suspect unauthorized use of your account or an API Key.

---

## 4. AI agents, API keys and unclaimed forms

**Agents act for you.** The Service is designed to be used by Agents. When an Agent publishes a Form, reads submissions or changes a Form for you, you are responsible for what it does as if you had done it yourself. We do not verify that an Agent has authority to act for anyone.

**API Keys.**

- An API Key gives full access to the Forms and Submission Data of its account through the REST API and the MCP server. We show a key once and store only a keyed hash of it.
- Keep API Keys secret. Do not put an API Key in a web page, a client-side bundle or a public repository. Only the public form id belongs in a page.
- If you give an API Key to an Agent, the Agent can read your Submission Data. Data that an Agent reads leaves the Service and is processed by that Agent and its model provider under your own agreements with them. We are not responsible for that processing.
- Revoke an API Key in the dashboard as soon as you no longer need it or think it is exposed.

**Unclaimed Forms.**

- An Agent can publish a Form without an account. The person who instructs the Agent, or on whose behalf it publishes, accepts these Terms for that Form.
- An Unclaimed Form accepts at most 100 submissions and expires 7 days after it is published. On expiry, we delete the Form and its Submission Data.
- An Unclaimed Form shows a banner that tells Respondents the form is unverified and that they must not enter passwords or payment details. It is not indexed by search engines and has a "Report" link.
- Unclaimed Forms do not send email notifications or webhooks.
- To keep a Form, open the claim link and sign in. The account that claims a Form becomes its Owner, accepts these Terms for it, and takes responsibility for all Submission Data the Form collected before the claim.
- If an Agent gives an email address when it publishes, we send a claim email to that address. The email does not contain form content. If you did not ask for it, you can ignore it.

---

## 5. Your forms and your respondents

When you collect personal data with a Form, you decide what to collect and why. For that data you are the controller (or "business"), and we process it for you as your processor (or "service provider") under the [Data Processing Addendum](./dpa.md).

You are responsible for:

- having a lawful basis for collecting and using Submission Data, and getting any consent the law requires;
- telling Respondents who you are and how you use their data, in the Form itself or in a privacy notice the Form links to. Hosted pages do not show the Owner's identity unless you put it in the Form. [VERIFY: founder decision on whether hosted pages should show the Owner's name or privacy link.]
- answering Respondents' requests to access, correct or delete their data. You can export and delete submissions yourself in the dashboard and through the API;
- the systems that receive Submission Data from you, including webhook endpoints, notification mailboxes and Agents. Our responsibility for a copy ends when we deliver it to an endpoint or address that you configured;
- the content, legality and accuracy of your Forms.

---

## 6. Customer Data

- **You own your Customer Data.** We do not claim ownership of it.
- You grant us a worldwide, non-exclusive license to host, copy, validate, transmit and display Customer Data **only** to provide, secure, support and debug the Service for you (the "**Permitted Purposes**"). The license ends when the Customer Data is deleted from the Service, including from backups as described in Section 14.
- **We do not sell Customer Data. We do not use Customer Data to train AI or machine-learning models, ours or anyone else's. We do not use Customer Data for advertising.**
- We may compute aggregate statistics about use of the Service, such as numbers of forms, submissions and errors, to operate and plan the Service. These statistics do not contain Submission Data and do not identify you or any Respondent.
- The Service is not a backup or archive. Export the data you need to keep, especially on the Free plan, where submissions are deleted after 90 days.

---

## 7. Acceptable use

You must not use the Service, and must not let an Agent or another person use it, to:

- collect passwords, one-time codes, recovery phrases or other credentials for any service;
- collect payment card numbers or card security codes. The Service is not certified under PCI DSS;
- impersonate a person, brand or organization, or run phishing or other deceptive forms;
- collect special categories of personal data (such as health, biometric or genetic data, or data about sexual orientation, religion or political opinions), government identification numbers, or data about children, unless you have a lawful basis, give Respondents the notices the law requires, and have decided that the Service's security measures are adequate for that data;
- collect personal data without the notices or consent the law requires;
- send spam or unsolicited messages, or use Forms or notifications to harass anyone;
- host or distribute malware, or content that is illegal or infringes the rights of others;
- attack, probe or overload the Service, bypass rate limits, plan limits or abuse controls, or access another customer's data;
- use webhooks to make requests to systems you are not authorized to reach;
- create many accounts or Unclaimed Forms to avoid plan limits or abuse controls;
- resell the Service as a standalone form backend without our written permission.

Hosted pages and the embed do not render password fields or file upload fields. This does not make it lawful to collect the data listed above in other ways.

---

## 8. Abuse reports, pausing and removal

- Anyone can report a Form through the "Report" link on an Unclaimed Form or by email to legal@formhaus.dev with the form link.
- An Unclaimed Form is paused automatically after reports from 3 different reporters. A claimed Form is not paused automatically; we email its Owner.
- We may pause, disable or delete a Form, revoke API Keys, or suspend an account without liability if we reasonably believe it breaks Section 7, puts Respondents or the Service at risk, or is required by law. Where it is practical and lawful, we will tell the Owner and give a chance to fix the issue first. A paused Form rejects new submissions.
- If you think we paused or removed a Form by mistake, write to legal@formhaus.dev.

---

## 9. Plans, limits and fees

- **Plans.** The Service has a Free plan, a Pro plan and any other plans listed on the pricing page at formhaus.dev [VERIFY: pricing page URL]. Prices are on the pricing page. At the effective date, the limits are [VERIFY: matches the pricing page at launch]:

  | Plan | Forms | Submissions per month | Webhooks | Submission retention |
  |---|---|---|---|---|
  | Unclaimed Form | 1 per publish | 100 in total | No | 7 days |
  | Free | 3 | 100 | Yes | 90 days |
  | Pro | Unlimited | 25,000 | Yes | Until you delete them |

- **Counting.** Submissions are counted per account per calendar month (UTC). Submissions to an Unclaimed Form are counted per Form.
- **Over the limit.** When an account reaches its monthly submission limit, the endpoint rejects new submissions until the next month or until you upgrade. We do not store rejected submissions.
- **Payment.** Pro is paid through our payment processor, Stripe. Stripe collects your payment details; we do not store card numbers. [VERIFY: whether Pro is a recurring subscription, how it renews and how it is cancelled.]
- **Downgrade.** If you move from Pro to Free, Free limits apply from the change, and submissions older than 90 days are deleted 30 days after the change. [VERIFY: founder decision on the grace period.]
- **Changes to prices or limits.** We may change prices or plan limits for future billing periods with at least 30 days' notice by email.
- **Taxes.** Prices do not include taxes. You pay all applicable taxes other than taxes on our net income.
- **Refunds.** Fees are non-refundable and there are no credits for partial periods, except where the law requires a refund or we state otherwise in writing.
- **Non-payment.** If a payment fails, we may move the account to the Free plan after notice.

---

## 10. Availability and changes

The Service has no uptime commitment unless a separate written agreement states one. We may label features as beta. Beta features are provided "as is", may change or be withdrawn at any time, and have no service commitment.

We may update the Service, including its limits and abuse controls, to keep it secure and working. We will give notice of changes that materially reduce what a paid plan includes.

---

## 11. Confidentiality

Each party may receive non-public information of the other ("**Confidential Information**"). The receiving party will use it only to perform under these Terms and protect it with reasonable care. This does not apply to information that is public through no fault of the receiver, that the receiver developed independently, or that it received lawfully from a third party. Customer Data is your Confidential Information. A party may disclose Confidential Information when the law requires it, with notice where the law permits.

---

## 12. Intellectual property and feedback

- We and our licensors own the Service, except for the parts licensed to you under the MIT License as the Open-Source Project. These Terms give you a right to use the Service, not ownership of it.
- "Formhaus," "Fabrique-Futur" and their logos are our trademarks. Hosted pages show a "Made with Formhaus" badge. Do not remove or hide it unless your plan allows it.
- If you give us feedback, we may use it without restriction and without payment to you.

---

## 13. Security

We protect the Service and Customer Data with the measures described in Annex II of the [Data Processing Addendum](./dpa.md). You are responsible for the security of your email account, your API Keys, your webhook endpoints and the sites where you embed Forms.

---

## 14. Term, termination and deletion

- These Terms apply while you have an account, own a Form, or use the Service.
- You can delete Forms, submissions and your account at any time. [VERIFY: account deletion is self-service in the dashboard, or by request to legal@formhaus.dev until it is.]
- We may suspend or terminate your access for a material breach of these Terms (including Section 7), for non-payment, or when the law requires it. We may close a Free account with 30 days' notice.
- **Deletion.** When you delete a Form, submissions or your account, we remove the data from the live database at once. Encrypted backups that contain it expire within 30 days. If your account is terminated for another reason, we delete Customer Data within 30 days of termination, and its backup copies expire within a further 30 days, unless the law requires us to keep it.
- **Export.** You can export submissions as CSV or JSON at any time before deletion. Deleted data cannot be restored or exported.
- **Survival.** Sections 6, 11, 12, 15, 16, 17, 18 and 20, accrued payment obligations, and the [Data Processing Addendum](./dpa.md) until Customer Data is deleted, survive termination.

---

## 15. Warranties and disclaimers

THE SERVICE IS PROVIDED **"AS IS" AND "AS AVAILABLE."** TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, NON-INFRINGEMENT, AND ANY WARRANTY THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE OR SECURE, OR THAT EVERY SUBMISSION, EMAIL NOTIFICATION OR WEBHOOK WILL BE DELIVERED. SOME JURISDICTIONS DO NOT ALLOW CERTAIN DISCLAIMERS, SO SOME OF THE ABOVE MAY NOT APPLY TO YOU.

This Section does not limit our express commitments in the [Data Processing Addendum](./dpa.md).

---

## 16. Limitation of liability

TO THE MAXIMUM EXTENT PERMITTED BY LAW:

- NEITHER PARTY IS LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR EXEMPLARY DAMAGES, OR FOR LOST PROFITS, REVENUE, DATA OR GOODWILL, EVEN IF ADVISED OF THE POSSIBILITY.
- **General cap.** EXCEPT AS STATED BELOW, OUR TOTAL LIABILITY ARISING OUT OF OR RELATED TO THE SERVICE OR THESE TERMS WILL NOT EXCEED THE GREATER OF (A) THE AMOUNTS YOU PAID US FOR THE SERVICE IN THE 12 MONTHS BEFORE THE EVENT GIVING RISE TO THE CLAIM, OR (B) USD 1,000.
- **Data and security cap.** FOR CLAIMS ARISING FROM OUR BREACH OF OUR CONFIDENTIALITY, DATA-PROTECTION OR SECURITY OBLIGATIONS (INCLUDING THE DATA PROCESSING ADDENDUM), OUR TOTAL LIABILITY WILL NOT EXCEED THE GREATER OF (A) TWO TIMES THE AMOUNTS YOU PAID US FOR THE SERVICE IN THE 12 MONTHS BEFORE THE EVENT, OR (B) USD 5,000.

**Exclusions.** The caps do not apply to a party's indemnification obligations, your payment obligations, a party's infringement or misuse of the other's intellectual property, or a party's fraud, gross negligence or willful misconduct. Nothing in these Terms excludes or limits liability that cannot be excluded or limited under applicable law.

**No individual liability.** To the extent permitted by law, no member, manager, officer, employee, agent or affiliate of Fabrique-Futur LLC has personal liability under these Terms or in connection with the Service. Your remedies are against Fabrique-Futur LLC only.

---

## 17. Indemnification

**By you.** You will defend and indemnify us against third-party claims, and pay resulting damages and reasonable costs finally awarded, arising from: (a) your Forms or Customer Data, including claims by Respondents; (b) use of the Service by you, your Agents or anyone using your API Keys in breach of these Terms or the law; or (c) your processing of Submission Data outside the Service.

**By us.** We will defend and indemnify you against third-party claims that the Service, as we provide it and used in line with these Terms, infringes that third party's intellectual property rights, and pay resulting damages and reasonable costs finally awarded. If the Service is, or we believe it may become, subject to such a claim, we may: (a) get the right for you to keep using it; (b) change it so it does not infringe while keeping it materially equivalent; or (c) if neither is commercially reasonable, end the affected Service and refund prepaid, unused fees. This obligation does not cover claims arising from Customer Data, the Open-Source Project as licensed under the MIT License, combinations with products we did not provide, use in breach of these Terms, or changes we did not make. This is our entire liability for intellectual-property infringement.

**Process.** The party seeking indemnification will notify the other promptly, give the indemnifying party control of the defense (with the right to take part with its own counsel), and cooperate reasonably. No settlement that imposes an obligation on a party that is not indemnified may be made without that party's consent.

---

## 18. Governing law and disputes

These Terms are governed by the laws of the **State of Wyoming, USA**, without regard to conflict-of-laws rules, and excluding the U.N. Convention on Contracts for the International Sale of Goods.

The state and federal courts located in Wyoming have exclusive jurisdiction over disputes arising out of these Terms, and each party consents to that jurisdiction and venue. Either party may seek injunctive relief in any competent court to protect its intellectual property or Confidential Information.

Disputes will be brought individually, not as part of a class or representative action, to the extent the law permits. This Section does not limit non-waivable rights you have under the mandatory law of your country of residence.

---

## 19. Changes to these Terms

We may update these Terms. If a change is material, we will give notice by email or in the dashboard at least 30 days before it takes effect. Changes apply from their effective date. If you keep using the Service after that date, you accept the updated Terms. If you do not agree, stop using the Service and delete your account.

---

## 20. General

- **Assignment.** You may not assign these Terms without our consent, except to a successor in a merger or sale of substantially all assets. We may assign these Terms to an affiliate or in connection with a reorganization, merger or sale.
- **Entire agreement.** These Terms, the [Privacy Policy](./privacy.md), the [Data Processing Addendum](./dpa.md) and your plan are the entire agreement about the Service and replace earlier agreements on it. A separate written agreement that you sign with us controls where it conflicts with these Terms.
- **Order of precedence.** If documents conflict: a signed written agreement, then the Data Processing Addendum (for data protection), then these Terms, then other documentation.
- **Severability and waiver.** If a provision is unenforceable, the rest stay in effect. Not enforcing a provision is not a waiver.
- **Force majeure.** Neither party is liable for delays or failures caused by events beyond its reasonable control.
- **Independent parties.** These Terms create no partnership, agency or employment relationship.
- **Notices.** We give notice by email to the account address or in the dashboard. Send legal notices to legal@formhaus.dev.
- **Export and sanctions.** You will comply with applicable export-control and sanctions laws and represent that you are not subject to such restrictions.

---

## 21. Contact

**Fabrique-Futur LLC**
30 N Gould St, Ste R, Sheridan, WY 82801, United States
Legal, privacy, security and abuse reports: legal@formhaus.dev
General questions: hello@formhaus.dev
