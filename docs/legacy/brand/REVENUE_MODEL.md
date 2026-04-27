# Revenue Model & Business Strategy

## Revenue Streams Overview

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                           ARTISTRY CART REVENUE MODEL                            │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│                    ┌───────────────────────────────────────┐                     │
│                    │       TRANSACTION FEES (Primary)      │                     │
│                    │           ~70% of Revenue             │                     │
│                    └───────────────────────────────────────┘                     │
│                                     │                                            │
│              ┌──────────────────────┼──────────────────────┐                     │
│              ▼                      ▼                      ▼                     │
│    ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐              │
│    │ Standard Sales  │   │  Custom Orders  │   │  AI Vision Fee  │              │
│    │     12%         │   │      15%        │   │   Per Session   │              │
│    └─────────────────┘   └─────────────────┘   └─────────────────┘              │
│                                                                                  │
│                                                                                  │
│                    ┌───────────────────────────────────────┐                     │
│                    │     SUBSCRIPTIONS (Secondary)         │                     │
│                    │           ~20% of Revenue             │                     │
│                    └───────────────────────────────────────┘                     │
│                                     │                                            │
│              ┌──────────────────────┼──────────────────────┐                     │
│              ▼                      ▼                      ▼                     │
│    ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐              │
│    │  Artisan Plan   │   │  Master Plan    │   │  Gallery Plan   │              │
│    │   $19.99/mo     │   │   $49.99/mo     │   │   $99.99/mo     │              │
│    └─────────────────┘   └─────────────────┘   └─────────────────┘              │
│                                                                                  │
│                                                                                  │
│                    ┌───────────────────────────────────────┐                     │
│                    │       ADVERTISING (Tertiary)          │                     │
│                    │           ~10% of Revenue             │                     │
│                    └───────────────────────────────────────┘                     │
│                                     │                                            │
│              ┌──────────────────────┼──────────────────────┐                     │
│              ▼                      ▼                      ▼                     │
│    ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐              │
│    │ Featured Listing│   │  Homepage Spots │   │  Search Boost   │              │
│    │   $4.99/week    │   │   $29.99/week   │   │  $0.50/click    │              │
│    └─────────────────┘   └─────────────────┘   └─────────────────┘              │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## Transaction Fees

### Commission Structure

| Transaction Type | Platform Fee | Notes |
|-----------------|--------------|-------|
| **Standard Sale** | 12% | Competitive with Etsy (6.5% + payment fees) |
| **Custom Order (Non-AI)** | 14% | Additional complexity |
| **AI Vision Custom Order** | 15% | Premium for AI-assisted matching |
| **Digital Download** | 10% | Lower overhead |

### Payment Processing

| Fee Type | Rate | Collected By |
|----------|------|--------------|
| **Stripe Fee** | 2.9% + $0.30 | Stripe (passed to seller) |
| **Currency Conversion** | 1% | Platform |
| **Refund Processing** | $0.50 | Platform |

### Example Transaction

```
Sale Price:                  $100.00
├── Platform Commission (12%): - $12.00
├── Stripe Fee (2.9% + $0.30): - $3.20
└── Seller Receives:            $84.80
```

---

## Subscription Tiers

### Seller Plans

| Plan | Monthly | Annual (20% off) | Commission | Key Features |
|------|---------|------------------|------------|--------------|
| **Starter** | Free | Free | 15% | 10 listings, basic analytics, standard support |
| **Artisan** | $19.99 | $191.90 | 12% | Unlimited listings, full analytics, priority support |
| **Master** | $49.99 | $479.90 | 10% | + Featured badge, promotion tools, monthly spotlight |
| **Gallery** | $99.99 | $959.90 | 8% | + Dedicated success manager, virtual events, API access |

### Plan Feature Comparison

| Feature | Starter | Artisan | Master | Gallery |
|---------|:-------:|:-------:|:------:|:-------:|
| Listings | 10 | ∞ | ∞ | ∞ |
| Commission Rate | 15% | 12% | 10% | 8% |
| AI Vision Requests Received | 3/mo | ∞ | ∞ | ∞ |
| Analytics Dashboard | Basic | Full | Full | Full + API |
| Custom Shop URL | ❌ | ✅ | ✅ | ✅ |
| Promotion Credits | ❌ | $10/mo | $25/mo | $50/mo |
| Featured Badge | ❌ | ❌ | ✅ | ✅ |
| Priority Support | ❌ | ✅ | ✅ | ✅ |
| Success Manager | ❌ | ❌ | ❌ | ✅ |
| Virtual Events | ❌ | ❌ | ❌ | ✅ |

---

## Advertising & Promotions

### Product Promotion Options

| Promotion Type | Cost | Duration | Visibility |
|---------------|------|----------|------------|
| **Featured Listing** | $4.99 | 7 days | Category page highlight |
| **Homepage Spotlight** | $29.99 | 7 days | Homepage carousel |
| **Search Boost** | $0.50/click | Until budget depleted | Search results priority |
| **Email Feature** | $49.99 | 1 newsletter | Subscriber audience |

### Seller Advertising Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│                     PROMOTION MANAGER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Active Campaigns                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Featured: "Handmade Ceramic Vase"                       │   │
│  │ Status: Running | Ends: Dec 25 | Views: 1,234           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Search Boost: "Art Prints Collection"                   │   │
│  │ Budget: $50 | Spent: $23.50 | Clicks: 47                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [+ Create New Campaign]                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## AI Vision Monetization

### Credit System

| Package | Credits | Price | Per Credit |
|---------|---------|-------|------------|
| **Starter** | 5 | Free (monthly) | $0.00 |
| **Explorer** | 20 | $4.99 | $0.25 |
| **Creator** | 50 | $9.99 | $0.20 |
| **Unlimited** | ∞ | $19.99/mo | N/A |

### Credit Usage

| Action | Credits |
|--------|---------|
| Generate concept (4 images) | 1 credit |
| Refine/iterate | 0.5 credits |
| Upscale image | 0.25 credits |
| Save to collection | Free |
| Share with artisans | Free |

---

## Financial Projections

### Year 1 Projections

| Metric | Q1 | Q2 | Q3 | Q4 | Total |
|--------|-----|-----|-----|-----|-------|
| **GMV** | $50K | $150K | $400K | $1M | $1.6M |
| **Transaction Revenue** | $6K | $18K | $48K | $120K | $192K |
| **Subscription Revenue** | $2K | $5K | $15K | $35K | $57K |
| **Advertising Revenue** | $500 | $2K | $5K | $12K | $19.5K |
| **AI Vision Revenue** | $1K | $3K | $8K | $20K | $32K |
| **Total Revenue** | $9.5K | $28K | $76K | $187K | **$300.5K** |

### Cost Structure

| Category | Monthly (at scale) | % of Revenue |
|----------|-------------------|--------------|
| **Infrastructure** | $2,000 | 8% |
| **AI API Costs** | $1,500 | 6% |
| **Payment Processing** | Passed to sellers | 0% |
| **Support** | $1,000 | 4% |
| **Marketing** | $3,000 | 12% |
| **Development** | $0 (solo) | 0% |
| **Total** | $7,500 | ~30% |

### Projected Margins

| Year | Revenue | Costs | Net Margin |
|------|---------|-------|------------|
| Year 1 | $300K | $90K | 70% |
| Year 2 | $1.2M | $350K | 71% |
| Year 3 | $4M | $1M | 75% |

---

## Competitive Pricing Analysis

### vs. Etsy

| Fee Type | Etsy | Artistry Cart | Advantage |
|----------|------|---------------|-----------|
| Listing Fee | $0.20/item | Free | ✅ AC |
| Transaction Fee | 6.5% | 12% | Etsy |
| Payment Processing | 3% + $0.25 | 2.9% + $0.30 | ~ Equal |
| Offsite Ads | 15% (mandatory) | Optional | ✅ AC |
| **Effective Rate** | ~25% | ~15% | ✅ AC |

### vs. Fiverr

| Fee Type | Fiverr | Artistry Cart |
|----------|--------|---------------|
| Seller Commission | 20% | 12-15% |
| Buyer Fee | 5.5% | 0% |
| Custom Order Support | Basic | Advanced (AI Vision) |

---

## Growth Levers

### Short-term (Year 1)

1. **Referral Program**: Give $10, get $10 for buyer referrals
2. **Artist Partner Program**: Reduced commission for early adopters
3. **Content Marketing**: SEO blog about handmade, custom art
4. **Social Proof**: Featured artist stories, buyer testimonials

### Long-term (Year 2+)

1. **International Expansion**: Localized sites, multi-currency
2. **Mobile App**: iOS/Android with push notifications
3. **B2B Channel**: Interior designers, corporate buyers
4. **White Label**: Platform licensing to niche marketplaces

---

## Metrics Dashboard

### Key Business Metrics

| Metric | Definition | Target |
|--------|------------|--------|
| **GMV** | Total transaction value | $2M Y1 |
| **Take Rate** | Revenue / GMV | 12-15% |
| **CAC** | Cost to acquire customer | < $15 |
| **LTV** | Lifetime customer value | > $150 |
| **MRR** | Monthly recurring revenue | $25K by Q4 |
| **Churn Rate** | Monthly subscriber churn | < 5% |

### Unit Economics

```
Average Order Value:           $75
Orders per Buyer (Annual):     2.5
Buyer LTV:                     $187.50
Commission per Order:          $9
Gross Profit per Buyer:        $22.50 (LTV)

Target CAC (3:1 LTV:CAC):      $7.50
```

---

## Payment Terms

### Seller Payouts

| Plan | Payout Schedule | Minimum |
|------|-----------------|---------|
| Starter | Weekly | $25 |
| Artisan | Weekly | $10 |
| Master | Daily | $0 |
| Gallery | Daily | $0 |

### Payment Methods

- Direct bank transfer (ACH)
- PayPal
- Stripe Express (instant, 1% fee)

---

*This revenue model balances seller-friendly pricing with sustainable platform economics.*
