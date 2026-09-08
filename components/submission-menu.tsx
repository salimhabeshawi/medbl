"use client";

import Link from "next/link";
import { ClipboardList, Plus, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export function SubmissionMenu() {
  const tNav = useTranslations("Nav");
  const tSubmit = useTranslations("Submit");
  const tSubmissions = useTranslations("MySubmissions");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1">{tNav("submit")} <ChevronDown className="size-3.5" /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild><Link href="/submit"><Plus className="text-primary" /> {tSubmit("title")}</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/my-submissions"><ClipboardList className="text-primary" /> {tSubmissions("title")}</Link></DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
