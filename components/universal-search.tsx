"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Filter, Search } from "lucide-react";
import {
  searchPoems,
  searchPoets,
  type PoetResult,
  type UniversalPoemResult,
} from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function UniversalSearch({
  mode = "poems",
  defaultValue = "",
  placeholder = "Search poems, lines, poets, or themes...",
  categories = [],
}: {
  mode?: "poems" | "poets";
  defaultValue?: string;
  placeholder?: string;
  categories?: string[];
}) {
  const [value, setValue] = useState(defaultValue);
  const [results, setResults] = useState<UniversalPoemResult[]>([]);
  const [poetResults, setPoetResults] = useState<PoetResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [category, setCategory] = useState("all");

  const visibleResults = category === "all"
    ? results
    : results.filter((poem) => poem.category === category);

  useEffect(() => {
    const nextValue = value.trim();
    if (!nextValue && category === "all") return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const nextResults = mode === "poets"
        ? await searchPoets(nextValue)
        : await searchPoems(nextValue, category === "all" ? undefined : category);
      if (cancelled) return;
      if (mode === "poets") setPoetResults(nextResults as PoetResult[]);
      else setResults(nextResults as UniversalPoemResult[]);
      setSearching(false);
    }, 300);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [category, mode, value]);

  function handleChange(nextValue: string) {
    setValue(nextValue);
    if (nextValue.trim()) setSearching(true);
    else {
      setResults([]);
      setPoetResults([]);
      setSearching(false);
    }
  }

  function handleCategoryChange(nextCategory: string) {
    setCategory(nextCategory);
    setSearching(nextCategory !== "all" || Boolean(value.trim()));
  }

  function excerpt(body: string): string {
    const compact = body.replace(/\s+/g, " ").trim();
    return compact.length > 140 ? `${compact.slice(0, 140)}...` : compact;
  }

  return (
    <form onSubmit={(event) => event.preventDefault()} className="w-full">
      <div className="grid items-center gap-2 sm:grid-cols-[minmax(0,1fr)_13rem]">
      <div className="relative min-w-0">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input type="search" name="q" value={value} onChange={(event) => handleChange(event.target.value)} placeholder={placeholder} aria-label={placeholder} className="h-11 pl-9" />
      </div>
      {mode === "poems" && categories.length > 0 ? (
        <div className="relative min-w-0">
          <Filter className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
          <Select value={category} onValueChange={handleCategoryChange}>
            <SelectTrigger className="h-11 min-h-11 w-full pl-9 leading-none"><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {categories.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      ) : null}
      </div>
      {value.trim() || category !== "all" ? (
        <div className="mt-3 space-y-2">
          {searching ? <p className="px-1 text-sm text-muted-foreground">Searching the anthology...</p> : mode === "poets" && poetResults.length > 0 ? poetResults.map((poet) => (
            <Link key={poet.id} href={`/poets/${poet.id}`} className="block">
              <Card className="content-card border-primary/15"><CardContent className="p-4">
                <p className="font-serif font-semibold text-foreground">{poet.name_am}</p>
                {poet.name_en ? <p className="mt-1 text-sm text-muted-foreground">{poet.name_en}</p> : null}
              </CardContent></Card>
            </Link>
          )) : mode === "poems" && visibleResults.length > 0 ? visibleResults.map((poem) => (
            <Link key={poem.id} href={`/poems/${poem.id}`} className="block">
              <Card className="content-card border-primary/15"><CardContent className="p-4">
                <p className="font-serif font-semibold text-foreground">{poem.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{poem.poet_name_am || poem.poet_name_en || "Unknown poet"}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{excerpt(poem.body)}</p>
              </CardContent></Card>
            </Link>
          )) : <p className="px-1 text-sm text-muted-foreground">No {mode === "poets" ? "poets" : "poems"} match{value.trim() ? ` &quot;${value.trim()}&quot;` : " this category"}.</p>}
        </div>
      ) : null}
    </form>
  );
}
