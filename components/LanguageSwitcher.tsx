"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/lib/navigation";
import { useTransition } from "react";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function switchLocale(next: string) {
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <div className="lang-switcher" aria-label="Language / Luqadda">
      <button
        className={`lang-btn${locale === "en" ? " active" : ""}`}
        onClick={() => switchLocale("en")}
        disabled={isPending || locale === "en"}
        lang="en"
      >
        EN
      </button>
      <span className="gov-bar-sep" aria-hidden="true">|</span>
      <button
        className={`lang-btn${locale === "so" ? " active" : ""}`}
        onClick={() => switchLocale("so")}
        disabled={isPending || locale === "so"}
        lang="so"
      >
        SO
      </button>
    </div>
  );
}
