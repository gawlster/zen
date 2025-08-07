import ConfettiExplosion from "react-confetti-explosion";
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import styles from './Pomodoro.module.css';
import Modal from './Modal';

enum Cycle {
    WORK = "WORK",
    SHORT_BREAK = "SHORT_BREAK",
    LONG_BREAK = "LONG_BREAK"
}

export default function Pomodoro() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [cycle, setCycle] = useState(Cycle.WORK)
    const [totalSeconds, setTotalSeconds] = useState(0);
    const [secondsRemaining, setSecondsRemaining] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [timeInput, setTimeInput] = useState<number | null>(null);
    const [isConfettiExploding, setIsConfettiExploding] = useState(false);

    const icon = useMemo(() => {
        if (!isRunning) {
            return "⏳";
        }
        switch (cycle) {
            case Cycle.WORK:
                return "🧠";
            case Cycle.SHORT_BREAK:
                return "☕";
            case Cycle.LONG_BREAK:
                return "🌴";
            default:
                return "🧠";
        }
    }, [cycle, isRunning]);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isRunning && secondsRemaining > 0) {
            intervalRef.current = setInterval(() => {
                setSecondsRemaining(prev => prev - 1);
            }, 1000);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning]);

    const onTimerEnd = useCallback(() => {
        setIsRunning(false);
        setIsModalOpen(true);
        setIsConfettiExploding(true);
        if (cycle == Cycle.WORK) {
            audioRef.current = new Audio("/audio/MidnightCityAlarm.mp3");
            audioRef.current.play();
        } else {
            audioRef.current = new Audio("/audio/SunsetLoverAlarm.mp3");
            audioRef.current.play();
        }
    }, [cycle]);

    useEffect(() => {
        if (secondsRemaining <= 0 && isRunning) {
            onTimerEnd();
        }
    }, [secondsRemaining, isRunning]);

    const progress = useMemo(() => {
        if (!isRunning) return 1;
        return 1 - ((totalSeconds - secondsRemaining) / totalSeconds);
    }, [secondsRemaining, totalSeconds, isRunning]);

    const getSuggestions = useCallback(() => {
        if (cycle === Cycle.WORK) {
            return (
                <>
                    {totalSeconds <= 25 * 60 ? (
                        <button
                            onClick={() => {
                                setCycle(Cycle.SHORT_BREAK);
                                setSecondsRemaining(5 * 60);
                                setTotalSeconds(5 * 60);
                                setIsRunning(true);
                            }}
                        >
                            5 min short break
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                setCycle(Cycle.SHORT_BREAK);
                                setSecondsRemaining(10 * 60);
                                setTotalSeconds(10 * 60);
                                setIsRunning(true);
                            }}
                        >
                            10 min short break
                        </button>
                    )}
                    <button
                        onClick={() => {
                            setCycle(Cycle.LONG_BREAK);
                            setSecondsRemaining(15 * 60);
                            setTotalSeconds(15 * 60);
                            setIsRunning(true);
                        }}
                    >
                        15 min long break
                    </button>
                </>
            )
        } else {
            return (
                <>
                    <button
                        onClick={() => {
                            setCycle(Cycle.WORK);
                            setSecondsRemaining(25 * 60);
                            setTotalSeconds(25 * 60);
                            setIsRunning(true);
                        }}
                    >
                        25 min work session
                    </button>
                    <button
                        onClick={() => {
                            setCycle(Cycle.WORK);
                            setSecondsRemaining(50 * 60);
                            setTotalSeconds(50 * 60);
                            setIsRunning(true);
                        }}
                    >
                        50 min work session
                    </button>
                </>
            )
        }
    }, [cycle, totalSeconds]);

    return (
        <>
            <div className={styles.container} onClick={() => setIsModalOpen(true)}>
                <div className={styles.bar}>
                    <div
                        className={styles.barHalf}
                        style={{ transform: `scaleX(${progress})` }}
                    />
                    <div
                        className={styles.barHalf}
                        style={{ transform: `scaleX(${progress})` }}
                    />
                </div>
                <div className={styles.icon}>
                    {icon}
                </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                {totalSeconds === 0 ? (
                    <div className={styles.modalContent}>
                        <h2>No timer running</h2>
                        <div className="input-label-pair">
                            <label htmlFor="timeInput">Set timer (minutes):</label>
                            <input
                                id="timeInput"
                                name="timeInput"
                                type="number"
                                placeholder="Enter time in minutes"
                                value={timeInput == null ? "" : Math.floor(timeInput / 60)}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value == "") {
                                        setTimeInput(null);
                                    }
                                    const parsed = parseInt(e.target.value, 10);
                                    if (!isNaN(parsed) && parsed > 0) {
                                        setTimeInput(parsed * 60);
                                    }
                                }}
                                max={120}
                                min={1}
                            />
                        </div>
                        <select
                            value={cycle}
                            onChange={(e) => setCycle(e.target.value as Cycle)}
                        >
                            <option value={Cycle.WORK}>Work</option>
                            <option value={Cycle.SHORT_BREAK}>Short Break</option>
                            <option value={Cycle.LONG_BREAK}>Long Break</option>
                        </select>
                        <button
                            onClick={() => {
                                if (!timeInput) {
                                    return;
                                }
                                setSecondsRemaining(timeInput);
                                setTotalSeconds(timeInput);
                                setIsRunning(true);
                            }}
                        >
                            Start Timer
                        </button>
                    </div>
                ) : (
                    <>
                        {secondsRemaining <= 0 ? (
                            <div className={styles.modalContent}>
                                {isConfettiExploding && <ConfettiExplosion onComplete={() => setIsConfettiExploding(false)} />}
                                <h2>You just completed a {cycle.toLowerCase().replace('_', ' ')} cycle!</h2>
                                {audioRef.current?.paused === false && (
                                    <button
                                        onClick={() => {
                                            if (audioRef.current) {
                                                audioRef.current.pause();
                                                audioRef.current.currentTime = 0;
                                            }
                                        }}
                                    >
                                        Stop Alarm
                                    </button>
                                )}
                                <div className={styles.suggestions}>
                                    {getSuggestions()}
                                </div>
                                <button
                                    onClick={() => {
                                        setIsRunning(false);
                                        setTotalSeconds(0);
                                        setSecondsRemaining(0);
                                    }}
                                >
                                    Reset
                                </button>
                            </div>
                        ) : (
                            <div className={styles.modalContent}>
                                <h2>You are in a {cycle.toLowerCase().replace('_', ' ')} cycle for another {Math.floor(secondsRemaining / 60)} minutes and {secondsRemaining % 60} seconds.</h2>
                                <button
                                    onClick={() => {
                                        setIsRunning(false);
                                        setTotalSeconds(0);
                                        setSecondsRemaining(0);
                                    }}
                                >
                                    Reset
                                </button>
                            </div>
                        )}
                    </>
                )}
            </Modal >
        </>
    );
}
