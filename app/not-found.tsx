import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Folio } from "@/components/manuscript/folio";
import { Ornament } from "@/components/manuscript/ornament";

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center px-4 py-16 sm:py-24">
      <div className="manuscript-sheet w-full max-w-lg">
        <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FileQuestion className="size-7" aria-hidden="true" />
          </div>
          <Folio number={404} size="lg" />
          <h1 className="mt-3 font-serif text-2xl font-semibold text-foreground">
            {t("title")}
          </h1>
          <Ornament className="my-4 w-full max-w-32" />
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            {t("description")}
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="outline" size="sm">
              <Link href="/home">{t("backHome")}</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/poems">{t("browsePoems")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
