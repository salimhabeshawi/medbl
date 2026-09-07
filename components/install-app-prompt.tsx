"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallAppPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js");
    }
    if (window.matchMedia("(min-width: 768px)").matches) return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      setVisible(true);
    };
    const handleInstalled = () => {
      setInstallEvent(null);
      setVisible(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
    setVisible(false);
  }

  if (!visible || !installEvent) return null;

  return (
    <aside className="fixed inset-x-3 bottom-3 z-50 flex items-center gap-3 rounded-xl border border-primary/25 bg-card p-3 text-card-foreground shadow-xl md:hidden">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Download className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">Install Medbl</p>
        <p className="text-xs text-muted-foreground">Add the poetry library to your home screen.</p>
      </div>
      <Button type="button" size="sm" onClick={install}>Install</Button>
      <Button type="button" variant="ghost" size="icon-sm" onClick={() => setVisible(false)} aria-label="Dismiss install prompt">
        <X className="size-4" />
      </Button>
    </aside>
  );
}
