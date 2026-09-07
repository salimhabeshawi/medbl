"use client";

import Link from "next/link";
import { ClipboardList, Plus, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function SubmissionMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1">Submissions <ChevronDown className="size-3.5" /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild><Link href="/submit"><Plus className="text-primary" /> Submit a poem</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/my-submissions"><ClipboardList className="text-primary" /> My submissions</Link></DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
