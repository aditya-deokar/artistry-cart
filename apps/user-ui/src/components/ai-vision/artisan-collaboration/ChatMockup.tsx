'use client';

import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { cn } from '@/lib/utils';
import { MoreHorizontal, Paperclip, Send, Smile, Image as ImageIcon, Sparkles } from 'lucide-react';

interface ChatMessage {
    id: number;
    sender: 'me' | 'artisan';
    text?: string;
    type?: 'text' | 'image' | 'file';
    src?: string;
    fileName?: string;
    time: string;
    avatar?: string;
}

export function ChatMockup() {
    const containerRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const sendButtonRef = useRef<HTMLButtonElement>(null);

    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 1,
            sender: 'me',
            text: "Hi! I love your portfolio. I have a concept for a sculpted coffee table.",
            time: '10:23 AM',
        },
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const [showSmartReplies, setShowSmartReplies] = useState(false);

    // Auto-play Scenario
    useGSAP(() => {
        const tl = gsap.timeline({ delay: 1 });

        // 1. Initial State: Message 1 is there.

        // 2. User simulates "uploading" an image
        tl.add(() => {
            // Simulate file attach interaction
            gsap.to('.attach-btn', { scale: 0.8, duration: 0.1, yoyo: true, repeat: 1 });
        }, "+=1");

        tl.add(() => {
            setMessages(prev => [...prev, {
                id: 2,
                sender: 'me',
                type: 'image',
                src: '/placeholder-concept.jpg',
                time: '10:24 AM',
            }]);
        }, "+=0.5");

        // 3. Waiting for reply (Typing indicator)
        tl.add(() => setIsTyping(true), "+=1");

        // 4. Artisan Reply
        tl.add(() => {
            setIsTyping(false);
            setMessages(prev => [...prev, {
                id: 3,
                sender: 'artisan',
                text: "This is stunning! I love the organic flow. Is this walnut or dark oak?",
                time: '10:30 AM',
                avatar: '🗿'
            }]);
            setShowSmartReplies(true);
        }, "+=2.5");

        // 5. Smart Reply interaction
        tl.add(() => {
            // Simulate hovering/clicking a smart reply
            const replyBtn = document.querySelector('.smart-reply-1');
            if (replyBtn) {
                gsap.to(replyBtn, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 });
            }
        }, "+=1.5");

        tl.add(() => {
            setShowSmartReplies(false);
            setMessages(prev => [...prev, {
                id: 4,
                sender: 'me',
                text: "I was thinking Walnut for the warmth.",
                time: '10:31 AM',
            }]);
        }, "+=0.5");

        // 6. Confirmed
        tl.add(() => setIsTyping(true), "+=1");
        tl.add(() => {
            setIsTyping(false);
            setMessages(prev => [...prev, {
                id: 5,
                sender: 'artisan',
                text: "Walnut is a perfect choice. I have a slab that matches this curve exactly. Let me prep a quote.",
                time: '10:32 AM',
                avatar: '🗿'
            }]);
        }, "+=2");

    }, { scope: containerRef });

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            gsap.to(scrollRef.current, {
                scrollTop: scrollRef.current.scrollHeight,
                duration: 0.5,
                ease: 'power2.out'
            });
        }
    }, [messages, isTyping]);

    // Message Animations using Flip-like logic (manual)
    useGSAP(() => {
        const lastMsg = messagesContainerRef.current?.lastElementChild;
        if (lastMsg) {
            gsap.fromTo(lastMsg,
                { opacity: 0, y: 20, scale: 0.9, rotationX: -10 },
                { opacity: 1, y: 0, scale: 1, rotationX: 0, duration: 0.6, ease: 'elastic.out(1, 0.75)' }
            );
        }
    }, { scope: messagesContainerRef, dependencies: [messages] });

    // Typing Indicator Animation
    useGSAP(() => {
        if (isTyping) {
            gsap.fromTo('.typing-dot',
                { y: 0, opacity: 0.5 },
                { y: -3, opacity: 1, duration: 0.4, stagger: 0.1, yoyo: true, repeat: -1, ease: 'power1.inOut' }
            );
        }
    }, { scope: containerRef, dependencies: [isTyping] });

    return (
        <div ref={containerRef} className="w-full h-full bg-[#090909] flex flex-col relative overflow-hidden group">
            {/* Ambient Glows */}
            <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-[var(--av-gold)]/5 rounded-full blur-[80px] pointer-events-none" />

            {/* Header */}
            <div className="h-16 border-b border-white/5 bg-[#111]/50 backdrop-blur-md flex items-center justify-between px-6 z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="relative group/avatar cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--av-gold)]/20 to-[#111] border border-[var(--av-gold)]/30 p-0.5 transition-transform duration-300 group-hover/avatar:scale-105">
                            <div className="w-full h-full rounded-full bg-[#151515] flex items-center justify-center overflow-hidden">
                                <span className="text-lg select-none">🗿</span>
                            </div>
                        </div>
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#111] shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
                    </div>
                    <div>
                        <h4 className="font-bold text-[var(--av-pearl)] text-sm leading-tight">Woodland Crafts</h4>
                        <p className="text-[10px] text-[var(--av-silver)] font-medium tracking-wide">
                            Active now • <span className="text-emerald-400">Typically replies in 5m</span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 text-[var(--av-silver)] hover:text-white hover:bg-white/5 rounded-full transition-colors">
                        <MoreHorizontal size={18} />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 scroll-smooth"
            >
                <div ref={messagesContainerRef} className="flex flex-col gap-2">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex gap-3 max-w-[80%]",
                                msg.sender === 'me' ? "self-end flex-row-reverse" : "self-start"
                            )}
                        >
                            {/* Avatar for artisan */}
                            {msg.sender === 'artisan' && (
                                <div className="w-6 h-6 rounded-full bg-[var(--av-gold)]/10 flex items-center justify-center shrink-0 border border-white/5 mt-auto mb-2 text-[10px]">
                                    {msg.avatar}
                                </div>
                            )}

                            <div className="group/msg relative">
                                {/* Name check for Artisan */}
                                {msg.sender === 'artisan' && (
                                    <span className="text-[10px] text-[var(--av-silver)] ml-1 mb-1 block opacity-50">
                                        Woodland Crafts
                                    </span>
                                )}

                                <div
                                    className={cn(
                                        "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md",
                                        msg.sender === 'me'
                                            ? "bg-gradient-to-br from-[var(--av-gold)] to-[#b58b32] text-black font-medium rounded-br-none shadow-[var(--av-gold)]/5"
                                            : "bg-[#1A1A1A] border border-white/5 text-[var(--av-pearl)] rounded-bl-none hover:border-white/10"
                                    )}
                                >
                                    {msg.type === 'image' ? (
                                        <div className="relative group/img cursor-pointer overflow-hidden rounded-lg">
                                            <div className="w-48 h-32 bg-black/40 flex items-center justify-center">
                                                <ImageIcon className="text-white/20 group-hover/img:text-white/40 transition-colors" size={32} />
                                            </div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end p-2">
                                                <span className="text-[10px] text-white font-medium">View Concept</span>
                                            </div>
                                        </div>
                                    ) : (
                                        msg.text
                                    )}
                                </div>

                                {/* Timestamp outside */}
                                <span className={cn(
                                    "absolute bottom-0 text-[9px] text-[var(--av-silver)] opacity-0 group-hover/msg:opacity-60 transition-opacity whitespace-nowrap",
                                    msg.sender === 'me' ? "right-full mr-2" : "left-full ml-2"
                                )}>
                                    {msg.time}
                                </span>
                            </div>
                        </div>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                        <div className="self-start flex gap-3 typing-indicator max-w-[80%]">
                            <div className="w-6 h-6 rounded-full bg-[var(--av-gold)]/10 flex items-center justify-center shrink-0 border border-white/5 mt-auto mb-2 text-[10px]">
                                🗿
                            </div>
                            <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl rounded-bl-none px-4 py-3 h-[44px] flex items-center gap-1.5 shadow-sm">
                                <div className="typing-dot w-1.5 h-1.5 bg-[var(--av-silver)] rounded-full" />
                                <div className="typing-dot w-1.5 h-1.5 bg-[var(--av-silver)] rounded-full" />
                                <div className="typing-dot w-1.5 h-1.5 bg-[var(--av-silver)] rounded-full" />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Smart Replies (Macro Interaction) */}
            <div className={cn(
                "px-6 pb-2 flex gap-2 overflow-hidden transition-all duration-500 ease-in-out",
                showSmartReplies ? "max-h-12 opacity-100 translate-y-0" : "max-h-0 opacity-0 translate-y-4"
            )}>
                <button className="smart-reply-1 px-3 py-1.5 bg-[var(--av-gold)]/10 border border-[var(--av-gold)]/20 rounded-full text-[10px] text-[var(--av-gold)] hover:bg-[var(--av-gold)]/20 transition-colors cursor-pointer flex items-center gap-1">
                    <Sparkles size={10} /> Walnut for warmth
                </button>
                <button className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] text-[var(--av-silver)] hover:bg-white/10 transition-colors cursor-pointer">
                    I prefer Oak
                </button>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#111]/80 backdrop-blur-md border-t border-white/5 relative z-20">
                <div className="flex items-center gap-3 bg-[#0A0A0A] border border-white/5 rounded-full p-1 pl-4 shadow-lg focus-within:border-[var(--av-gold)]/30 focus-within:shadow-[var(--av-gold)]/5 transition-all duration-300">
                    <button className="attach-btn text-[var(--av-silver)] hover:text-white transition-colors p-1.5 hover:bg-white/5 rounded-full">
                        <Paperclip size={18} />
                    </button>

                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Message Woodland Crafts..."
                        className="flex-1 bg-transparent text-sm text-[var(--av-pearl)] focus:outline-none placeholder:text-white/20 py-2.5"
                        disabled
                    />

                    <button className="hover:text-[var(--av-gold)] text-[var(--av-silver)] p-1.5 transition-colors">
                        <Smile size={18} />
                    </button>

                    <button
                        ref={sendButtonRef}
                        className="w-9 h-9 rounded-full bg-gradient-to-r from-[var(--av-gold)] to-[var(--av-gold-dark)] flex items-center justify-center text-[#0A0A0A] shadow-lg hover:shadow-[var(--av-gold)]/20 hover:scale-105 active:scale-95 transition-all duration-200"
                    >
                        <Send size={16} className="ml-0.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
