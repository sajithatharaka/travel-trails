"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import {
  TURNSTILE_SITE_KEY as SITE_KEY,
  TURNSTILE_ACTION,
} from "@/lib/turnstile";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
  }
}

export interface TurnstileHandle {
  reset: () => void;
}

/**
 * Cloudflare Turnstile. The `api.js` script is loaded once in the (site)
 * layout. When no site key is configured the widget renders nothing (the
 * edge function still fail-closes on the missing token server-side).
 *
 * `onError` fires for `error-callback` — most commonly a site key whose
 * Cloudflare-side allowed-domain list doesn't include the hostname the page
 * is running on (shows as a "Unable to connect to website" box in the
 * widget itself). Without wiring this up, that failure leaves the form
 * silently stuck: no token ever arrives, so the submit button stays
 * disabled with no explanation.
 */
const TurnstileWidget = forwardRef<
  TurnstileHandle,
  {
    onVerify: (token: string) => void;
    onExpire?: () => void;
    onError?: () => void;
  }
>(({ onVerify, onExpire, onError }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string>(undefined);

  useEffect(() => {
    if (!SITE_KEY || !containerRef.current) return;
    let cancelled = false;

    const tryRender = () => {
      if (cancelled) return;
      if (window.turnstile && containerRef.current) {
        try {
          widgetId.current = window.turnstile.render(containerRef.current, {
            sitekey: SITE_KEY,
            action: TURNSTILE_ACTION,
            callback: onVerify,
            "expired-callback": onExpire,
            "error-callback": onError,
          });
        } catch (err) {
          // A rejected site key (e.g. a misconfigured env) must never take
          // down the route it renders in — log and leave the widget empty.
          console.error("[TurnstileWidget] render failed", err);
        }
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
