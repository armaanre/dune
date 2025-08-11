"use client";

import { AnalyticsData } from "@/components/types";
import useSWR from "swr";
import { useEffect, useMemo, useRef } from "react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function computeApiBase(): string {
  if (typeof window !== "undefined") {
    const fromEnv = process.env.NEXT_PUBLIC_API_URL as string | undefined;
    if (fromEnv && fromEnv.length > 0) return fromEnv;
    try {
      const u = new URL(window.location.href);
      // default map web:3000 -> api:8080
      return `${u.protocol}//${u.hostname}:8080`;
    } catch {
      return "http://localhost:8080";
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
}

function toWs(url: string): string {
  try {
    const u = new URL(url);
    u.protocol = u.protocol === "https:" ? "wss:" : "ws:";
    return u.toString();
  } catch {
    return url.replace(/^http/, "ws");
  }
}

export default function LiveAnalytics({ formId }: { formId: string }) {
  const api = useMemo(() => computeApiBase(), []);
  const { data, mutate } = useSWR<AnalyticsData>(
    `${api}/api/forms/${formId}/analytics`,
    fetcher,
    { refreshInterval: 0 }
  );
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const wsUrl = toWs(`${api}/ws/forms/${formId}`);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    ws.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data);
        mutate(payload, false);
      } catch {}
    };
    ws.onopen = () => {
      try {
        ws.send("hello");
      } catch {}
    };
    ws.onerror = () => {};
    return () => {
      try {
        ws.close();
      } catch {}
    };
  }, [api, formId, mutate]);

  if (!data)
    return <div className="text-sm text-gray-500">Loading analytics…</div>;

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-600">
        Total responses: <strong>{data.totalResponses}</strong>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.fields.map((f) => (
          <div key={f.fieldId} className="rounded border p-4 space-y-2">
            <div className="text-sm font-medium">{f.label}</div>
            {f.counts && (
              <div className="space-y-1">
                {Object.entries(f.counts).map(([opt, count]) => (
                  <div
                    key={opt}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{opt}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            )}
            {typeof f.average === "number" && (
              <div className="text-sm">
                Average rating: <strong>{f.average.toFixed(2)}</strong>
              </div>
            )}
            {f.recentTexts && f.recentTexts.length > 0 && (
              <div className="space-y-1">
                {f.recentTexts.map((t, i) => (
                  <div key={i} className="text-sm text-gray-700">
                    {t}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
