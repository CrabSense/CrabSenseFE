import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import useTranslation from "@/hooks/useTranslation";

function MonitoringFilters({ search, status, onSearchChange, onStatusChange }) {
  const { t } = useTranslation();

  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
      <div className="relative min-w-0 flex-1 lg:w-64">
        <Search
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[#8C9A90]"
        />

        <Input
          type="search"
          aria-label={t("monitoring.searchAria")}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t("monitoring.searchPlaceholder")}
          className={[
            "h-10 w-full pl-10",
            "border-[#24382A] bg-[#111C15]",
            "text-sm text-[#F4F7F4]",
            "placeholder:text-[#647466]",
            "focus-visible:border-[#77FF00]/50",
            "focus-visible:ring-[#77FF00]/20",
          ].join(" ")}
        />
      </div>

      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger
          aria-label={t("monitoring.filterAria")}
          className={[
            "h-10! w-full sm:w-40",
            "border-[#24382A] bg-[#111C15]",
            "text-sm text-[#F4F7F4]",
            "focus-visible:border-[#77FF00]/50",
            "focus-visible:ring-[#77FF00]/20",
          ].join(" ")}
        >
          <SelectValue placeholder={t("monitoring.allStatus")} />
        </SelectTrigger>

        <SelectContent className="border-[#24382A] bg-[#111C15] text-[#F4F7F4]">
          <SelectItem value="all">{t("monitoring.allStatus")}</SelectItem>

          <SelectItem value="healthy">{t("monitoring.healthy")}</SelectItem>

          <SelectItem value="warning">{t("monitoring.warning")}</SelectItem>

          <SelectItem value="critical">{t("monitoring.critical")}</SelectItem>

          <SelectItem value="offline">{t("monitoring.offline")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export default MonitoringFilters;
