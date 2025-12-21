'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import Image from 'next/image';

gsap.registerPlugin(useGSAP);

// Example prompts and corresponding images
const DEMO_SEQUENCES = [
    {
        prompt: "Elegant golden necklace with sapphire pendant",
        image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop&q=80",
    },
    {
        prompt: "Hand-carved wooden sculpture",
        image: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=400&h=400&fit=crop&q=80",
    },
    {
        prompt: "Minimalist ceramic vase",
        image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&h=400&fit=crop&q=80",
    },
];

// Particle class for canvas animation
class Particle {
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    originX: number;
    originY: number;
    size: number;
    color: string;
    alpha: number;
    velocity: { x: number; y: number };
    state: 'scatter' | 'forming' | 'holding' | 'dispersing';

    constructor(canvasWidth: number, canvasHeight: number) {
        this.originX = canvasWidth / 2;
        this.originY = canvasHeight / 2;
        this.x = this.originX + (Math.random() - 0.5) * 50;
        this.y = this.originY + (Math.random() - 0.5) * 50;
        this.targetX = this.x;
        this.targetY = this.y;
        this.size = Math.random() * 3 + 1;
        this.color = ['#D4A84B', '#C9943C', '#B8860B', '#FFD700'][Math.floor(Math.random() * 4)];
        this.alpha = Math.random() * 0.5 + 0.5;
        this.velocity = {
            x: (Math.random() - 0.5) * 4,
            y: (Math.random() - 0.5) * 4,
        };
        this.state = 'scatter';
    }

    update(mouseX: number, mouseY: number, canvasWidth: number, canvasHeight: number) {
        switch (this.state) {
            case 'scatter':
                this.x += this.velocity.x;
                this.y += this.velocity.y;
                // Bounce off edges
                if (this.x < 0 || this.x > canvasWidth) this.velocity.x *= -0.8;
                if (this.y < 0 || this.y > canvasHeight) this.velocity.y *= -0.8;
                // Add friction
                this.velocity.x *= 0.99;
                this.velocity.y *= 0.99;
                break;

            case 'forming':
                const dx = this.targetX - this.x;
                const dy = this.targetY - this.y;
                this.x += dx * 0.08;
                this.y += dy * 0.08;
                break;

            case 'holding':
                // Subtle floating motion
                this.x += Math.sin(Date.now() * 0.002 + this.originX) * 0.3;
                this.y += Math.cos(Date.now() * 0.002 + this.originY) * 0.3;
                break;

            case 'dispersing':
                this.x += this.velocity.x * 2;
                this.y += this.velocity.y * 2;
                this.alpha *= 0.95;
                break;
        }

        // Mouse interaction
        if (mouseX && mouseY) {
            const distX = this.x - mouseX;
            const distY = this.y - mouseY;
            const dist = Math.sqrt(distX * distX + distY * distY);
            if (dist < 80) {
                const force = (80 - dist) / 80;
                this.x += (distX / dist) * force * 3;
                this.y += (distY / dist) * force * 3;
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
    }
}

interface AIVisionVisualProps {
    className?: string;
}

export function AIVisionVisual({ className = '' }: AIVisionVisualProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const promptRef = useRef<HTMLDivElement>(null);
    const productRef = useRef<HTMLDivElement>(null);
    const statusRef = useRef<HTMLDivElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const animationFrameRef = useRef<number>();
    const mouseRef = useRef({ x: 0, y: 0 });

    const [currentIndex, setCurrentIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const [phase, setPhase] = useState<'prompt' | 'generating' | 'forming' | 'reveal'>('prompt');

    // Initialize particles
    const initParticles = useCallback((width: number, height: number) => {
        const particles: Particle[] = [];
        const count = Math.min(150, Math.floor((width * height) / 2000));
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(width, height));
        }
        particlesRef.current = particles;
    }, []);

    // Set particle targets to form a square/rectangle shape
    const setFormationTargets = useCallback((width: number, height: number) => {
        const centerX = width / 2;
        const centerY = height / 2;
        const size = Math.min(width, height) * 0.35;

        particlesRef.current.forEach((particle, i) => {
            // Distribute particles along square perimeter
            const perimeter = size * 4;
            const position = (i / particlesRef.current.length) * perimeter;
            let targetX, targetY;

            if (position < size) {
                // Top edge
                targetX = centerX - size / 2 + position;
                targetY = centerY - size / 2;
            } else if (position < size * 2) {
                // Right edge
                targetX = centerX + size / 2;
                targetY = centerY - size / 2 + (position - size);
            } else if (position < size * 3) {
                // Bottom edge
                targetX = centerX + size / 2 - (position - size * 2);
                targetY = centerY + size / 2;
            } else {
                // Left edge
                targetX = centerX - size / 2;
                targetY = centerY + size / 2 - (position - size * 3);
            }

            // Add some randomness
            particle.targetX = targetX + (Math.random() - 0.5) * 20;
            particle.targetY = targetY + (Math.random() - 0.5) * 20;
            particle.state = 'forming';
        });
    }, []);

    // Scatter particles
    const scatterParticles = useCallback(() => {
        particlesRef.current.forEach((particle) => {
            particle.velocity = {
                x: (Math.random() - 0.5) * 8,
                y: (Math.random() - 0.5) * 8,
            };
            particle.state = 'scatter';
            particle.alpha = Math.random() * 0.5 + 0.5;
        });
    }, []);

    // Canvas animation loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resizeCanvas = () => {
            const container = containerRef.current;
            if (!container) return;
            const rect = container.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            initParticles(canvas.width, canvas.height);
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particlesRef.current.forEach((particle) => {
                particle.update(mouseRef.current.x, mouseRef.current.y, canvas.width, canvas.height);
                particle.draw(ctx);
            });

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [initParticles]);

    // Mouse tracking
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        mouseRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }, []);

    const handleMouseLeave = useCallback(() => {
        mouseRef.current = { x: 0, y: 0 };
    }, []);

    // Text scramble effect
    const scrambleText = useCallback((targetText: string, duration: number = 1000) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        const iterations = 15;
        let frame = 0;
        const finalLength = targetText.length;

        const interval = setInterval(() => {
            const progress = frame / iterations;
            const revealIndex = Math.floor(progress * finalLength);

            let result = '';
            for (let i = 0; i < finalLength; i++) {
                if (i < revealIndex) {
                    result += targetText[i];
                } else if (i < revealIndex + 3) {
                    result += chars[Math.floor(Math.random() * chars.length)];
                } else {
                    result += ' ';
                }
            }

            setDisplayedText(result);
            frame++;

            if (frame > iterations) {
                clearInterval(interval);
                setDisplayedText(targetText);
            }
        }, duration / iterations);

        return () => clearInterval(interval);
    }, []);

    // Main animation sequence using useGSAP
    useGSAP(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const runSequence = () => {
            const sequence = DEMO_SEQUENCES[currentIndex];
            const tl = gsap.timeline({
                onComplete: () => {
                    const nextIndex = (currentIndex + 1) % DEMO_SEQUENCES.length;
                    setCurrentIndex(nextIndex);
                },
            });

            // Phase 1: Prompt appears
            tl.call(() => {
                setPhase('prompt');
                scrambleText(sequence.prompt, 800);
                scatterParticles();
            });

            tl.to(promptRef.current, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: 'power2.out',
            });

            // Phase 2: Generating state
            tl.call(() => {
                setPhase('generating');
            }, [], '+=0.8');

            tl.to(statusRef.current, {
                opacity: 1,
                duration: 0.3,
            });

            // Phase 3: Particles form shape
            tl.call(() => {
                setPhase('forming');
                setFormationTargets(canvas.width, canvas.height);
            }, [], '+=0.5');

            // Phase 4: Product reveals
            tl.call(() => {
                setPhase('reveal');
                particlesRef.current.forEach(p => p.state = 'holding');
            }, [], '+=1');

            tl.to(productRef.current, {
                opacity: 1,
                scale: 1,
                clipPath: 'inset(0% round 16px)',
                duration: 0.8,
                ease: 'power3.out',
            });

            // Hold and glow
            tl.to(productRef.current, {
                boxShadow: '0 0 60px rgba(212, 168, 75, 0.6)',
                duration: 0.5,
                ease: 'power2.inOut',
                yoyo: true,
                repeat: 1,
            });

            // Fade out
            tl.to([promptRef.current, statusRef.current, productRef.current], {
                opacity: 0,
                duration: 0.5,
                ease: 'power2.in',
            }, '+=1');

            tl.set(productRef.current, {
                scale: 0.8,
                clipPath: 'inset(50% round 16px)',
            });

            tl.set(promptRef.current, { y: 10 });
        };

        runSequence();
    }, { dependencies: [currentIndex], scope: containerRef });

    const currentSequence = DEMO_SEQUENCES[currentIndex];

    return (
        <div
            ref={containerRef}
            className={`relative aspect-square max-w-lg mx-auto ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* Outer decorative frame */}
            <div className="absolute inset-0 rounded-2xl border border-[var(--ac-gold)]/20">
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-[var(--ac-gold)]/40 rounded-tl-2xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-[var(--ac-gold)]/40 rounded-tr-2xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-[var(--ac-gold)]/40 rounded-bl-2xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-[var(--ac-gold)]/40 rounded-br-2xl" />
            </div>

            {/* Inner container */}
            <div className="absolute inset-6 rounded-xl bg-gradient-to-br from-[var(--ac-slate)]/80 to-[var(--ac-onyx)] border border-[var(--ac-slate)] overflow-hidden">
                {/* Particle Canvas */}
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full"
                />

                {/* Product Image */}
                <div
                    ref={productRef}
                    className="absolute inset-0 flex items-center justify-center opacity-0"
                    style={{
                        clipPath: 'inset(50% round 16px)',
                        transform: 'scale(0.8)',
                    }}
                >
                    <div className="relative w-4/5 h-4/5 rounded-xl overflow-hidden">
                        <Image
                            src={currentSequence.image}
                            alt="AI Generated Product"
                            fill
                            className="object-cover"
                            sizes="300px"
                        />
                    </div>
                </div>

                {/* Prompt Display */}
                <div
                    ref={promptRef}
                    className="absolute top-6 left-4 right-4 opacity-0"
                    style={{ transform: 'translateY(10px)' }}
                >
                    <div className="px-4 py-2 rounded-lg bg-[var(--ac-obsidian)]/80 backdrop-blur-sm border border-[var(--ac-gold)]/20">
                        <p className="text-xs text-[var(--ac-gold)]/70 mb-1 font-mono">prompt:</p>
                        <p className="text-sm text-[var(--ac-pearl)] font-light leading-snug min-h-[2.5rem]">
                            "{displayedText}"
                        </p>
                    </div>
                </div>

                {/* Status Indicator */}
                <div
                    ref={statusRef}
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0"
                >
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--ac-gold)]/10 border border-[var(--ac-gold)]/30">
                        <div className={`w-2 h-2 rounded-full ${phase === 'reveal'
                            ? 'bg-green-400'
                            : 'bg-[var(--ac-gold)] animate-pulse'
                            }`} />
                        <span className="text-xs text-[var(--ac-gold)] font-medium tracking-wide">
                            {phase === 'prompt' && 'ANALYZING...'}
                            {phase === 'generating' && 'GENERATING...'}
                            {phase === 'forming' && 'CREATING...'}
                            {phase === 'reveal' && 'COMPLETE'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Floating decorative particles */}
            <div className="absolute top-4 right-8 w-2 h-2 rounded-full bg-[var(--ac-gold)] animate-bounce" style={{ animationDelay: '0s', animationDuration: '2s' }} />
            <div className="absolute bottom-12 left-4 w-1 h-1 rounded-full bg-[var(--ac-gold-dark)] animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2.5s' }} />
            <div className="absolute top-1/2 right-4 w-1.5 h-1.5 rounded-full bg-[var(--ac-copper)] animate-bounce" style={{ animationDelay: '1s', animationDuration: '3s' }} />
        </div>
    );
}
