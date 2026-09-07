"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import {
  searchPoems,
  searchPoets,
  type PoetResult,
  type UniversalPoemResult,
} from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function UniversalSearch({
  mode = "poems",
  defaultValue = "",
  placeholder = "Search poems, lines, poets, or themes...",
}: {
  mode?: "poems" | "poets";
  defaultValue?: string;
  placeholder?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [results, setResults] = useState<UniversalPoemResult[]>([]);
  const [poetResults, setPoetResults] = useState<PoetResult[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const nextValue = value.trim();
    if (!nextValue) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const nextResults = mode === "poets"
        ? await searchPoets(nextValue)
        : await searchPoems(nextValue);
      if (cancelled) return;
      if (mode === "poets") setPoetResults(nextResults as PoetResult[]);
      else setResults(nextResults as UniversalPoemResult[]);
      setSearching(false);
    }, 300);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [mode, value]);

  function handleChange(nextValue: string) {
    setValue(nextValue);
    if (nextValue.trim()) setSearching(true);
    else {
      setResults([]);
      setPoetResults([]);
      setSearching(false);
    }
  }

  function excerpt(body: string): string {
    const compact = body.replace(/\s+/g, " ").trim();
    return compact.length > 140 ? `${compact.slice(0, 140)}...` : compact;
  }

  return (
    <form onSubmit={(event) => event.preventDefault()} className="w-full">
      <div className="relative min-w-0">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input type="search" name="q" value={value} onChange={(event) => handleChange(event.target.value)} placeholder={placeholder} aria-label={placeholder} className="h-11 pl-9" />
      </div>
      {value.trim() ? (
        <div className="mt-3 space-y-2">
          {searching ? <p className="px-1 text-sm text-muted-foreground">Searching the anthology...</p> : mode === "poets" && poetResults.length > 0 ? poetResults.map((poet) => (
            <Link key={poet.id} href={`/poets/${poet.id}`} className="block">
              <Card className="border-primary/15 transition hover:border-primary/50 hover:bg-accent/30"><CardContent className="p-4">
                <p className="font-serif font-semibold text-foreground">{poet.name_am}</p>
                {poet.name_en ? <p className="mt-1 text-sm text-muted-foreground">{poet.name_en}</p> : null}
              </CardContent></Card>
            </Link>
          )) : mode === "poems" && results.length > 0 ? results.map((poem) => (
            <Link key={poem.id} href={`/poems/${poem.id}`} className="block">
              <Card className="border-primary/15 transition hover:border-primary/50 hover:bg-accent/30"><CardContent className="p-4">
                <p className="font-serif font-semibold text-foreground">{poem.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{poem.poet_name_am || poem.poet_name_en || "Unknown poet"}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{excerpt(poem.body)}</p>
              </CardContent></Card>
            </Link>
          )) : <p className="px-1 text-sm text-muted-foreground">No {mode === "poets" ? "poets" : "poems"} match &quot;{value.trim()}&quot;.</p>}
        </div>
      ) : null}
    </form>
  );
}
