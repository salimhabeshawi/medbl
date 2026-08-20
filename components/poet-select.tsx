"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { searchPoets, type PoetResult } from "@/app/actions";

export function PoetSelect() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PoetResult[]>([]);
  const [selected, setSelected] = useState<PoetResult | null>(null);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [triedEmpty, setTriedEmpty] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestQueryRef = useRef<string>("");

  useEffect(() => {
    if (selected) return;
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
  }, [query, selected]);

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
    setSelected(poet);
    setQuery("");
    setResults([]);
    setOpen(false);
    setTriedEmpty(false);
  }

  function deselect() {
    setSelected(null);
    setQuery("");
  }

  return (
    <div ref={boxRef} className="relative">
      {/* The chosen poets.id is what actually gets submitted. There is no
          free-text poet name field anywhere in this form. */}
      <input type="hidden" name="poet_id" value={selected?.id ?? ""} />

      {selected ? (
        <div className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm">
          <span>
            {selected.name_am}
            {selected.name_en ? ` (${selected.name_en})` : ""}
          </span>
          <button
            type="button"
            onClick={deselect}
            className="rounded-full px-2 py-0.5 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800"
            aria-label="Clear selected poet"
          >
            ✕
          </button>
        </div>
      ) : (
        <>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (results.length > 0) setOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search poets by name (Amharic or English)…"
            autoComplete="off"
            aria-label="Search poets"
            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
          />
          {open ? (
            <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border bg-white shadow-lg dark:bg-zinc-900">
              {searching ? (
                <li className="px-3 py-2 text-sm text-zinc-500">
                  Searching…
                </li>
              ) : results.length === 0 ? (
                <li className="px-3 py-2 text-sm text-zinc-500">
                  {triedEmpty ? "No poets found." : "Type to search."}
                </li>
              ) : (
                results.map((poet) => (
                  <li key={poet.id}>
                    <button
                      type="button"
                      onClick={() => choose(poet)}
                      className="flex w-full items-baseline gap-2 px-3 py-2 text-left text-sm transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <span className="font-medium">{poet.name_am}</span>
                      {poet.name_en ? (
                        <span className="text-zinc-500">{poet.name_en}</span>
                      ) : null}
                    </button>
                  </li>
                ))
              )}
              <li className="border-t px-3 py-2">
                <Link
                  href="/poets/request"
                  className="text-xs text-zinc-500 underline hover:text-zinc-800 dark:hover:text-zinc-200"
                >
                  Can&apos;t find this poet? Request to add them
                </Link>
              </li>
            </ul>
          ) : null}
        </>
      )}
    </div>
  );
}