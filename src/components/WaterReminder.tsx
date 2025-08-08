import { useCallback, useEffect, useRef, useState } from "react";
import Notification from "./Notification";

export default function WaterReminder() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isShowing, setIsShowing] = useState(true);
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            cancelAudio();
            if (audioRef.current) {
                audioRef.current = null;
            }
        }
    }, [])
    const cancelAudio = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }, []);
    const onClose = useCallback(() => {
        setIsShowing(false);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        cancelAudio();
        audioRef.current = new Audio("/audio/WaterReminder.mp3");
        audioRef.current.play().then(() => {
            audioRef.current?.pause();
            audioRef.current!.currentTime = 0;
        })
        timeoutRef.current = setTimeout(() => {
            setIsShowing(true);
            audioRef.current?.play();
        }, 20 * 60 * 1000); // 20 minutes
    }, [])
    if (!isShowing) return null;
    return (
        <Notification
            message="Time to drink some water!"
            buttonText="💧"
            onClose={onClose}
        />
    )
}
