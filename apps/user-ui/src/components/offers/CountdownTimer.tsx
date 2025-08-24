'use client';

import { useState, useEffect } from 'react';

const calculateTimeLeft = (endingDate: string) => {
    const difference = +new Date(endingDate) - +new Date();
    if (difference <= 0) return null;
    return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
    };
};

export const CountdownTimer: React.FC<{ endDate: string, className?: string }> = ({ endDate, className }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endDate));

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft(endDate));
        }, 60000); // Update every minute
        return () => clearInterval(timer);
    }, [endDate]);

    if (!timeLeft) return <span className={className}>Offer expired</span>;

    const { days, hours, minutes } = timeLeft;

    return (
        <span className={className}>
            {days > 0 && `${days}d `}
            {hours > 0 && `${hours}h `}
            {`${minutes}m left`}
        </span>
    );
};