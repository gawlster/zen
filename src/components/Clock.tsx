import { useEffect, useState } from 'react';
import styles from './Clock.module.css';

export default function Clock() {
    const [time, setTime] = useState(getCurrentTime());
    const [date, setDate] = useState(getCurrentDate());

    useEffect(() => {
        const interval = setInterval(() => {
            const newTime = getCurrentTime();
            if (time.includes("PM") && newTime.includes("AM")) {
                setDate(getCurrentDate());
            }
            setTime(newTime);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.wrapper}>
            <div className={styles.date}>
                {date}
            </div>
            <div className={styles.time}>
                {time}
            </div>
        </div>
    );
}

function getCurrentTime(): string {
    const now = new Date();

    let hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12 || 12;

    const paddedMinutes = minutes.toString().padStart(2, '0');
    const paddedSeconds = seconds.toString().padStart(2, '0');

    return `${hours}:${paddedMinutes}:${paddedSeconds} ${ampm}`;
}

function getCurrentDate(): string {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return now.toLocaleDateString('en-US', options);
}
