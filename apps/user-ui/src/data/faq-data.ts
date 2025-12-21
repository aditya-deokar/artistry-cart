/**
 * FAQ Data - Artistry Cart Support
 *
 * Categorized questions and answers for the FAQ page.
 * Each category contains an array of Q&A items.
 */

export interface FAQItem {
    id: string;
    question: string;
    answer: string;
    category: FAQCategory;
    popular?: boolean;
}

export type FAQCategory =
    | 'orders'
    | 'shipping'
    | 'returns'
    | 'products'
    | 'account'
    | 'ai-vision';

export const faqCategories: { id: FAQCategory; label: string }[] = [
    { id: 'orders', label: 'Orders' },
    { id: 'shipping', label: 'Shipping' },
    { id: 'returns', label: 'Returns' },
    { id: 'products', label: 'Products' },
    { id: 'account', label: 'Account' },
    { id: 'ai-vision', label: 'AI Vision' },
];

export const faqData: FAQItem[] = [
    // ORDERS
    {
        id: 'order-1',
        category: 'orders',
        popular: true,
        question: 'How do I track my order?',
        answer: `Once your order ships, you'll receive an email with tracking information. You can also track your order by:

1. **Log into your account** and visit "My Orders"
2. **Click on the specific order** to view tracking details
3. **Use the tracking number** with the carrier's website

If you checked out as a guest, you can track your order using the link in your shipping confirmation email.`,
    },
    {
        id: 'order-2',
        category: 'orders',
        question: 'Can I cancel or modify my order after placing it?',
        answer: `We begin processing orders quickly to ensure prompt delivery. However, we may be able to help if you act fast:

• **Within 1 hour**: Contact us immediately and we'll do our best to modify or cancel
• **After 1 hour**: Orders may already be in preparation, especially custom items
• **After shipping**: You'll need to wait for delivery and then initiate a return

For custom or personalized orders, cancellation may not be possible once production begins.`,
    },
    {
        id: 'order-3',
        category: 'orders',
        question: 'What happens if my order is lost or damaged?',
        answer: `We take full responsibility for getting your order to you safely:

• **Damaged items**: Contact us within 48 hours with photos of the damage. We'll arrange a replacement or full refund.
• **Lost packages**: If tracking shows delivered but you haven't received it, wait 24 hours (it may appear). Then contact us to investigate.
• **Insurance**: All orders over $100 are automatically insured during transit.

We'll work with the carrier and ensure you receive your items or a full refund.`,
    },
    {
        id: 'order-4',
        category: 'orders',
        question: 'How do I view my order history?',
        answer: `To view your order history:

1. Log into your Artistry Cart account
2. Go to "My Account" → "Order History"
3. View all past orders with status, tracking, and receipts

Guest orders can be retrieved by entering your email address on the order lookup page.`,
    },
    {
        id: 'order-5',
        category: 'orders',
        question: 'Can I change my shipping address after ordering?',
        answer: `Address changes depend on order status:

• **Before shipping**: Contact us immediately and we'll update the address
• **After shipping**: We cannot redirect packages in transit. If returned to us, we'll reship to the correct address
• **Tip**: Double-check your address at checkout to avoid delays

For urgent changes, use our live chat for the fastest response.`,
    },

    // SHIPPING
    {
        id: 'shipping-1',
        category: 'shipping',
        popular: true,
        question: 'What are your shipping options and costs?',
        answer: `We offer several shipping options within the United States:

| Method | Timeframe | Cost |
|--------|-----------|------|
| **Standard** | 5-7 business days | Free over $99, $7.99 under |
| **Express** | 2-3 business days | $14.99 |
| **Priority** | 1-2 business days | $24.99 |

All orders include full tracking. Priority shipping includes SMS updates and signature confirmation.`,
    },
    {
        id: 'shipping-2',
        category: 'shipping',
        question: 'Do you ship internationally?',
        answer: `Yes! We ship to over 120 countries worldwide. International shipping rates and times vary:

• **Canada**: 7-10 days, from $14.99
• **Europe**: 10-15 days, from $24.99
• **Asia Pacific**: 14-21 days, from $29.99
• **Rest of World**: 15-25 days, from $34.99

Note: International orders may be subject to customs duties and taxes, which are the responsibility of the recipient.`,
    },
    {
        id: 'shipping-3',
        category: 'shipping',
        question: 'How long will my order take to arrive?',
        answer: `Delivery time depends on two factors:

1. **Processing time**: 1-3 business days (longer for custom/handmade items)
2. **Shipping time**: Based on method selected

For example, a Standard shipping order typically arrives within 6-10 business days total.

Custom orders may require 1-3 weeks of creation time before shipping. You'll receive updates throughout the process.`,
    },
    {
        id: 'shipping-4',
        category: 'shipping',
        question: 'Do you offer express or expedited shipping?',
        answer: `Yes! We offer two faster options:

• **Express (2-3 days)**: $14.99 - Perfect for gifts or time-sensitive orders
• **Priority (1-2 days)**: $24.99 - Includes SMS tracking and signature

Note: Express and Priority shipping apply to in-stock items only. Custom orders have separate timelines for creation before shipping begins.`,
    },
    {
        id: 'shipping-5',
        category: 'shipping',
        question: 'How is shipping calculated for multiple items?',
        answer: `Shipping is calculated based on the total order:

• We combine items when possible to reduce costs
• Free shipping over $99 applies to the entire order
• Heavy or oversized items may have additional fees (shown at checkout)

You'll see the exact shipping cost before completing your purchase.`,
    },

    // RETURNS
    {
        id: 'returns-1',
        category: 'returns',
        popular: true,
        question: 'What is your return policy?',
        answer: `We offer a **30-day hassle-free return policy**:

✓ Return within 30 days of delivery
✓ Items must be unused and in original condition
✓ Original tags must be attached
✓ Free return shipping on defective items

**Not eligible for return:**
✗ Custom or personalized orders
✗ Items marked "Final Sale"
✗ Items showing signs of wear or use`,
    },
    {
        id: 'returns-2',
        category: 'returns',
        question: 'How do I initiate a return?',
        answer: `Starting a return is easy:

1. **Log into your account** and go to "Order History"
2. **Select the order** containing the item to return
3. **Click "Start Return"** and select the reason
4. **Print the prepaid label** (free for defective items)
5. **Drop off** at any carrier location

We'll email you confirmation once your return is received and being processed.`,
    },
    {
        id: 'returns-3',
        category: 'returns',
        question: 'How long does it take to receive my refund?',
        answer: `Refund timeline:

• **Return arrives**: 3-5 business days after shipping
• **Inspection**: 1-2 business days after arrival
• **Refund processed**: Same day as inspection approval
• **Funds appear**: 5-10 business days depending on your bank

You'll receive email confirmations at each step. Original shipping costs are non-refundable unless the return is due to our error.`,
    },
    {
        id: 'returns-4',
        category: 'returns',
        question: 'Can I exchange an item instead of returning it?',
        answer: `Yes! We offer exchanges for different sizes or colors:

1. **Start a return** through your account
2. **Select "Exchange"** instead of refund
3. **Choose the new item** (same product, different variant)
4. **Ship the original** using the provided label

If exchanging for a higher-priced item, you'll be charged the difference. Lower-priced exchanges will be refunded the difference.`,
    },
    {
        id: 'returns-5',
        category: 'returns',
        question: 'What items are not eligible for return?',
        answer: `The following items cannot be returned:

• **Custom & personalized orders**: Made specifically for you
• **Final Sale items**: Clearly marked at time of purchase
• **Intimate jewelry**: Earrings, body jewelry for hygiene reasons
• **Items without tags**: Original tags must be attached
• **Worn or used items**: Must be in original, unworn condition
• **Items after 30 days**: Outside the return window

If you received a defective item in any of these categories, please contact support.`,
    },

    // PRODUCTS & CUSTOM ORDERS
    {
        id: 'products-1',
        category: 'products',
        question: 'Are all products genuinely handmade?',
        answer: `Yes! Every product on Artistry Cart is genuinely handcrafted:

• Each artisan is verified before joining our platform
• We regularly review artisan workshops and practices
• Product descriptions clearly state materials and techniques
• "Handmade" means substantial hand involvement in creation

We're committed to celebrating authentic craftsmanship—no mass-produced items.`,
    },
    {
        id: 'products-2',
        category: 'products',
        popular: true,
        question: 'How do I request a custom order?',
        answer: `Requesting a custom piece is simple:

1. **Browse artisan profiles** to find a maker whose style you love
2. **Click "Request Custom Order"** on their profile
3. **Describe your vision** including size, materials, colors, etc.
4. **Discuss with the artisan** through our messaging system
5. **Receive a quote** and timeline for your custom piece

Many artisans love custom work—it's a chance to create something unique together!`,
    },
    {
        id: 'products-3',
        category: 'products',
        question: 'Can I commission a specific artisan?',
        answer: `Absolutely! To commission a specific artisan:

1. **Visit their shop** and review their existing work
2. **Check their "Accepts Custom Orders" badge**
3. **Message them directly** with your ideas
4. **Collaborate on design** before placing the order

Not all artisans accept custom work due to demand, but many are eager to bring your ideas to life.`,
    },
    {
        id: 'products-4',
        category: 'products',
        question: "What if my custom order doesn't meet expectations?",
        answer: `We want you to love your custom piece:

• **Review process**: You'll see photos/updates during creation
• **Approval stage**: Most artisans share the final piece before shipping
• **Revisions**: Minor adjustments are often possible before completion
• **Major issues**: Contact support to mediate if needed

Custom orders cannot be returned for change of mind, but we'll work to ensure satisfaction with quality issues.`,
    },
    {
        id: 'products-5',
        category: 'products',
        question: 'How long do custom orders take?',
        answer: `Custom order timelines vary by complexity:

• **Simple customizations** (color, size): 1-2 weeks
• **Moderate custom work**: 2-4 weeks
• **Complex pieces** (furniture, large art): 4-8+ weeks

Your artisan will provide an estimated timeline before you confirm the order. Rush orders may be possible for an additional fee.`,
    },

    // ACCOUNT & PAYMENT
    {
        id: 'account-1',
        category: 'account',
        question: 'How do I create an account?',
        answer: `Creating an account is optional but recommended:

1. **Click "Sign Up"** in the top navigation
2. **Enter your email** and create a password
3. **Verify your email** through the link we send
4. **Optional**: Complete your profile for personalized recommendations

Benefits: Order tracking, saved addresses, wishlist, and exclusive member perks!`,
    },
    {
        id: 'account-2',
        category: 'account',
        popular: true,
        question: 'What payment methods do you accept?',
        answer: `We accept multiple secure payment options:

• **Credit/Debit Cards**: Visa, Mastercard, American Express, Discover
• **Digital Wallets**: Apple Pay, Google Pay, PayPal
• **Shop Pay**: For faster checkout
• **Affirm/Klarna**: Buy now, pay later (select regions)

All transactions are secured with industry-standard encryption.`,
    },
    {
        id: 'account-3',
        category: 'account',
        question: 'Is my payment information secure?',
        answer: `Absolutely. We take security seriously:

• **PCI-DSS Compliant**: Meeting the highest security standards
• **Encrypted transmission**: SSL/TLS encryption on all data
• **We don't store card details**: Handled by secure payment processors
• **Fraud monitoring**: Suspicious activity flagged automatically

Shop with confidence knowing your information is protected.`,
    },
    {
        id: 'account-4',
        category: 'account',
        question: 'How do I update my account information?',
        answer: `To update your account:

1. Log into your account
2. Go to "My Account" → "Settings"
3. Update your information:
   • Personal details (name, email, phone)
   • Shipping addresses
   • Payment methods
   • Communication preferences
4. Save changes

For security, email changes require verification.`,
    },
    {
        id: 'account-5',
        category: 'account',
        question: 'Can I shop as a guest?',
        answer: `Yes! Guest checkout is available:

• No account required to place an order
• Enter your email for order confirmation and tracking
• Option to create account after purchase

**Tip**: Creating an account makes future orders faster and lets you track order history in one place.`,
    },

    // AI VISION STUDIO
    {
        id: 'ai-1',
        category: 'ai-vision',
        popular: true,
        question: 'What is AI Vision Studio?',
        answer: `AI Vision Studio is our innovative feature that brings your ideas to life:

1. **Describe your vision** in words (e.g., "A ceramic vase with ocean waves")
2. **AI generates concepts** showing what your idea could look like
3. **Refine the design** with adjustments and variations
4. **Connect with artisans** who can craft your design

It's the bridge between imagination and handcrafted reality!`,
    },
    {
        id: 'ai-2',
        category: 'ai-vision',
        question: 'How does AI Vision work?',
        answer: `AI Vision uses advanced image generation:

1. **Input**: You describe what you want to create
2. **Processing**: AI interprets your description and generates visual concepts
3. **Output**: Multiple design options to choose from
4. **Refinement**: Adjust colors, styles, or details
5. **Artisan matching**: We suggest artisans who can create your design

The AI generates ideas—skilled human artisans create the final piece.`,
    },
    {
        id: 'ai-3',
        category: 'ai-vision',
        question: 'Is there a cost to use AI Vision?',
        answer: `AI Vision is free to explore:

• **Free tier**: 5 image generations per month
• **Artistry+ members**: 25 generations per month
• **No commitment**: Generating designs doesn't obligate you to purchase

The only cost comes when you commission an artisan to create your design.`,
    },
    {
        id: 'ai-4',
        category: 'ai-vision',
        question: 'Who creates the final product from AI designs?',
        answer: `Real human artisans create every product:

• AI generates the concept and visual reference
• You share the design with an artisan
• The artisan interprets and handcrafts the piece
• Each creation is unique—even from the same design

The AI is a creative tool; the artisan brings it to life with skill and craftsmanship.`,
    },
    {
        id: 'ai-5',
        category: 'ai-vision',
        question: 'Can I request revisions to AI-generated designs?',
        answer: `Yes! The design process is iterative:

• **Regenerate**: Get new variations with the same prompt
• **Adjust prompt**: Add/change details in your description
• **Style options**: Try different artistic styles
• **Save favorites**: Keep designs you like for later

Each generation counts toward your monthly limit, so be as descriptive as possible upfront.`,
    },
];

// Helper functions
export function getFAQsByCategory(category: FAQCategory): FAQItem[] {
    return faqData.filter((item) => item.category === category);
}

export function getPopularFAQs(): FAQItem[] {
    return faqData.filter((item) => item.popular);
}

export function searchFAQs(query: string): FAQItem[] {
    const searchTerms = query.toLowerCase().split(' ').filter(Boolean);
    return faqData.filter((item) => {
        const text = `${item.question} ${item.answer}`.toLowerCase();
        return searchTerms.every((term) => text.includes(term));
    });
}

export function getFAQById(id: string): FAQItem | undefined {
    return faqData.find((item) => item.id === id);
}
