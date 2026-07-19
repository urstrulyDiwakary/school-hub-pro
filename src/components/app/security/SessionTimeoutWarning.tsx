import { useEffect, useRef, useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface SessionTimeoutWarningProps {
  /** Idle time before warning (ms). Default 25 min. */
  idleMs?: number;
  /** Countdown shown to the user (ms). Default 60s. */
  countdownMs?: number;
  onExpire: () => void;
}

/**
 * Watches user activity and shows a warning before auto-logout. Consumer
 * is responsible for the actual signout in `onExpire`.
 */
export function SessionTimeoutWarning({
  idleMs = 25 * 60 * 1000,
  countdownMs = 60 * 1000,
  onExpire,
}: SessionTimeoutWarningProps) {
  const [warning, setWarning] = useState(false);
  const [remaining, setRemaining] = useState(countdownMs);
  const idleTimer = useRef<ReturnType<typeof setTimeout>>();
  const countdownTimer = useRef<ReturnType<typeof setInterval>>();

  const reset = () => {
    if (warning) return;
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setWarning(true), idleMs);
  };

  useEffect(() => {
    const events = ["mousedown", "keydown", "scroll", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, reset));
    reset();
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      clearTimeout(idleTimer.current);
      clearInterval(countdownTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warning, idleMs]);

  useEffect(() => {
    if (!warning) return;
    setRemaining(countdownMs);
    const start = Date.now();
    countdownTimer.current = setInterval(() => {
      const left = countdownMs - (Date.now() - start);
      if (left <= 0) {
        clearInterval(countdownTimer.current);
        setWarning(false);
        onExpire();
      } else {
        setRemaining(left);
      }
    }, 1000);
    return () => clearInterval(countdownTimer.current);
  }, [warning, countdownMs, onExpire]);

  return (
    <AlertDialog open={warning} onOpenChange={setWarning}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>You're about to be signed out</AlertDialogTitle>
          <AlertDialogDescription>
            For your security, this session will expire in {Math.ceil(remaining / 1000)}s of inactivity.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onExpire}>Sign out</AlertDialogCancel>
          <AlertDialogAction onClick={() => setWarning(false)}>Stay signed in</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
