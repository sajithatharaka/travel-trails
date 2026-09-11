import { describe, it, expect } from "vitest";
import { resolveEdgeFunctionError } from "@/lib/edgeFunctionError";

const FALLBACK = "Sorry, something went wrong.";

describe("resolveEdgeFunctionError", () => {
  it("returns null when the call succeeded", async () => {
    expect(
      await resolveEdgeFunctionError({ data: { success: true }, error: null }, FALLBACK),
    ).toBeNull();
  });

  it("maps a known error in a 200 body to friendly copy", async () => {
    expect(
      await resolveEdgeFunctionError(
        { data: { error: "Missing verification token" }, error: null },
        FALLBACK,
      ),
    ).toMatch(/complete the verification challenge/i);
  });

  it("reads the function body from error.context on a non-2xx response", async () => {
    const result = {
      data: null,
      error: {
        name: "FunctionsHttpError",
        message: "Edge Function returned a non-2xx status code",
        context: new Response(JSON.stringify({ error: "Verification failed" }), {
          status: 403,
        }),
      },
    };
    const message = await resolveEdgeFunctionError(result, FALLBACK);
    expect(message).toMatch(/couldn't verify that you're human/i);
    expect(message).not.toMatch(/non-2xx/i);
  });

  it("maps the future-travel-date rejection to friendly copy", async () => {
    const result = {
      data: null,
      error: {
        name: "FunctionsHttpError",
        message: "Edge Function returned a non-2xx status code",
        context: new Response(
          JSON.stringify({ error: "travel_date must be in the future" }),
          { status: 400 },
        ),
      },
    };
    expect(await resolveEdgeFunctionError(result, FALLBACK)).toMatch(
      /travel date in the future/i,
    );
  });

  it("maps the tour-enquiry mandatory-fields rejection to friendly copy", async () => {
    const result = {
      data: {
        error:
          "tour, name, email, travel date, travellers and message are required",
      },
      error: null,
    };
    expect(await resolveEdgeFunctionError(result, FALLBACK)).toMatch(
      /fill in every field/i,
    );
  });

  it("uses the fallback for an unrecognised server message", async () => {
    const result = {
      data: null,
      error: {
        name: "FunctionsHttpError",
        message: "Edge Function returned a non-2xx status code",
        context: new Response(JSON.stringify({ error: "column xyz does not exist" }), {
          status: 500,
        }),
      },
    };
    expect(await resolveEdgeFunctionError(result, FALLBACK)).toBe(FALLBACK);
  });

  it("uses the fallback for a transport failure with no readable body", async () => {
    expect(
      await resolveEdgeFunctionError(
        { data: null, error: { name: "FunctionsFetchError", message: "Failed to fetch" } },
        FALLBACK,
      ),
    ).toBe(FALLBACK);
  });

  it("uses the fallback when the context body is not JSON", async () => {
    const result = {
      data: null,
      error: {
        name: "FunctionsHttpError",
        message: "Edge Function returned a non-2xx status code",
        context: new Response("<html>502 Bad Gateway</html>", { status: 502 }),
      },
    };
    expect(await resolveEdgeFunctionError(result, FALLBACK)).toBe(FALLBACK);
  });
});
