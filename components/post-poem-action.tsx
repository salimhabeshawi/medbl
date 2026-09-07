import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PostPoemAction() {
  return (
    <Button asChild variant="outline" className="h-10 gap-2 rounded-full border-primary/30 text-primary hover:bg-accent">
      <Link href="/submit">
        <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground"><Plus className="size-4" /></span>
        Post a poem
      </Link>
    </Button>
  );
}
