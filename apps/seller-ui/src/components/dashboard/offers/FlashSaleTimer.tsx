// components/dashboard/offers/FlashSaleTimer.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Zap, Clock, Fire } from 'lucide-react';

interface FlashSaleTimerProps {
  endTime: string | Date;
  title?: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  showMilliseconds?: boolean;
  onComplete?: () => void;
  className?: string;
  theme?: 'default' | 'fire' | 'electric' | 'minimal';
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
}

export default function FlashSaleTimer({
  endTime,
  title = "Flash Sale Ends In",
  subtitle,
  size = 'md',
  showMilliseconds = false,
  onComplete,
  className,
  theme = 'default'
}: FlashSaleTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ 
    days: 0, 
    hours: 0, 
    minutes: 0, 
    seconds: 0, 
    milliseconds: 0 
  });
  const [isActive, setIsActive] = useState(true);

  const calculateTimeLeft = (): TimeLeft => {
    const now = new Date().getTime();
    const target = new Date(endTime).getTime();
    const difference = target - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
      milliseconds: Math.floor((difference % 1000) / 10) // Show in centiseconds for smoother animation
    };
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      // Check if countdown is complete
      if (newTimeLeft.days === 0 && 
          newTimeLeft.hours === 0 && 
          newTimeLeft.minutes === 0 && 
          newTimeLeft.seconds === 0) {
        setIsActive(false);
        onComplete?.();
        clearInterval(timer);
      }
    }, showMilliseconds ? 10 : 1000); // Update every 10ms if showing milliseconds

    return () => clearInterval(timer);
  }, [endTime, showMilliseconds, onComplete]);

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return {
          container: 'p-4',
          title: 'text-lg',
          subtitle: 'text-sm',
          number: 'text-2xl',
          label: 'text-xs',
          gap: 'gap-2'
        };
      case 'lg':
        return {
          container: 'p-8',
          title: 'text-3xl',
          subtitle: 'text-lg',
          number: 'text-5xl',
          label: 'text-sm',
          gap: 'gap-6'
        };
      default: // md
        return {
          container: 'p-6',
          title: 'text-2xl',
          subtitle: 'text-base',
          number: 'text-4xl',
          label: 'text-xs',
          gap: 'gap-4'
        };
    }
  };

  const getThemeClasses = (theme: string) => {
    switch (theme) {
      case 'fire':
        return {
          background: 'bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500',
          text: 'text-white',
          card: 'bg-white/20 backdrop-blur-sm border-white/30',
          accent: 'text-yellow-200',
          icon: Fire
        };
      case 'electric':
        return {
          background: 'bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500',
          text: 'text-white',
          card: 'bg-white/20 backdrop-blur-sm border-white/30',
          accent: 'text-cyan-200',
          icon: Zap
        };
      case 'minimal':
        return {
          background: 'bg-gray-100 dark:bg-gray-800',
          text: 'text-gray-900 dark:text-gray-100',
          card: 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600',
          accent: 'text-gray-600 dark:text-gray-400',
          icon: Clock
        };
      default:
        return {
          background: 'bg-gradient-to-r from-blue-500 to-purple-600',
          text: 'text-white',
          card: 'bg-white/20 backdrop-blur-sm border-white/30',
          accent: 'text-blue-200',
          icon: Zap
        };
    }
  };

  const sizeClasses = getSizeClasses(size);
  const themeClasses = getThemeClasses(theme);
  const ThemeIcon = themeClasses.icon;

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  const TimeUnit = ({ value, label, showMs = false }: { value: number; label: string; showMs?: boolean }) => (
    <div className={cn("flex flex-col items-center", sizeClasses.gap)}>
      <Card className={cn("relative overflow-hidden", themeClasses.card)}>
        <CardContent className="p-3 text-center min-w-[60px]">
          <div className={cn("font-bold font-mono", sizeClasses.number, themeClasses.text)}>
            {formatNumber(value)}
            {showMs && showMilliseconds && (
              <span className="text-sm opacity-75">
                .{formatNumber(timeLeft.milliseconds)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
      <span className={cn("font-medium uppercase tracking-wider", sizeClasses.label, themeClasses.accent)}>
        {label}
      </span>
    </div>
  );

  if (!isActive) {
    return (
      <Card className={cn("text-center", themeClasses.background, className)}>
        <CardContent className={sizeClasses.container}>
          <div className={cn("flex items-center justify-center mb-4", sizeClasses.gap)}>
            <ThemeIcon className={cn("animate-pulse", sizeClasses.title === 'text-3xl' ? 'h-8 w-8' : 'h-6 w-6')} />
            <h2 className={cn("font-bold", sizeClasses.title, themeClasses.text)}>
              Flash Sale Ended!
            </h2>
          </div>
          <p className={cn(sizeClasses.subtitle, themeClasses.accent)}>
            Thanks for your interest. Check out our other amazing offers!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("text-center relative overflow-hidden", themeClasses.background, className)}>
      {/* Background Animation */}
      {theme === 'fire' && (
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-orange-500/20 to-yellow-500/20 animate-pulse"></div>
      )}
      {theme === 'electric' && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-700/20 via-blue-600/20 to-cyan-500/20 animate-pulse"></div>
      )}

      <CardContent className={cn("relative z-10", sizeClasses.container)}>
        {/* Header */}
        <div className={cn("flex items-center justify-center mb-6", sizeClasses.gap)}>
          <ThemeIcon className={cn("animate-bounce", sizeClasses.title === 'text-3xl' ? 'h-8 w-8' : 'h-6 w-6', themeClasses.text)} />
          <h2 className={cn("font-bold", sizeClasses.title, themeClasses.text)}>
            {title}
          </h2>
        </div>

        {subtitle && (
          <p className={cn("mb-6", sizeClasses.subtitle, themeClasses.accent)}>
            {subtitle}
          </p>
        )}

        {/* Countdown Display */}
        <div className={cn("flex items-center justify-center", sizeClasses.gap)}>
          {timeLeft.days > 0 && (
            <>
              <TimeUnit value={timeLeft.days} label="Days" />
              <div className={cn("text-2xl font-bold", themeClasses.text)}>:</div>
            </>
          )}
          
          <TimeUnit value={timeLeft.hours} label="Hours" />
          <div className={cn("text-2xl font-bold", themeClasses.text)}>:</div>
          
          <TimeUnit value={timeLeft.minutes} label="Minutes" />
          <div className={cn("text-2xl font-bold", themeClasses.text)}>:</div>
          
          <TimeUnit value={timeLeft.seconds} label="Seconds" showMs />
        </div>

        {/* Urgency Indicators */}
        {timeLeft.days === 0 && timeLeft.hours < 1 && (
          <div className="mt-6">
            <Badge variant="destructive" className="animate-pulse text-sm font-semibold px-4 py-2">
              <Clock className="h-4 w-4 mr-2" />
              HURRY! LESS THAN 1 HOUR LEFT!
            </Badge>
          </div>
        )}
        
        {timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes < 10 && (
          <div className="mt-4">
            <Badge variant="destructive" className="animate-pulse text-lg font-bold px-6 py-3">
              <Fire className="h-5 w-5 mr-2" />
              FINAL MINUTES!
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
