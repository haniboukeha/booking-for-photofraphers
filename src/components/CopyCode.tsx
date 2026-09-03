"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // clipboard unavailable — user can select manually
        }
      }}
      className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 font-mono text-sm font-bold text-white transition hover:bg-slate-700"
      aria-label="Copy booking code"
    >
      {code}
      {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-slate-400" />}
    </button>
  );
}
