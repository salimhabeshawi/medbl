"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";

const options = [
  { value: "light", key: "light", icon: Sun },
  { value: "dark", key: "dark", icon: Moon },
  { value: "system", key: "device", icon: Monitor },
];

export function ThemeToggle({
  variant = "desktop",
}: {
  variant?: "desktop" | "mobile";
}) {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("Common");
  const value = theme ?? "system";

  if (variant === "mobile") {
    return (
      <div className="space-y-2 px-4 py-2">
        <p className="text-xs font-medium uppercase text-background/60">
          {t("theme")}
        </p>
        <div className="grid grid-cols-3 gap-1 rounded-lg border border-background/15 bg-background/5 p-1">
          {options.map((option) => {
            const Icon = option.icon;
            const active = value === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setTheme(option.value)}
                className={
                  active
                    ? "flex items-center justify-center gap-1.5 rounded-md bg-background px-2 py-2 text-xs font-medium text-foreground"
                    : "flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-medium text-muted-foreground transition hover:bg-background/10"
                }
              >
                <Icon className="size-3.5" aria-hidden="true" />
                {t(option.key)}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon-sm"
          className="rounded-full border-border bg-background text-foreground"
          aria-label="Theme"
        >
          <Sun className="size-4 dark:hidden" aria-hidden="true" />
          <Moon className="hidden size-4 dark:block" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 border-border bg-popover">
        <DropdownMenuLabel>{t("theme")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={value} onValueChange={setTheme}>
          {options.map((option) => {
            const Icon = option.icon;

            return (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                <Icon className="text-primary" aria-hidden="true" />
                {t(option.key)}
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
