'use server';

/**
 * Support Page Server Actions
 *
 * Handles form submissions and API calls for support pages.
 */

import { z } from 'zod';

// Contact form schema
const contactFormSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    reason: z.string().min(1, 'Please select a reason'),
    orderNumber: z.string().optional(),
    message: z.string().min(20, 'Please provide more details (at least 20 characters)'),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

export interface ActionResult {
    success: boolean;
    message: string;
    errors?: Record<string, string>;
}

/**
 * Submit contact form
 */
export async function submitContactForm(formData: ContactFormData): Promise<ActionResult> {
    try {
        // Validate form data
        const result = contactFormSchema.safeParse(formData);

        if (!result.success) {
            const errors: Record<string, string> = {};
            result.error.issues.forEach((issue) => {
                const path = issue.path[0] as string;
                errors[path] = issue.message;
            });
            return {
                success: false,
                message: 'Please fix the errors below',
                errors,
            };
        }

        // TODO: Send email or save to database
        // For now, simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Log for development
        console.log('Contact form submitted:', result.data);

        return {
            success: true,
            message: 'Thank you for reaching out! We\'ll respond within 24 hours.',
        };
    } catch (error) {
        console.error('Contact form error:', error);
        return {
            success: false,
            message: 'Something went wrong. Please try again.',
        };
    }
}

// Return eligibility check schema
const returnEligibilitySchema = z.object({
    orderNumber: z.string().min(1, 'Please enter your order number'),
    email: z.string().email('Please enter a valid email'),
});

export type ReturnEligibilityData = z.infer<typeof returnEligibilitySchema>;

export interface EligibilityResult {
    eligible: boolean;
    message: string;
    orderDetails?: {
        orderNumber: string;
        orderDate: string;
        items: Array<{
            name: string;
            eligible: boolean;
            reason?: string;
        }>;
        daysRemaining: number;
    };
}

/**
 * Check return eligibility
 */
export async function checkReturnEligibility(
    data: ReturnEligibilityData
): Promise<EligibilityResult> {
    try {
        // Validate input
        const result = returnEligibilitySchema.safeParse(data);

        if (!result.success) {
            return {
                eligible: false,
                message: 'Please enter a valid order number and email.',
            };
        }

        // TODO: Look up order in database
        // Mock response for development
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Simulate order lookup
        const mockOrder = {
            orderNumber: data.orderNumber,
            orderDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
            items: [
                { name: 'Handcrafted Ceramic Vase', eligible: true },
                { name: 'Custom Engraved Ring', eligible: false, reason: 'Custom/personalized items cannot be returned' },
            ],
            daysRemaining: 20,
        };

        const hasEligibleItems = mockOrder.items.some((item) => item.eligible);

        return {
            eligible: hasEligibleItems,
            message: hasEligibleItems
                ? 'Some items in your order are eligible for return.'
                : 'Unfortunately, no items in this order are eligible for return.',
            orderDetails: mockOrder,
        };
    } catch (error) {
        console.error('Return eligibility check error:', error);
        return {
            eligible: false,
            message: 'Unable to check eligibility. Please try again or contact support.',
        };
    }
}

// Shipping calculator schema
const shippingCalculatorSchema = z.object({
    country: z.string().min(1, 'Please select a country'),
    postalCode: z.string().optional(),
});

export type ShippingCalculatorData = z.infer<typeof shippingCalculatorSchema>;

export interface ShippingEstimate {
    success: boolean;
    message?: string;
    options?: Array<{
        method: string;
        timeframe: string;
        cost: string;
        features?: string[];
    }>;
}

/**
 * Calculate shipping estimate
 */
export async function calculateShipping(
    data: ShippingCalculatorData
): Promise<ShippingEstimate> {
    try {
        const result = shippingCalculatorSchema.safeParse(data);

        if (!result.success) {
            return {
                success: false,
                message: 'Please select a country.',
            };
        }

        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock shipping rates by region
        const country = data.country.toLowerCase();

        if (country === 'us' || country === 'united states') {
            return {
                success: true,
                options: [
                    { method: 'Standard', timeframe: '5-7 business days', cost: 'Free over $99', features: ['Full tracking'] },
                    { method: 'Express', timeframe: '2-3 business days', cost: '$14.99', features: ['Priority handling'] },
                    { method: 'Priority', timeframe: '1-2 business days', cost: '$24.99', features: ['SMS updates', 'Signature required'] },
                ],
            };
        }

        if (country === 'ca' || country === 'canada') {
            return {
                success: true,
                options: [
                    { method: 'Standard', timeframe: '7-10 business days', cost: '$14.99', features: ['Full tracking'] },
                    { method: 'Express', timeframe: '4-6 business days', cost: '$29.99', features: ['Priority handling'] },
                ],
            };
        }

        // Default international
        return {
            success: true,
            options: [
                { method: 'International Standard', timeframe: '10-21 business days', cost: 'From $24.99', features: ['Full tracking'] },
                { method: 'International Express', timeframe: '5-10 business days', cost: 'From $49.99', features: ['Priority handling'] },
            ],
        };
    } catch (error) {
        console.error('Shipping calculator error:', error);
        return {
            success: false,
            message: 'Unable to calculate shipping. Please try again.',
        };
    }
}

// FAQ feedback
export interface FAQFeedback {
    faqId: string;
    helpful: boolean;
}

/**
 * Submit FAQ feedback (was this helpful?)
 */
export async function submitFAQFeedback(feedback: FAQFeedback): Promise<{ success: boolean }> {
    try {
        // TODO: Save feedback to database
        console.log('FAQ Feedback:', feedback);
        await new Promise((resolve) => setTimeout(resolve, 200));

        return { success: true };
    } catch (error) {
        console.error('FAQ feedback error:', error);
        return { success: false };
    }
}
