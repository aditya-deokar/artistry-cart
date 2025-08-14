'use client';
import { useState, useEffect } from 'react';
const calculateTimeLeft = (endingDate: string) => {
    const difference = +new Date(endingDate) - +new Date();
    let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    if (difference > 0) {
        timeLeft = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
        };
    }
    return timeLeft;
};
export const EventCountdown: React.FC<{ endingDate: string }> = ({ endingDate }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endingDate));
    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft(endingDate));
        }, 1000);
        return () => clearTimeout(timer);
    });

    const timerComponents = Object.entries(timeLeft).map(([interval, value]) => (
        <div key={interval} className="flex flex-col items-center">
            <span className="text-xl md:text-2xl font-semibold">{value.toString().padStart(2, '0')}</span>
            <span className="text-xs uppercase tracking-wider">{interval}</span>
        </div>
    ));

    return (
        <div className="text-center bg-accent border border-accent  rounded-lg p-6 mb-8">
            <h3 className="font-display text-xl mb-4">Limited Time Event!</h3>
            <div className="flex justify-center gap-4 md:gap-8">
                {timerComponents}
            </div>
        </div>
    );
};