import { describe, it, expect, afterEach, vi } from "vitest";
import { render } from "@testing-library/react";

// The widget resolves its site key at module load, so each case stubs the
// env var and re-imports the component fresh.
async function loadWidget(siteKey: string) {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", siteKey);
  return (await import("@/components/TurnstileWidget")).default;
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
  delete window.turnstile;
});

describe("<TurnstileWidget />", () => {
  it("swallows a rejected site key instead of crashing the render tree", async () => {
    const renderSpy = vi.fn(() => {
      throw new Error('[Cloudflare Turnstile] Invalid input for parameter "sitekey"');
    });
    window.turnstile = { render: renderSpy, reset: vi.fn(), remove: vi.fn() };
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const Widget = await loadWidget("1x00000000000000000000AA");

    expect(() => render(<Widget onVerify={vi.fn()} />)).not.toThrow();
    expect(renderSpy).toHaveBeenCalledTimes(1);
    expect(errSpy).toHaveBeenCalledWith(
      "[TurnstileWidget] render failed",
      expect.any(Error),
    );

    errSpy.mockRestore();
  });

  it("renders nothing (and never touches turnstile) for a placeholder key", async () => {
    const renderSpy = vi.fn();
    window.turnstile = { render: renderSpy, reset: vi.fn(), remove: vi.fn() };

    const Widget = await loadWidget("0x<site-key>");
    const { container } = render(<Widget onVerify={vi.fn()} />);

    expect(container.firstChild).toBeNull();
    expect(renderSpy).not.toHaveBeenCalled();
  });
});
