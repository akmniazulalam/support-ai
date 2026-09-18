"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function WidgetDemoPage() {
  const pathname = usePathname();
  const [agentId, setAgentId] = useState("");
  const [position, setPosition] = useState<"bottom-right" | "bottom-left">(
    "bottom-right",
  );
  const [apiUrl, setApiUrl] = useState("https://support-ai-sihl.onrender.com");
  const [isWidgetLoaded, setIsWidgetLoaded] = useState(false);
  const [sessionStored, setSessionStored] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    // This code only runs in the browser, where window is safely available
    const currentUrl = window.location.href;
    const timeoutId = window.setTimeout(() => {
      if (
        currentUrl.startsWith("http://localhost:3000/widget-demo") ||
        currentUrl.startsWith("http://localhost:3002/widget-demo") ||
        currentUrl.startsWith("http://localhost:3003/widget-demo")
      ) {
        setApiUrl("http://localhost:3001");
      } else if (
        currentUrl.startsWith(
          "https://support-ai-web-eosin.vercel.app/widget-demo",
        )
      ) {
        setApiUrl("https://support-ai-sihl.onrender.com");
      }
      try {
        const parsed = new URL(currentUrl);
        const pId = parsed.searchParams.get("agentId");
        if (pId && pId.trim()) {
          setAgentId(pId.trim());
          const val = window.localStorage.getItem(
            `supportai_chat_${pId.trim()}`,
          );
          setSessionStored(val);
        }
      } catch {
        // ignore
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  // Cleanup widget resources when navigating away from the Widget Demo route
  useEffect(() => {
    return () => {
      // Call destroy() to clear intervals and remove window event listeners
      const instance = (
        window as Window & { __supportAIWidgetInstance?: { destroy(): void } }
      ).__supportAIWidgetInstance;
      if (instance) {
        instance.destroy();
        (
          window as Window & {
            __supportAIWidgetInstance?: { destroy(): void };
          }
        ).__supportAIWidgetInstance = undefined;
      }
      // Remove injected widget DOM (script tag + shadow root host)
      // NOTE: localStorage sessions are intentionally preserved
      const existingScript = document.getElementById("supportai-test-script");
      if (existingScript) existingScript.remove();
      const root = document.getElementById("supportai-widget-root");
      if (root) root.remove();
    };
  }, []);

  // Check stored session in localStorage
  const checkStoredSession = (id: string) => {
    if (!id || typeof window === "undefined") {
      setSessionStored(null);
      return;
    }
    const val = window.localStorage.getItem(`supportai_chat_${id}`);
    setSessionStored(val);
  };

  const handleAgentIdChange = (newId: string) => {
    setAgentId(newId);
    if (formError && newId.trim()) {
      setFormError(null);
    }
    checkStoredSession(newId);
  };

  const loadWidget = () => {
    if (typeof document === "undefined") return;

    // Remove any existing widget root or scripts
    unloadWidget();

    if (!agentId.trim()) {
      setFormError("Please enter a Public Agent ID to load the widget.");
      return;
    }
    setFormError(null);

    const script = document.createElement("script");
    script.src = "/widget.js";
    script.setAttribute("data-agent-id", agentId.trim());
    script.setAttribute("data-position", position);
    if (apiUrl.trim()) {
      script.setAttribute("data-api-url", apiUrl.trim());
    }
    script.id = "supportai-test-script";

    document.body.appendChild(script);
    setIsWidgetLoaded(true);

    setTimeout(() => {
      checkStoredSession(agentId.trim());
    }, 500);
  };

  const unloadWidget = () => {
    const existingScript = document.getElementById("supportai-test-script");
    if (existingScript) existingScript.remove();

    const root = document.getElementById("supportai-widget-root");
    if (root) root.remove();

    setIsWidgetLoaded(false);
  };

  const clearSession = () => {
    if (agentId.trim()) {
      window.localStorage.removeItem(`supportai_chat_${agentId.trim()}`);
      setSessionStored(null);
    }
  };

  const embedSnippet = `<script\n  src="https://YOUR_SUPPORTAI_WEB_DOMAIN/widget.js"\n  data-agent-id="${agentId.trim() || "PUBLIC_AGENT_ID"}"${position !== "bottom-right" ? `\n  data-position="${position}"` : ""}>\n</script>`;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans p-6 sm:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Banner */}
        <div className="border border-emerald-500/30 bg-emerald-500/10 rounded-2xl p-5 flex items-start gap-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-sm">
            7B
          </div>
          <div>
            <h1 className="text-base font-semibold text-zinc-100 font-lexend">
              SupportAI Widget Test Harness & Demo
            </h1>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              This internal harness tests the standalone embeddable chat widget
              script (<code>/widget.js</code>) inside a Shadow DOM root. Use
              this surface to verify script initialization, CSS isolation,
              session persistence, and error recovery.
            </p>
          </div>
        </div>

        {/* Configuration Controls */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#111218] p-6 space-y-5">
          <h2 className="text-sm font-semibold text-zinc-200">
            Widget Parameters
          </h2>

          {formError && (
            <div
              role="alert"
              className="flex items-center gap-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-300 animate-message-entrance">
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-xs font-medium text-zinc-400 mb-1.5"
                htmlFor="agent-id-input">
                Public Agent ID (Required)
              </label>
              <input
                id="agent-id-input"
                type="text"
                value={agentId}
                onChange={(e) => handleAgentIdChange(e.target.value)}
                placeholder="e.g. 8f6b1424-..."
                className="w-full rounded-xl border border-white/[0.1] bg-[#161722] px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-lexend"
              />
              <p className="text-[11px] text-zinc-500 mt-1">
                Found under agent settings in the dashboard.
              </p>
            </div>

            <div>
              <label
                className="block text-xs font-medium text-zinc-400 mb-1.5"
                htmlFor="position-select">
                Launcher Position
              </label>
              <select
                id="position-select"
                value={position}
                onChange={(e) =>
                  setPosition(e.target.value as "bottom-right" | "bottom-left")
                }
                className="w-full rounded-xl border border-white/[0.1] bg-[#161722] px-3.5 py-2 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer">
                <option value="bottom-right">bottom-right (default)</option>
                <option value="bottom-left">bottom-left</option>
              </select>
              <p className="text-[11px] text-zinc-500 mt-1">
                Configured via <code>data-position</code> attribute.
              </p>
            </div>

            <div className="sm:col-span-2">
              <label
                className="block text-xs font-medium text-zinc-400 mb-1.5"
                htmlFor="api-url-input">
                API Base URL Override (Optional dev/test override)
              </label>
              <input
                id="api-url-input"
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder={`${pathname === "https://support-ai-web-eosin.vercel.app/widget-demo" ? "https://support-ai-sihl.onrender.com" : "http://localhost:3001"}`}
                className="w-full rounded-xl border border-white/[0.1] bg-[#161722] px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-lexend"
              />
              <p className="text-[11px] text-zinc-500 mt-1">
                Only for local development testing via <code>data-api-url</code>
                . In production, customers omit this attribute.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={loadWidget}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors cursor-pointer shadow-xs shadow-emerald-950">
              {isWidgetLoaded ? "Reload Widget" : "Inject & Test Widget"}
            </button>

            {isWidgetLoaded && (
              <button
                type="button"
                onClick={unloadWidget}
                className="rounded-xl border border-white/[0.1] bg-[#1c1d28] px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-white/[0.08] transition-colors cursor-pointer">
                Unload Widget
              </button>
            )}

            {sessionStored && (
              <button
                type="button"
                onClick={clearSession}
                className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer">
                Clear Local Session
              </button>
            )}
          </div>
        </div>

        {/* Live Session & Status Inspection */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#111218] p-5 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Widget State & Session Inspector
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-white/[0.04] bg-[#0c0d14]">
              <span className="text-zinc-500 block mb-1">Widget Injected</span>
              <span
                className={`font-semibold ${isWidgetLoaded ? "text-emerald-400" : "text-zinc-500"}`}>
                {isWidgetLoaded ? "Mounted in Shadow DOM" : "Not Loaded"}
              </span>
            </div>

            <div className="p-3 rounded-xl border border-white/[0.04] bg-[#0c0d14]">
              <span className="text-zinc-500 block mb-1">Active Target ID</span>
              <span className="font-lexend text-zinc-300 truncate block">
                {agentId.trim() || "(none)"}
              </span>
            </div>

            <div className="p-3 rounded-xl border border-white/[0.04] bg-[#0c0d14]">
              <span className="text-zinc-500 block mb-1">
                LocalStorage Session
              </span>
              <span
                className={`font-medium ${sessionStored ? "text-sky-400" : "text-zinc-500"}`}>
                {sessionStored ? "Session Cached" : "No Session Stored"}
              </span>
            </div>
          </div>
        </div>

        {/* Code Snippet for Embedders */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#111218] p-5 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Customer Embed Snippet
          </h2>
          <p className="text-xs text-zinc-500">
            This is the exact code snippet an external website owner places on
            their HTML page:
          </p>
          <pre className="p-4 rounded-xl bg-[#0a0b10] border border-white/[0.06] text-xs font-lexend text-emerald-400 overflow-x-auto">
            {embedSnippet}
          </pre>
        </div>

        {/* Host Website CSS Isolation Stress Test Simulator */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-amber-400"></span>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              Simulated Host Website (CSS Isolation Test)
            </h2>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            The container below applies hostile global CSS styles (e.g.{" "}
            <code>
              button &#123; border-radius: 0px !important; color: red
              !important; &#125;
            </code>
            ) representing a third-party host site. Because the SupportAI widget
            renders inside a Shadow DOM root, none of these styles can bleed
            into the widget launcher or chat panel.
          </p>

          <div className="p-4 rounded-xl border border-white/[0.06] bg-[#0c0d14] space-y-2">
            <p className="text-xs text-zinc-400">
              Sample Host Page Buttons (affected by host styling):
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                style={{
                  backgroundColor: "#dc2626",
                  color: "#ffffff",
                  borderRadius: 0,
                  padding: "8px 16px",
                  fontWeight: 700,
                }}>
                Host Website Red Button
              </button>
              <button
                type="button"
                style={{
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  borderRadius: "20px",
                  padding: "8px 16px",
                }}>
                Host Website Blue Button
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
