import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center px-4 py-16 sm:py-24">
      <Card className="w-full max-w-lg border-dashed border-primary/30 bg-accent/10 shadow-none">
        <CardContent className="flex flex-col items-center justify-center px-6 py-14 text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FileQuestion className="size-7" aria-hidden="true" />
          </div>
          <p className="font-serif text-5xl font-bold tabular-nums text-primary/70">
            404
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-foreground">
            {t("title")}
          </h1>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            {t("description")}
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="outline" size="sm">
              <Link href="/">{t("backHome")}</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/poems">{t("browsePoems")}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
