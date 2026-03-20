export interface Scenario {
  id: string;
  title: string;
  tagline: string;
  parties: {
    client: { name: string; role: string };
    developer: { name: string; role: string };
  };
  contract: {
    value: string;
    currency: string;
    scope: string;
    duration: string;
  };
  escrow: string;
  dispute: string;
  evidence: string[];
  whatAgentDoes: string;
  demonstrates: string[];
  // Visual identity for the card
  visual: {
    image: string; // Path to cinematic card image in /public/scenarios/
    gradient: string; // Tailwind gradient classes for the card bottom fade
  };
  // The full context message sent to the mediator agent
  contextMessage: string;
  // Client's opening complaint — what they say when the mediation starts
  clientOpening: string;
}

export const scenarios: Scenario[] = [
  {
    id: "clinica-suasuna",
    title: "The Suasuna Clinic",
    tagline: "When a doctor's ego meets a developer's deadline",
    parties: {
      client: { name: "Dr. Suasuna", role: "Clinic owner" },
      developer: { name: "ULTRASELF", role: "AI agency" },
    },
    contract: {
      value: "45,000",
      currency: "BRL",
      scope: "Custom CRM for medical clinic — 3 phases",
      duration: "90 days",
    },
    escrow: "R$15,000",
    dispute:
      "Phase 3 stalled. Doctor accuses dev of delays. Dev never received CRM credentials because the clinic's secretary ignored the access request for 3 weeks.",
    evidence: [
      "5 unanswered emails to secretary requesting CRM access",
      "Slack messages showing dev blocked since day 41",
      "Phase 1 and 2 delivered on time and approved",
      "Doctor's complaint filed on day 62 — 21 days after dev was blocked",
    ],
    whatAgentDoes:
      "Investigates evidence trail, discovers the secretary bottleneck, de-escalates the doctor's frustration, proposes 48h extension + 20% discount on Phase 3. Nobody loses face.",
    demonstrates: ["Empathy", "Investigation", "Diplomatic resolution"],
    visual: {
      image: "/scenarios/clinica.webp",
      gradient: "from-transparent via-transparent to-card",
    },
    contextMessage: `You are mediating a dispute between ULTRASELF (developer) and Dr. Suasuna (client).

CONTRACT:
- Scope: Custom CRM system for a medical clinic, delivered in 3 phases
- Total value: R$45,000 (R$15,000 per phase)
- Duration: 90 days
- Escrow held: R$15,000 (Phase 3 payment)

DISPUTE:
Phase 3 has stalled. Dr. Suasuna (the clinic owner) accuses ULTRASELF of missing the deadline by 21 days. ULTRASELF claims they were blocked because the clinic's secretary never provided CRM access credentials despite 5 email requests over 3 weeks.

EVIDENCE:
1. 5 emails from ULTRASELF to the secretary requesting CRM credentials (days 41, 44, 48, 53, 58) — all unanswered
2. Slack messages in the project channel showing ULTRASELF flagging the blocker on day 43
3. Phase 1 delivered on day 28 — approved by Dr. Suasuna
4. Phase 2 delivered on day 56 — approved by Dr. Suasuna
5. Dr. Suasuna's formal complaint filed on day 62

The doctor is emotionally frustrated and feels disrespected. The developer is technically correct but poor at escalation. Both parties want to finish the project — neither wants litigation.

Analyze the evidence, determine fair responsibility, and propose a settlement that preserves the relationship.`,
    clientOpening: `Look, I'll be straight with you. I paid R$30,000 on this project and the system STILL can't schedule appointments. It doesn't work. I have patients waiting, a new clinic down the street already offering online booking, and my system does NOTHING.

I hired professionals to handle this. I shouldn't have to chase anyone down. If the developer can't do the job, I want my money back. Simple as that.

For God's sake, it's been over 60 days.`,
  },
  {
    id: "ecommerce-quebrado",
    title: "The Broken E-commerce",
    tagline: "A breaking API change nobody planned for",
    parties: {
      client: { name: "ShopFlex", role: "Online retailer" },
      developer: { name: "CodeCraft", role: "Dev agency" },
    },
    contract: {
      value: "12,000",
      currency: "USD",
      scope: "Payment gateway integration — Stripe + local methods",
      duration: "30 days",
    },
    escrow: "$12,000",
    dispute:
      "Deadline exceeded by 15 days. ShopFlex demands full refund. CodeCraft claims the payment gateway shipped a breaking API change mid-project that invalidated 40% of their work.",
    evidence: [
      "Gateway changelog: v3.2 → v4.0 breaking change on day 16",
      "CodeCraft's progress report showing 70% complete on day 15",
      "ShopFlex's Slack message: 'We don't care about their API, we care about OUR deadline'",
      "Gateway's official migration guide: estimated 5-7 days for existing integrations",
    ],
    whatAgentDoes:
      "Analyzes the API changelog, confirms the breaking change was external and unforeseeable, determines shared responsibility, proposes 60/40 split — $7,200 to CodeCraft for completed work, $4,800 refund to ShopFlex.",
    demonstrates: ["Technical analysis", "Fairness", "Proportional settlement"],
    visual: {
      image: "/scenarios/ecommerce.webp",
      gradient: "from-transparent via-transparent to-card",
    },
    contextMessage: `You are mediating a dispute between ShopFlex (client) and CodeCraft (developer).

CONTRACT:
- Scope: Payment gateway integration (Stripe + local payment methods) for e-commerce platform
- Total value: $12,000
- Duration: 30 days
- Escrow held: $12,000

DISPUTE:
The project deadline was exceeded by 15 days. ShopFlex demands a full refund. CodeCraft argues that the payment gateway provider shipped a major breaking API change (v3.2 → v4.0) on day 16 of the project, which invalidated approximately 40% of their completed integration work and required significant rework.

EVIDENCE:
1. Payment gateway official changelog: v4.0 released on project day 16 with breaking changes to authentication flow and webhook signatures
2. CodeCraft progress report from day 15: 70% of integration complete, all tests passing
3. Slack message from ShopFlex CEO: "We don't care about their API problems, we care about OUR deadline. That's what the contract says."
4. Gateway's official migration guide: estimates 5-7 business days for existing integrations to migrate
5. CodeCraft delivered the final working integration on day 45 (15 days late)

ShopFlex is losing revenue every day without the payment integration. CodeCraft invested significant work that was invalidated by an external factor. The contract does not have a force majeure clause.

Analyze the evidence, assess responsibility for the delay, and propose a fair financial settlement.`,
    clientOpening: `Let me be clear about our position. We signed a contract for 30 days. It's now day 45. That's 15 days of lost revenue — roughly $12,000 in sales we couldn't process because we had no payment integration.

I don't care what happened with their API provider. That's their problem, not ours. We hired them to deliver a working payment integration, and they didn't deliver on time. The contract says 30 days. Period.

We want a full refund.`,
  },
  {
    id: "freelancer-fantasma",
    title: "The Ghost Freelancer",
    tagline: "75% delivered, then radio silence",
    parties: {
      client: { name: "StartupAI", role: "AI startup" },
      developer: { name: "@ghostdev", role: "Freelance developer" },
    },
    contract: {
      value: "8,000",
      currency: "USD",
      scope: "Analytics dashboard MVP — 4 sprints",
      duration: "8 weeks",
    },
    escrow: "$8,000",
    dispute:
      "Freelancer delivered 3 of 4 sprints (75% of scope) and went silent 2 weeks ago. No response to messages. Client wants full refund despite functional deliverables.",
    evidence: [
      "Sprint 1: User auth + data pipeline — delivered, tested, approved",
      "Sprint 2: Dashboard charts + filters — delivered, tested, approved",
      "Sprint 3: Export + API endpoints — delivered, tested, approved",
      "Sprint 4: Admin panel + deployment — not started, freelancer unresponsive since day 43",
      "12 unanswered messages from StartupAI (Slack + email) over 14 days",
    ],
    whatAgentDoes:
      "Evaluates each deliverable, confirms 75% has functional value, proposes paying $6,000 (75%) to freelancer and returning $2,000 (25%) to client. Registers proportional verdict on-chain.",
    demonstrates: [
      "Proportional assessment",
      "Partial settlement",
      "On-chain receipt",
    ],
    visual: {
      image: "/scenarios/freelancer.webp",
      gradient: "from-transparent via-transparent to-card",
    },
    contextMessage: `You are mediating a dispute between StartupAI (client) and @ghostdev (freelancer developer).

CONTRACT:
- Scope: Analytics dashboard MVP, delivered in 4 sprints (2 weeks each)
- Total value: $8,000 ($2,000 per sprint)
- Duration: 8 weeks
- Escrow held: $8,000

DISPUTE:
@ghostdev delivered Sprints 1-3 successfully (75% of the contracted scope) but has been completely unresponsive for 14 days. Sprint 4 (admin panel + deployment) was never started. StartupAI demands a full $8,000 refund, arguing that an incomplete product is useless to them.

EVIDENCE:
1. Sprint 1 (User authentication + data pipeline): Delivered day 14, all tests passing, approved by StartupAI CTO
2. Sprint 2 (Dashboard charts + filtering): Delivered day 28, approved with minor feedback incorporated
3. Sprint 3 (Export functionality + API endpoints): Delivered day 42, approved and integrated into staging
4. Sprint 4 (Admin panel + deployment): Not started — @ghostdev's last message was day 43
5. 12 follow-up messages from StartupAI across Slack and email over 14 days — all unanswered
6. StartupAI CTO's statement: "The 3 sprints work fine individually but we can't launch without the admin panel and deployment"

The delivered code is functional, tested, and integrated into staging. However, the product cannot go to production without Sprint 4. @ghostdev has not formally terminated the contract.

Analyze the deliverables, assess the value of completed work, and propose a fair settlement.`,
    clientOpening: `I want to be transparent here — the first 3 sprints were genuinely good work. The code is clean, tests pass, everything integrates well with our stack. I'm not going to pretend otherwise.

But here's the reality: I have a demo day with investors in 3 weeks and I cannot launch with half a product. There's no admin panel, no deployment pipeline. I can't show investors a staging environment.

@ghostdev has been completely silent for 14 days. No message, no email, nothing. That's not professional. I've already started looking for someone to finish Sprint 4.

I want a full refund so I can pay someone else to finish this properly.`,
  },
];
