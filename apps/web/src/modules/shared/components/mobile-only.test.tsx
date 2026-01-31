import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MobileOnly } from "./mobile-only";

function mockUserAgent(ua: string) {
  Object.defineProperty(navigator, "userAgent", {
    value: ua,
    configurable: true,
  });
}

function mockInnerWidth(width: number) {
  Object.defineProperty(window, "innerWidth", {
    value: width,
    configurable: true,
  });
}

describe("MobileOnly", () => {
  it("renders children on mobile user agent with small viewport", () => {
    mockUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
    );
    mockInnerWidth(375);

    render(
      <MobileOnly>
        <div>App Content</div>
      </MobileOnly>,
    );

    expect(screen.getByText("App Content")).toBeInTheDocument();
  });

  it("shows unsupported message on desktop user agent", () => {
    mockUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    );
    mockInnerWidth(375);

    render(
      <MobileOnly>
        <div>App Content</div>
      </MobileOnly>,
    );

    expect(screen.queryByText("App Content")).not.toBeInTheDocument();
    expect(screen.getByText(/dispositivo não suportado/i)).toBeInTheDocument();
  });

  it("shows unsupported message on wide viewport even with mobile user agent", () => {
    mockUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
    );
    mockInnerWidth(1024);

    render(
      <MobileOnly>
        <div>App Content</div>
      </MobileOnly>,
    );

    expect(screen.queryByText("App Content")).not.toBeInTheDocument();
    expect(screen.getByText(/dispositivo não suportado/i)).toBeInTheDocument();
  });
});
