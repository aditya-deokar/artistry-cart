# Artistry Cart - Support Pages Blueprint

> **Design Philosophy**: Support pages that feel as carefully crafted as the products we sell. Clear, helpful, and beautifully designed—because customer care is an extension of artistry.

---

## 📋 Overview

The Support section consists of four essential pages that prioritize user experience while maintaining the premium aesthetic of Artistry Cart:

| Page | Purpose | Key Features |
|------|---------|--------------|
| **FAQ** | Answer common questions | Categorized accordion, search, popular topics |
| **Shipping** | Explain delivery options | Visual timeline, cost calculator, tracking |
| **Returns** | Clarify return policy | Step-by-step process, eligibility checker |
| **Contact** | Provide support channels | Form, live chat, office locations |

---

## 🎨 Design Inspiration

Drawing from best-in-class support experiences:

| Brand | Inspiration |
|-------|-------------|
| **Apple** | Clean FAQ organization, visual process guides |
| **Aesop** | Elegant forms, refined typography throughout |
| **Away** | Friendly tone, illustrated shipping guides |
| **Glossier** | Conversational FAQs, approachable contact forms |
| **Reformation** | Sustainability-focused shipping messaging |

### Core Principles

1. **Clarity First** - Information should be instantly findable
2. **Visual Hierarchy** - Guide users to answers quickly  
3. **Helpful Tone** - Warm, not corporate; confident, not cold
4. **Self-Service Focus** - Empower users to solve issues independently
5. **Consistent Aesthetics** - Support pages feel like the rest of the site

---

## 🎨 Shared Design Elements

### Section Header Pattern

All support pages share a consistent hero pattern:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  NAVIGATION                                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                    [Icon]                                                   │
│                                                                             │
│                 PAGE TITLE                                                  │
│        Helpful subtitle explaining the page                                 │
│                                                                             │
│             [ Optional: Search or Quick Action ]                            │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                       MAIN CONTENT AREA                                     │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                    NEED MORE HELP? (CTA Section)                            │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  FOOTER                                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Color Usage

| Section | Light Mode | Dark Mode |
|---------|------------|-----------|
| Page Background | `--ac-ivory` | `--ac-obsidian` |
| Hero Section | `--ac-cream` | `--ac-onyx` |
| Cards/Accordion | `--ac-cream` | `--ac-onyx` |
| Highlight Boxes | `--ac-gold/10` | `--ac-gold/15` |
| Success States | `--ac-sage` | `--ac-sage` |
| Warning States | `--ac-gold` | `--ac-gold` |

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Page Title | Playfair Display | 3rem (48px) | 400 |
| Section Headings | Cormorant Garamond | 1.75rem (28px) | 500 |
| Accordion Titles | Inter | 1.125rem (18px) | 500 |
| Body Text | Inter | 1rem (16px) | 400 |
| Labels/Captions | Inter | 0.875rem (14px) | 500 |

---

## 📄 Page 1: FAQ (Frequently Asked Questions)

### Purpose
Provide quick, searchable answers to common questions while reducing support ticket volume.

### Page Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  1. HERO SECTION                                                            │
│     - HelpCircle icon                                                       │
│     - "Frequently Asked Questions"                                          │
│     - "Find quick answers to common questions"                              │
│     - [Search input with magnifying glass]                                  │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  2. POPULAR TOPICS (Quick Links)                                            │
│     [Order Tracking] [Shipping Times] [Returns] [Custom Orders] [Payment]  │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  3. CATEGORY TABS                                                           │
│     [All] [Orders] [Shipping] [Returns] [Products] [Account] [AI Vision]   │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  4. FAQ ACCORDION                                                           │
│     ┌───────────────────────────────────────────────────────────────────┐   │
│     │ Q: How do I track my order?                               [+]    │   │
│     ├───────────────────────────────────────────────────────────────────┤   │
│     │ Q: What payment methods do you accept?                    [+]    │   │
│     ├───────────────────────────────────────────────────────────────────┤   │
│     │ Q: Can I cancel or modify my order?                       [+]    │   │
│     └───────────────────────────────────────────────────────────────────┘   │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  5. STILL NEED HELP? CTA                                                    │
│     "Can't find what you're looking for?"                                   │
│     [Contact Support] [Live Chat]                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### FAQ Categories & Questions

#### Orders
- How do I track my order?
- Can I cancel or modify my order after placing it?
- What happens if my order is lost or damaged?
- How do I view my order history?
- Can I change my shipping address after ordering?

#### Shipping
- What are your shipping options and costs?
- Do you ship internationally?
- How long will my order take to arrive?
- Do you offer express or expedited shipping?
- How is shipping calculated for multiple items?

#### Returns & Refunds
- What is your return policy?
- How do I initiate a return?
- How long does it take to receive my refund?
- Can I exchange an item instead of returning it?
- What items are not eligible for return?

#### Products & Custom Orders
- Are all products genuinely handmade?
- How do I request a custom order?
- Can I commission a specific artisan?
- What if my custom order doesn't meet expectations?
- How long do custom orders take?

#### Account & Payment
- How do I create an account?
- What payment methods do you accept?
- Is my payment information secure?
- How do I update my account information?
- Can I shop as a guest?

#### AI Vision Studio
- What is AI Vision Studio?
- How does AI Vision work?
- Is there a cost to use AI Vision?
- Who creates the final product from AI designs?
- Can I request revisions to AI-generated designs?

### Accordion Design

```tsx
// Expanded accordion item
┌───────────────────────────────────────────────────────────────────────────┐
│ Q: How do I track my order?                                         [-]  │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  Once your order ships, you'll receive an email with tracking            │
│  information. You can also:                                               │
│                                                                           │
│  1. Log into your account and visit "My Orders"                          │
│  2. Click on the specific order to view tracking details                 │
│  3. Use the tracking number with the carrier's website                   │
│                                                                           │
│  [Track My Order Button]                                                  │
│                                                                           │
│  ─────────────────────────────────────────────────────────               │
│  Was this helpful?  [👍 Yes]  [👎 No]                                     │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

### Components

| Component | File | Features |
|-----------|------|----------|
| `FAQHero` | `FAQHero.tsx` | Icon, title, subtitle, search input |
| `PopularTopics` | `PopularTopics.tsx` | Pill-style quick links |
| `FAQCategoryTabs` | `FAQCategoryTabs.tsx` | Horizontal scrollable tabs |
| `FAQAccordion` | `FAQAccordion.tsx` | Animated expand/collapse, helpful vote |
| `FAQSearch` | `FAQSearch.tsx` | Real-time filtering with highlight |
| `NeedHelpCTA` | `NeedHelpCTA.tsx` | Reusable across support pages |

### Animations

- **Search**: Debounced input with loading state
- **Accordion**: Smooth height transition (300ms ease-out)
- **Category Tabs**: Underline slides to active tab
- **Results**: Filtered questions fade in with stagger

---

## 📄 Page 2: Shipping

### Purpose
Clearly communicate shipping options, costs, and timelines with visual aids.

### Page Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  1. HERO SECTION                                                            │
│     - Truck/Package icon                                                    │
│     - "Shipping Information"                                                │
│     - "Delivering handcrafted treasures to your doorstep"                   │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  2. SHIPPING OPTIONS TABLE                                                  │
│     ┌───────────────┬────────────┬──────────────┬──────────────┐           │
│     │ Method        │ Timeframe  │ Cost         │ Tracking     │           │
│     ├───────────────┼────────────┼──────────────┼──────────────┤           │
│     │ Standard      │ 5-7 days   │ Free over $99│ Yes          │           │
│     │ Express       │ 2-3 days   │ $14.99       │ Yes          │           │
│     │ Priority      │ 1-2 days   │ $24.99       │ Yes + SMS    │           │
│     └───────────────┴────────────┴──────────────┴──────────────┘           │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  3. SHIPPING TIMELINE VISUALIZATION                                         │
│                                                                             │
│     [Order] ──── [Processing] ──── [Shipped] ──── [In Transit] ──── [✓]   │
│       1 day        1-2 days         Varies          Varies        Delivered│
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  4. INTERNATIONAL SHIPPING                                                  │
│     - Map or region grid                                                    │
│     - Countries list with estimated times                                   │
│     - Customs & duties information                                          │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  5. SHIPPING CALCULATOR (Interactive)                                       │
│     [Country Dropdown] [Zip/Postal] [Calculate]                             │
│     Result: Estimated cost and delivery date                                │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  6. SPECIAL NOTES                                                           │
│     - Handmade items may require additional prep time                       │
│     - Peak season delays notification                                       │
│     - Sustainable packaging commitment                                      │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  7. TRACKING YOUR ORDER                                                     │
│     - How tracking works                                                    │
│     - Direct link to tracking page                                          │
│     - Carrier information                                                   │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  8. FAQ + CTA                                                               │
│     Quick shipping FAQs + "Contact for shipping questions"                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Shipping Data

#### Domestic Shipping (US)

| Method | Timeframe | Cost | Features |
|--------|-----------|------|----------|
| **Standard** | 5-7 business days | Free over $99, $7.99 under | Full tracking |
| **Express** | 2-3 business days | $14.99 | Priority handling |
| **Priority** | 1-2 business days | $24.99 | SMS updates, signature |

#### International Shipping

| Region | Timeframe | Cost | Notes |
|--------|-----------|------|-------|
| **Canada** | 7-10 days | From $14.99 | Duties may apply |
| **Europe** | 10-15 days | From $24.99 | VAT included where possible |
| **Asia Pacific** | 14-21 days | From $29.99 | Customs fees vary |
| **Rest of World** | 15-25 days | From $34.99 | Contact for remote areas |

### Components

| Component | File | Features |
|-----------|------|----------|
| `ShippingHero` | `ShippingHero.tsx` | Icon, title, subtitle |
| `ShippingTable` | `ShippingTable.tsx` | Responsive table with badges |
| `ShippingTimeline` | `ShippingTimeline.tsx` | Visual step indicator |
| `InternationalMap` | `InternationalMap.tsx` | Interactive region selector |
| `ShippingCalculator` | `ShippingCalculator.tsx` | Country/zip input, estimate |
| `SpecialNotes` | `SpecialNotes.tsx` | Info cards with icons |
| `TrackingInfo` | `TrackingInfo.tsx` | Tracking explanation + CTA |

### Animations

- **Timeline**: Steps connect with animated line on scroll
- **Calculator**: Slide-up results with pricing
- **Table**: Row hover highlights
- **Map**: Region pulse on hover

---

## 📄 Page 3: Returns

### Purpose
Make the return process clear and reassuring, emphasizing customer satisfaction.

### Page Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  1. HERO SECTION                                                            │
│     - RefreshCw/Undo icon                                                   │
│     - "Returns & Exchanges"                                                 │
│     - "Satisfaction guaranteed. Easy returns within 30 days."              │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  2. RETURN POLICY HIGHLIGHTS                                                │
│     ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐         │
│     │ 30 Days    │  │ Free       │  │ Full       │  │ Easy       │         │
│     │ Return     │  │ Return     │  │ Refund     │  │ Process    │         │
│     │ Window     │  │ Shipping*  │  │ Guaranteed │  │            │         │
│     └────────────┘  └────────────┘  └────────────┘  └────────────┘         │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  3. RETURN PROCESS (Step-by-Step)                                           │
│                                                                             │
│     ① Initiate ─── ② Package ─── ③ Ship ─── ④ Refund                       │
│       Return         Items         Back       Processed                     │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  4. RETURN ELIGIBILITY CHECKER (Interactive)                                │
│     "Check if your item qualifies"                                          │
│     [Order Number] [Item] → [Check Eligibility]                             │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  5. RETURN CONDITIONS                                                       │
│     ✓ Items eligible for return                                             │
│     ✗ Items NOT eligible for return                                         │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  6. EXCHANGES                                                               │
│     How to exchange for different size/color                                │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  7. REFUND INFORMATION                                                      │
│     - Processing time: 5-7 business days                                    │
│     - Refund method: Original payment method                                │
│     - Partial refunds for damaged items                                     │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  8. START A RETURN CTA                                                      │
│     [Start Return] [Contact Support]                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Return Policy Details

#### Eligible for Return ✓
- Unused, unworn items in original condition
- Items with all tags attached
- Items returned within 30 days of delivery
- Defective or damaged items (extended window)

#### NOT Eligible for Return ✗
- Custom or personalized orders
- Items marked "Final Sale"
- Intimate items (jewelry worn close to skin - hygiene)
- Items without original packaging
- Items showing signs of wear or use

### Return Process Steps

| Step | Title | Description | Timeframe |
|------|-------|-------------|-----------|
| 1 | **Initiate Return** | Log into your account and select the item to return | 2 minutes |
| 2 | **Print Label** | Download and print prepaid shipping label | Instant |
| 3 | **Package Item** | Securely package item in original or similar packaging | 5 minutes |
| 4 | **Drop Off** | Drop at any carrier location or schedule pickup | Same day |
| 5 | **Refund** | Refund processed upon inspection | 5-7 days |

### Components

| Component | File | Features |
|-----------|------|----------|
| `ReturnsHero` | `ReturnsHero.tsx` | Icon, title, reassuring message |
| `PolicyHighlights` | `PolicyHighlights.tsx` | 4-column benefit cards |
| `ReturnProcess` | `ReturnProcess.tsx` | Visual stepper with details |
| `EligibilityChecker` | `EligibilityChecker.tsx` | Interactive form |
| `ReturnConditions` | `ReturnConditions.tsx` | Two-column eligible/not eligible |
| `ExchangeInfo` | `ExchangeInfo.tsx` | Exchange process explanation |
| `RefundInfo` | `RefundInfo.tsx` | Timeline and method details |
| `StartReturnCTA` | `StartReturnCTA.tsx` | Prominent action buttons |

### Animations

- **Process Steps**: Sequential reveal on scroll
- **Eligibility Checker**: Form validation with success/error states
- **Conditions Lists**: Checkmark/X icons animate in

---

## 📄 Page 4: Contact

### Purpose
Provide multiple support channels with a focus on helpful, responsive communication.

### Page Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  1. HERO SECTION                                                            │
│     - MessageCircle icon                                                    │
│     - "Get in Touch"                                                        │
│     - "We're here to help. Reach out anytime."                              │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  2. CONTACT OPTIONS (3-Column Grid)                                         │
│     ┌────────────────┐  ┌────────────────┐  ┌────────────────┐             │
│     │   💬 Chat      │  │   📧 Email     │  │   📞 Phone     │             │
│     │   Live Support │  │   24hr Response│  │   Mon-Fri 9-6  │             │
│     │   [Start Chat] │  │   support@...  │  │   +1 (555)...  │             │
│     └────────────────┘  └────────────────┘  └────────────────┘             │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  3. CONTACT FORM                                                            │
│     ┌───────────────────────────────────────────────────────────────────┐   │
│     │  Reason for Contact: [Dropdown]                                   │   │
│     │                                                                   │   │
│     │  Name: [____________]     Email: [____________]                   │   │
│     │                                                                   │   │
│     │  Order Number (optional): [____________]                          │   │
│     │                                                                   │   │
│     │  Message:                                                         │   │
│     │  ┌─────────────────────────────────────────────────────────────┐ │   │
│     │  │                                                             │ │   │
│     │  │                                                             │ │   │
│     │  └─────────────────────────────────────────────────────────────┘ │   │
│     │                                                                   │   │
│     │  [Attach Files]                         [Send Message]           │   │
│     └───────────────────────────────────────────────────────────────────┘   │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  4. QUICK HELP LINKS                                                        │
│     Before reaching out, you might find your answer here:                   │
│     [FAQ] [Track Order] [Returns] [Shipping Info]                           │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  5. RESPONSE TIME EXPECTATIONS                                              │
│     "Average response time: 2-4 hours during business hours"                │
│     "Weekend inquiries answered by Monday 10am"                             │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  6. OFFICE LOCATION (Optional)                                              │
│     [Map]                                                                   │
│     Address: 123 Artisan Way, Creative District, NY 10001                   │
│     Hours: Mon-Fri 9:00 AM - 6:00 PM EST                                    │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  7. SOCIAL MEDIA LINKS                                                      │
│     Follow us: [Instagram] [Twitter] [Pinterest] [Facebook]                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Contact Reasons (Dropdown Options)

1. Order Status / Tracking
2. Returns & Refunds
3. Product Questions
4. Custom Order Inquiry
5. Artisan Partnership
6. Technical Issue
7. Billing & Payment
8. Press / Media
9. General Feedback
10. Other

### Contact Channels

| Channel | Availability | Response Time | Best For |
|---------|--------------|---------------|----------|
| **Live Chat** | Mon-Fri 9am-9pm EST | Instant | Quick questions |
| **Email** | 24/7 | Within 24 hours | Detailed inquiries |
| **Phone** | Mon-Fri 9am-6pm EST | Immediate | Urgent issues |
| **Social DM** | 24/7 | 12-24 hours | Casual questions |

### Components

| Component | File | Features |
|-----------|------|----------|
| `ContactHero` | `ContactHero.tsx` | Icon, title, welcoming message |
| `ContactOptions` | `ContactOptions.tsx` | 3-column channel cards |
| `ContactForm` | `ContactForm.tsx` | Full form with validation |
| `QuickHelpLinks` | `QuickHelpLinks.tsx` | Card links to support pages |
| `ResponseExpectations` | `ResponseExpectations.tsx` | Timeline info box |
| `OfficeLocation` | `OfficeLocation.tsx` | Map + address + hours |
| `SocialLinks` | `SocialLinks.tsx` | Social media icons |

### Form Validation

| Field | Validation | Error Message |
|-------|------------|---------------|
| Name | Required, min 2 chars | "Please enter your name" |
| Email | Required, valid format | "Please enter a valid email" |
| Reason | Required | "Please select a reason" |
| Message | Required, min 20 chars | "Please provide more details" |
| Order # | Optional, format check | "Invalid order number format" |

### Animations

- **Form**: Input focus glow, validation feedback
- **Success**: Checkmark animation on submit
- **Contact Cards**: Lift and glow on hover
- **Map**: Subtle pulse on location marker

---

## 📁 Proposed File Structure

```
apps/user-ui/src/
├── app/
│   └── support/
│       ├── page.tsx                 # Support hub (optional landing)
│       ├── faq/
│       │   └── page.tsx             # FAQ page
│       ├── shipping/
│       │   └── page.tsx             # Shipping information
│       ├── returns/
│       │   └── page.tsx             # Returns & exchanges
│       └── contact/
│           └── page.tsx             # Contact form
│
├── components/
│   └── support/
│       ├── index.ts                 # Barrel exports
│       │
│       ├── shared/                  # Shared components
│       │   ├── SupportHero.tsx      # Reusable hero pattern
│       │   ├── NeedHelpCTA.tsx      # Bottom CTA section
│       │   ├── QuickLinks.tsx       # Quick navigation
│       │   └── Breadcrumb.tsx       # Support breadcrumbs
│       │
│       ├── faq/                     # FAQ components
│       │   ├── FAQSearch.tsx
│       │   ├── FAQCategoryTabs.tsx
│       │   ├── FAQAccordion.tsx
│       │   ├── FAQAccordionItem.tsx
│       │   └── PopularTopics.tsx
│       │
│       ├── shipping/                # Shipping components
│       │   ├── ShippingTable.tsx
│       │   ├── ShippingTimeline.tsx
│       │   ├── ShippingCalculator.tsx
│       │   ├── InternationalInfo.tsx
│       │   └── SpecialNotes.tsx
│       │
│       ├── returns/                 # Returns components
│       │   ├── PolicyHighlights.tsx
│       │   ├── ReturnProcess.tsx
│       │   ├── EligibilityChecker.tsx
│       │   ├── ReturnConditions.tsx
│       │   └── RefundInfo.tsx
│       │
│       └── contact/                 # Contact components
│           ├── ContactOptions.tsx
│           ├── ContactForm.tsx
│           ├── ResponseInfo.tsx
│           └── OfficeLocation.tsx
│
├── actions/
│   └── support.actions.ts           # Server actions for forms
│
└── data/
    └── faq-data.ts                  # FAQ question/answer data
```

---

## 🎭 Animation Guidelines

### Page Entrance

```javascript
// Standard section entrance
gsap.from('.support-section', {
  y: 60,
  opacity: 0,
  duration: 0.8,
  ease: 'power3.out',
  scrollTrigger: {
    trigger: '.support-section',
    start: 'top 80%',
  }
});
```

### Accordion Animation

```javascript
// Smooth height transition
gsap.to(accordionContent, {
  height: isOpen ? 'auto' : 0,
  duration: 0.3,
  ease: 'power2.out',
});
```

### Timeline Progress

```javascript
// Sequential step animation
gsap.from('.timeline-step', {
  x: -20,
  opacity: 0,
  duration: 0.5,
  stagger: 0.15,
  ease: 'power3.out',
  scrollTrigger: {
    trigger: '.timeline-container',
    start: 'top 75%',
  }
});
```

### Form Feedback

```javascript
// Success animation
gsap.to('.success-icon', {
  scale: [0, 1.2, 1],
  duration: 0.5,
  ease: 'back.out(1.7)',
});
```

---

## ⏱️ Implementation Phases

### Phase 1: Foundation (4-6 hours)
1. Create `/support` directory structure
2. Build shared components:
   - `SupportHero.tsx`
   - `NeedHelpCTA.tsx`
   - `Breadcrumb.tsx`
3. Set up `support.actions.ts` for form handling
4. Create `faq-data.ts` with all Q&A content

### Phase 2: FAQ Page (4-5 hours)
5. Build FAQ page route (`/support/faq`)
6. Implement `FAQSearch` with filtering
7. Implement `FAQCategoryTabs`
8. Implement `FAQAccordion` with animations
9. Add helpful voting functionality

### Phase 3: Shipping Page (3-4 hours)
10. Build Shipping page route (`/support/shipping`)
11. Implement `ShippingTable` (responsive)
12. Implement `ShippingTimeline` visualization
13. Implement `ShippingCalculator` (optional API)
14. Add international shipping info

### Phase 4: Returns Page (3-4 hours)
15. Build Returns page route (`/support/returns`)
16. Implement `PolicyHighlights` cards
17. Implement `ReturnProcess` stepper
18. Implement `EligibilityChecker` form
19. Add conditions and refund info

### Phase 5: Contact Page (4-5 hours)
20. Build Contact page route (`/support/contact`)
21. Implement `ContactOptions` cards
22. Implement full `ContactForm` with validation
23. Add server action for form submission
24. Implement success/error states
25. Add office location (optional map)

### Phase 6: Polish (3-4 hours)
26. Add all GSAP animations
27. Mobile responsive testing
28. Dark mode verification
29. Cross-browser testing
30. Accessibility audit (WCAG 2.1)

---

## 📱 Responsive Considerations

| Breakpoint | Adjustments |
|------------|-------------|
| **Desktop (1200px+)** | Full layout, multi-column grids |
| **Tablet (768-1199px)** | 2-column grids, stacked forms |
| **Mobile (<768px)** | Single column, accordion priority, simplified tables |

### Mobile-Specific Features

- FAQ: Search prominent, category tabs scroll horizontally
- Shipping: Table converts to stacked cards
- Returns: Process steps stack vertically
- Contact: Form takes full width, channels stack

---

## 🔗 SEO Metadata

### FAQ Page
```tsx
export const metadata = {
  title: 'FAQ | Artistry Cart - Frequently Asked Questions',
  description: 'Find answers to common questions about orders, shipping, returns, custom orders, and more at Artistry Cart.',
  openGraph: {
    title: 'Frequently Asked Questions | Artistry Cart',
    description: 'Get quick answers to your questions about shopping at Artistry Cart.',
  },
};
```

### Shipping Page
```tsx
export const metadata = {
  title: 'Shipping Information | Artistry Cart',
  description: 'Learn about shipping options, costs, and delivery times for Artistry Cart orders. Free shipping on orders over $99.',
  openGraph: {
    title: 'Shipping Information | Artistry Cart',
    description: 'Fast, reliable shipping for handcrafted treasures.',
  },
};
```

### Returns Page
```tsx
export const metadata = {
  title: 'Returns & Exchanges | Artistry Cart',
  description: '30-day hassle-free returns at Artistry Cart. Learn about our return policy, process, and refund timeline.',
  openGraph: {
    title: 'Easy Returns & Exchanges | Artistry Cart',
    description: 'Satisfaction guaranteed with our 30-day return policy.',
  },
};
```

### Contact Page
```tsx
export const metadata = {
  title: 'Contact Us | Artistry Cart Support',
  description: 'Get in touch with Artistry Cart support. Live chat, email, or phone—we\'re here to help with your orders and questions.',
  openGraph: {
    title: 'Contact Artistry Cart',
    description: 'Reach out to our friendly support team.',
  },
};
```

---

## ✅ Success Criteria

- [ ] All pages load under 2 seconds
- [ ] FAQ search returns relevant results instantly
- [ ] Accordion animations smooth (60fps)
- [ ] Contact form validates properly
- [ ] Form submissions reach backend successfully
- [ ] All pages fully responsive
- [ ] Dark mode works correctly
- [ ] Accessibility compliant (WCAG 2.1 AA)
- [ ] Consistent design with rest of site
- [ ] Helpful content that reduces support tickets

---

## 🔗 Related Documents

- `LANDING_PAGE_BLUEPRINT.md` - Design patterns and color usage
- `ABOUT_PAGE_BLUEPRINT.md` - Content-heavy page patterns
- `BRAND_IDENTITY.md` - Typography and voice guidelines
- `ARTISANS_PAGE_BLUEPRINT.md` - Component structure patterns

---

*Document Version: 1.0*  
*Created: December 2024*  
*Last Updated: December 21, 2024*
