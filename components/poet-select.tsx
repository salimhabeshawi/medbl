"use client";

import { useEffect, useRef, useState } from "react";
import { searchPoets, type PoetResult } from "@/app/actions";
import { X, Search, UserRoundPlus } from "lucide-react";
import { Button } from "./ui/button";
import { useTranslations } from "next-intl";
import { Input } from "./ui/input";

export function PoetSelect({
  value,
  onChange,
  onRequestNew,
}: {
  value: PoetResult | null;
  onChange: (poet: PoetResult | null) => void;
  onRequestNew?: () => void;
}) {
  const tSubmit = useTranslations("Submit");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PoetResult[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [triedEmpty, setTriedEmpty] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestQueryRef = useRef<string>("");

  useEffect(() => {
    if (value) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const q = query.trim();
      latestQueryRef.current = q;
      if (!q) {
        setResults([]);
        setSearching(false);
        setOpen(false);
        setTriedEmpty(false);
        return;
      }
      setSearching(true);
      const res = await searchPoets(q);
      if (latestQueryRef.current !== q) return; // stale response
      setSearching(false);
      setResults(res);
      setOpen(true);
      setTriedEmpty(res.length === 0);
    }, 250);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, value]);

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && open && results.length > 0) {
      e.preventDefault();
      choose(results[0]);
    }
    if (e.key === "Escape") setOpen(false);
  }

  function choose(poet: PoetResult) {
    onChange(poet);
    setQuery("");
    setResults([]);
    setOpen(false);
    setTriedEmpty(false);
  }

  function deselect() {
    onChange(null);
    setQuery("");
  }

  return (
    <div ref={boxRef} className="relative z-40">
      {/* The chosen poets.id is what actually gets submitted. There is no
          free-text poet field here — new poets go through the separate
          inline proposal fields rendered by the parent form. */}
      <input type="hidden" name="poet_id" value={value?.id ?? ""} />

      {value ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/20 bg-card px-3 py-3 text-sm shadow-sm">
          <span className="flex min-w-0 items-center gap-2"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><Search className="size-3.5" /></span><span className="truncate font-medium">
            {value.name_am}
            {value.name_en ? ` (${value.name_en})` : ""}
          </span></span>
          <Button
            type="button"
            onClick={deselect}
            variant="ghost"
            size="icon-sm"
            aria-label="Clear selected poet"
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <>
          <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (results.length > 0) setOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={tSubmit("searchPoetPlaceholder")}
            autoComplete="off"
            aria-label={tSubmit("searchPoetPlaceholder")}
            className="h-11 pl-9"
          /></div>
          {open ? (
            <ul className="absolute left-0 right-0 z-50 mt-2 max-h-72 overflow-y-auto rounded-xl border border-primary/15 bg-card p-1 shadow-xl">
              {searching ? (
                <li className="px-3 py-3 text-sm text-muted-foreground">
                  Searching…
                </li>
              ) : results.length === 0 ? (
                <li className="px-3 py-3 text-sm text-muted-foreground">
                  {triedEmpty ? tSubmit("noPoetsFound") : tSubmit("typeToSearch")}
                </li>
              ) : (
                results.map((poet) => (
                  <li key={poet.id}>
                    <button
                      type="button"
                      onClick={() => choose(poet)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition hover:bg-accent"
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary"><UserRoundPlus className="size-4" /></span><span><span className="block font-medium">{poet.name_am}</span>{poet.name_en ? <span className="block text-xs text-muted-foreground">{poet.name_en}</span> : null}</span>
                    </button>
                  </li>
                ))
              )}
              {onRequestNew ? (
                <li className="border-t border-border/70 px-3 py-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onRequestNew();
                    }}
                    className="inline-flex items-center gap-2 text-xs font-medium text-primary hover:underline"
                  >
                    <UserRoundPlus className="size-3.5" /> {tSubmit("proposePoetToggle")}
                  </button>
                </li>
              ) : null}
            </ul>
          ) : null}
        </>
      )}
    </div>
  );
}