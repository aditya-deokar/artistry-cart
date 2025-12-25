'use client';

import { useState, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Plus, Minus, HelpCircle } from 'lucide-react';
import { SectionContainer } from '../ui/SectionContainer';
import { cn } from '@/lib/utils';

interface FAQItem {
    question: string;
    answer: string;
    category: string;
}

const faqs: FAQItem[] = [
    // General
    {
        category: 'General',
        question: "How does the AI Vision Studio work?",
        answer: "Our studio uses advanced generative AI models trained on millions of design concepts. It combines text prompts with optional image references to create unique, realistic visualizations of products that can be crafted by artisans."
    },
    {
        category: 'General',
        question: "Is it free to generate concepts?",
        answer: "Yes, you can generate unlimited concepts for free. We believe creativity should be unbound. You only pay when you decide to commission an artisan to build your vision."
    },
    {
        category: 'General',
        question: "Can I use my own sketches?",
        answer: "Absolutely. In Visual Search mode, you can upload sketches, rough drawings, or inspirational photos. The AI will interpret your input and refine it into a polished concept."
    },
    // Commissioning
    {
        category: 'Commissioning',
        question: "How are artisans vetted?",
        answer: "We have a rigorous 5-step vetting process. Artisans must provide portfolio verifyication, business documentation, and pass a quality assessment. Only the top 5% of applicants are accepted."
    },
    {
        category: 'Commissioning',
        question: "What happens if I'm not happy with the result?",
        answer: "Payments are held in escrow. If the final product differs significantly from the agreed concept and specifications, our dispute resolution team mediates. We offer a 'Satisfaction Guarantee' on verified commissions."
    },
    {
        category: 'Commissioning',
        question: "How is pricing determined?",
        answer: "Artisans set their own prices based on materials, labor, and complexity. The AI provides an initial estimate, but the final quote comes directly from the maker after reviewing your concept."
    },
    // Technical
    {
        category: 'Technical',
        question: "What file formats can I download?",
        answer: "You can download concepts in high-resolution PNG, JPG, or WEBP formats. For 3D-compatible concepts, we are rolling out GLB export support soon."
    },
    {
        category: 'Technical',
        question: "Do I own the rights to the AI design?",
        answer: "Yes. Once you generate a design, you grant us a license to display it in our gallery, but you retain full ownership to commission, sell, or manufacture it."
    }
];

export function FAQAccordion() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const containerRef = useRef<HTMLElement>(null);
    const answerRefs = useRef<(HTMLDivElement | null)[]>([]);

    const toggleAccordion = (index: number) => {
        setOpenIndex(prev => prev === index ? null : index);
    };

    useGSAP(() => {
        answerRefs.current.forEach((el, i) => {
            if (!el) return;

            const isOpen = openIndex === i;
            gsap.to(el, {
                height: isOpen ? 'auto' : 0,
                opacity: isOpen ? 1 : 0,
                duration: 0.4,
                ease: 'power3.inOut'
            });
        });

    }, { dependencies: [openIndex], scope: containerRef });

    return (
        <SectionContainer
            ref={containerRef}
            variant="dark"
            maxWidth="lg"
            className="bg-[#0A0A0A] py-24"
        >
            <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full mb-6 border border-white/10">
                    <HelpCircle size={14} className="text-[var(--av-silver)]" />
                    <span className="text-xs font-semibold text-[var(--av-silver)] uppercase tracking-wide">
                        FAQ
                    </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-[var(--av-pearl)] mb-4 font-serif">
                    Common Questions
                </h2>
                <p className="text-[var(--av-silver)]">
                    Everything you need to know about turning dreams into reality.
                </p>
            </div>

            <div className="space-y-4">
                {faqs.map((faq, i) => (
                    <div
                        key={i}
                        className={cn(
                            "bg-[#111] rounded-xl border transition-all duration-300 overflow-hidden",
                            openIndex === i ? "border-[var(--av-gold)]/30 bg-[#161616]" : "border-white/5 hover:border-white/10"
                        )}
                    >
                        <button
                            onClick={() => toggleAccordion(i)}
                            className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                        >
                            <span className={cn(
                                "font-medium text-lg transition-colors",
                                openIndex === i ? "text-[var(--av-gold)]" : "text-[var(--av-pearl)]"
                            )}>
                                {faq.question}
                            </span>
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300",
                                openIndex === i
                                    ? "bg-[var(--av-gold)] border-[var(--av-gold)] text-black rotate-180"
                                    : "bg-white/5 border-white/10 text-[var(--av-silver)] group-hover:bg-white/10"
                            )}>
                                {openIndex === i ? <Minus size={16} /> : <Plus size={16} />}
                            </div>
                        </button>

                        <div
                            ref={el => { answerRefs.current[i] = el }}
                            className="h-0 opacity-0 overflow-hidden"
                        >
                            <div className="p-6 pt-0 text-[var(--av-silver)] leading-relaxed max-w-3xl">
                                {faq.answer}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </SectionContainer>
    );
}
