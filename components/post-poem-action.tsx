import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export function PostPoemAction() {
  const tSubmit = useTranslations("Submit");
  return (
    <Button asChild variant="outline" className="h-10 gap-2 rounded-full border-primary/30 text-primary hover:bg-accent">
      <Link href="/submit">
        <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground"><Plus className="size-4" /></span>
        {tSubmit("title")}
      </Link>
    </Button>
  );
}
