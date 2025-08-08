import { useState } from "react";
import styles from "./Notification.module.css";

type NotificationProps = {
    message: string;
    buttonText: string;
    onClose: () => void;
}

export default function Notification({
    message,
    buttonText,
    onClose,
}: NotificationProps) {
    const [closing, setClosing] = useState(false);
    const handleClick = () => {
        setClosing(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };
    return (
        <div className={`${styles.notification} ${closing ? styles.slideUp : styles.slideDown}`}>
            <span className={styles.message}>{message}</span>
            <button className={styles.actionButton} onClick={handleClick}>
                {buttonText}
            </button>
        </div>
    );
}
