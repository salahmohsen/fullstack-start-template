import { Check, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSwitch() {
  const { t, i18n } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button className="gap-2" size="sm" variant="outline" />}>
        <Globe size={16} />
        <span>{t("LANGUAGE")}</span>
        <Badge className="ml-1 px-1 py-0 text-xs" variant="secondary">
          {i18n?.language?.toUpperCase()}
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className="flex justify-between"
          onClick={() => i18n.changeLanguage("en")}
        >
          {t("ENGLISH")}
          {i18n.language === "en" && <Check size={16} />}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex justify-between"
          onClick={() => i18n.changeLanguage("de")}
        >
          {t("GERMAN")}
          {i18n.language === "de" && <Check size={16} />}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex justify-between"
          onClick={() => i18n.changeLanguage("pt")}
        >
          {t("PORTUGUESE")}
          {i18n.language === "pt" && <Check size={16} />}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex justify-between"
          onClick={() => i18n.changeLanguage("es")}
        >
          {t("SPANISH")}
          {i18n.language === "es" && <Check size={16} />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
