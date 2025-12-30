'use client';

import React, { useState, useEffect, createContext, useContext, useCallback, ReactNode, useRef } from 'react';
import { gsap } from 'gsap';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Toast Types
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => string;
    removeToast: (id: string) => void;
    updateToast: (id: string, toast: Partial<Toast>) => void;

    // Convenience methods
    success: (title: string, message?: string) => string;
    error: (title: string, message?: string) => string;
    warning: (title: string, message?: string) => string;
    info: (title: string, message?: string) => string;
    loading: (title: string, message?: string) => string;
}

const ToastContext = createContext<ToastContextType | null>(null);

// Generate unique ID
let toastCounter = 0;
const generateId = () => `toast-${++toastCounter}-${Date.now()}`;

// Toast Provider
export function AIVisionToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((toast: Omit<Toast, 'id'>): string => {
        const id = generateId();
        const newToast: Toast = {
            id,
            duration: toast.type === 'loading' ? 0 : 5000, // Loading toasts don't auto-dismiss
            ...toast,
        };

        setToasts(prev => [...prev, newToast]);
        return id;
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const updateToast = useCallback((id: string, updates: Partial<Toast>) => {
        setToasts(prev => prev.map(t =>
            t.id === id ? { ...t, ...updates } : t
        ));
    }, []);

    // Convenience methods
    const success = useCallback((title: string, message?: string) =>
        addToast({ type: 'success', title, message }), [addToast]);

    const error = useCallback((title: string, message?: string) =>
        addToast({ type: 'error', title, message, duration: 8000 }), [addToast]);

    const warning = useCallback((title: string, message?: string) =>
        addToast({ type: 'warning', title, message }), [addToast]);

    const info = useCallback((title: string, message?: string) =>
        addToast({ type: 'info', title, message }), [addToast]);

    const loading = useCallback((title: string, message?: string) =>
        addToast({ type: 'loading', title, message }), [addToast]);

    const value: ToastContextType = {
        toasts,
        addToast,
        removeToast,
        updateToast,
        success,
        error,
        warning,
        info,
        loading,
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

// Hook to use toast
export function useAIVisionToast(): ToastContextType {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useAIVisionToast must be used within AIVisionToastProvider');
    }
    return context;
}

// Toast Container Component
function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
    return (
        <div
            className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-md w-full pointer-events-none"
            role="region"
            aria-label="Notifications"
            aria-live="polite"
        >
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
            ))}
        </div>
    );
}

// Individual Toast Item
function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
    const toastRef = useRef<HTMLDivElement>(null);

    // Auto-dismiss
    useEffect(() => {
        if (toast.duration && toast.duration > 0) {
            const timer = setTimeout(onDismiss, toast.duration);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [toast.duration, onDismiss]);

    // Animate in
    useEffect(() => {
        if (toastRef.current) {
            gsap.fromTo(
                toastRef.current,
                { x: 100, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
            );
        }
    }, []);

    const handleDismiss = () => {
        if (toastRef.current) {
            gsap.to(toastRef.current, {
                x: 100,
                opacity: 0,
                duration: 0.2,
                ease: 'power2.in',
                onComplete: onDismiss,
            });
        } else {
            onDismiss();
        }
    };

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
        error: <AlertCircle className="w-5 h-5 text-red-400" />,
        warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
        info: <Info className="w-5 h-5 text-blue-400" />,
        loading: <Loader2 className="w-5 h-5 text-[var(--av-gold)] animate-spin" />,
    };

    const colors = {
        success: 'border-emerald-500/30 bg-emerald-500/5',
        error: 'border-red-500/30 bg-red-500/5',
        warning: 'border-amber-500/30 bg-amber-500/5',
        info: 'border-blue-500/30 bg-blue-500/5',
        loading: 'border-[var(--av-gold)]/30 bg-[var(--av-gold)]/5',
    };

    return (
        <div
            ref={toastRef}
            role="alert"
            className={cn(
                'pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl',
                'bg-[#0A0A0A]/95',
                colors[toast.type]
            )}
        >
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
                {icons[toast.type]}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-[var(--av-pearl)] text-sm">
                    {toast.title}
                </p>
                {toast.message && (
                    <p className="text-[var(--av-silver)] text-xs mt-1 leading-relaxed">
                        {toast.message}
                    </p>
                )}
                {toast.action && (
                    <button
                        onClick={toast.action.onClick}
                        className="mt-2 text-xs font-semibold text-[var(--av-gold)] hover:text-[var(--av-pearl)] transition-colors"
                    >
                        {toast.action.label}
                    </button>
                )}
            </div>

            {/* Dismiss Button (not for loading) */}
            {toast.type !== 'loading' && (
                <button
                    onClick={handleDismiss}
                    className="flex-shrink-0 p-1 text-[var(--av-ash)] hover:text-[var(--av-pearl)] transition-colors rounded-lg hover:bg-white/5"
                    aria-label="Dismiss notification"
                >
                    <X size={16} />
                </button>
            )}
        </div>
    );
}
