"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export interface TurnstileHandle {
  reset: () => void;
}

/**
 * Cloudflare Turnstile. The `api.js` script is loaded once in the (site)
 * layout. When no site key is configured the widget renders nothing (the
 * edge function still fail-closes on the missing token server-side).
 */
const TurnstileWidget = forwardRef<
  TurnstileHandle,
  { onVerify: (token: string) => void; onExpire?: () => void }
>(({ onVerify, onExpire }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string>(undefined);

  useEffect(() => {
    if (!SITE_KEY || !containerRef.current) return;
    let cancelled = false;

    const tryRender = () => {
      if (cancelled) return;
      if (window.turnstile && containerRef.current) {
        widgetId.current = window.turnstile.render(containerRef.current, {
          sitekey: SITE_KEY,
          action: "travel-trails-form",
          callback: onVerify,
          "expired-callback": onExpire,
        });
      } else {
        setTimeout(tryRender, 120);
      }
    };
    tryRender();

    return () => {
      cancelled = true;
      if (window.turnstile && widgetId.current) {
        window.turnstile.remove(widgetId.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (window.turnstile && widgetId.current) {
        window.turnstile.reset(widgetId.current);
      }
    },
  }));

  if (!SITE_KEY) return null;
  return <div ref={containerRef} className="min-h-[65px]" />;
});

TurnstileWidget.displayName = "TurnstileWidget";
export default TurnstileWidget;
