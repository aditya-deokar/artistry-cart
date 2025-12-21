'use client';

import { Leaf, Clock, HeartHandshake, AlertTriangle } from 'lucide-react';

const notes = [
    {
        icon: Clock,
        title: 'Handmade Preparation Time',
        description: 'Handcrafted items may require additional preparation time as artisans carefully create your piece. Custom orders typically take 1-3 weeks before shipping.',
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
    },
    {
        icon: Leaf,
        title: 'Sustainable Packaging',
        description: 'We use eco-friendly, recyclable packaging materials. Your order arrives beautifully wrapped in materials that honor both the craft and our planet.',
        color: 'text-green-500',
        bg: 'bg-green-500/10',
    },
    {
        icon: HeartHandshake,
        title: 'Artisan Direct',
        description: 'Some orders ship directly from artisan workshops worldwide. This may affect delivery times but ensures freshly crafted, authentic pieces.',
        color: 'text-purple-500',
        bg: 'bg-purple-500/10',
    },
    {
        icon: AlertTriangle,
        title: 'Peak Season Notice',
        description: 'During holidays and peak seasons, shipping times may be extended. We recommend ordering early for time-sensitive gifts.',
        color: 'text-amber-500',
        bg: 'bg-amber-500/10',
    },
];

interface SpecialNotesProps {
    className?: string;
}

export function SpecialNotes({ className = '' }: SpecialNotesProps) {
    return (
        <div className={`${className}`}>
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-6">
                Things to Know
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
                {notes.map((note) => {
                    const Icon = note.icon;
                    return (
                        <div
                            key={note.title}
                            className="flex gap-4 p-5 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)]"
                        >
                            <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full ${note.bg}`}>
                                <Icon className={`w-5 h-5 ${note.color}`} />
                            </div>
                            <div>
                                <h3 className="font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-1">
                                    {note.title}
                                </h3>
                                <p className="text-sm text-[var(--ac-stone)] leading-relaxed">
                                    {note.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
