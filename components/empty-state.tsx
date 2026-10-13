import { SearchX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <Card className="border-dashed border-primary/30 bg-accent/10 shadow-none">
      <CardContent className="flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <SearchX className="size-5" aria-hidden="true" />
        </div>
        <p className="font-serif text-lg font-semibold">{title}</p>
        <span aria-hidden="true" className="my-2 font-sans text-sm text-primary/50">
          ፨
        </span>
        {description ? (
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
