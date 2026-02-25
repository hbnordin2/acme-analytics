"use client";

import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = "acme-cookie-consent";

type ConsentChoice = "all" | "essential" | "custom" | null;

// ---------------------------------------------------------------------------
// Cookie consent banner
// ---------------------------------------------------------------------------

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [marketingEnabled, setMarketingEnabled] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Small delay so the banner slides in after the page loads
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (choice: ConsentChoice) => {
    const consent = {
      choice,
      analytics: choice === "all" || (choice === "custom" && analyticsEnabled),
      marketing: choice === "all" || (choice === "custom" && marketingEnabled),
      essential: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4">
      <div className="mx-auto max-w-2xl rounded-xl border bg-card shadow-lg backdrop-blur">
        {/* Close button */}
        <div className="flex items-start justify-between p-5 pb-0">
          <div className="flex items-center gap-2">
            <Cookie className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-base font-semibold">Cookie Preferences</h3>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Close cookie banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 pt-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            We use cookies to enhance your browsing experience, serve
            personalized content, and analyze our traffic. By clicking
            &quot;Accept All&quot;, you consent to our use of cookies.
            Read our{" "}
            <a
              href="/privacy"
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </a>{" "}
            for more information.
          </p>

          {/* Customize section */}
          {showCustomize && (
            <div className="mt-4 space-y-3 rounded-lg border bg-muted/40 p-4">
              <label className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Essential Cookies</p>
                  <p className="text-xs text-muted-foreground">
                    Required for the website to function properly.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked
                  disabled
                  className="h-4 w-4 rounded border-input"
                />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Analytics Cookies</p>
                  <p className="text-xs text-muted-foreground">
                    Help us understand how visitors interact with the site.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={analyticsEnabled}
                  onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-input"
                />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Marketing Cookies</p>
                  <p className="text-xs text-muted-foreground">
                    Used to deliver targeted advertising and promotions.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={marketingEnabled}
                  onChange={(e) => setMarketingEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-input"
                />
              </label>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
            {showCustomize ? (
              <Button
                size="sm"
                onClick={() => handleConsent("custom")}
              >
                Save Preferences
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCustomize(true)}
                >
                  Customize
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleConsent("essential")}
                >
                  Reject Non-Essential
                </Button>
                <Button size="sm" onClick={() => handleConsent("all")}>
                  Accept All
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
