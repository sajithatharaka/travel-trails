import { describe, it, expect } from "vitest";
import { shouldNotifyStatusChange } from "@/lib/notify";

describe("shouldNotifyStatusChange", () => {
  it("notifies when moving to confirmed or cancelled", () => {
    expect(shouldNotifyStatusChange("pending", "confirmed")).toBe(true);
    expect(shouldNotifyStatusChange("pending", "cancelled")).toBe(true);
  });

  it("does not notify when the status is unchanged", () => {
    expect(shouldNotifyStatusChange("confirmed", "confirmed")).toBe(false);
  });

  it("does not notify when moving back to pending", () => {
    expect(shouldNotifyStatusChange("confirmed", "pending")).toBe(false);
  });
});
