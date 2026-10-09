import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import { BOX_ADMIN_STATUS_OPTIONS } from "@/constants/boxStatuses";

import useTranslation from "@/hooks/useTranslation";

import { translateFarmStatus } from "@/utils/farmTranslations";

// ============================
// BOX STATUS COLORS
// ============================
const statusColors = {
  empty: "text-[#8C9A90] bg-[#8C9A90]",
  active: "text-[#77FF00] bg-[#77FF00]",
  occupied: "text-[#77FF00] bg-[#77FF00]",
  molting: "text-[#8EE7FF] bg-[#8EE7FF]",
  quarantine: "text-[#FF7B7B] bg-[#FF7B7B]",
  maintenance: "text-[#A8A8A8] bg-[#A8A8A8]",
  harvested: "text-[#BD9CFF] bg-[#BD9CFF]",
  watch: "text-[#E4B85D] bg-[#E4B85D]",
};

function BoxForm({ form, onChange, disabled = false, isOccupied = false }) {
  const { t } = useTranslation();

  // ============================
  // HANDLE INPUT CHANGE
  // ============================
  const handleChange = (event) => {
    const { name, value } = event.target;

    onChange(name, value);
  };

  // ============================
  // NORMALIZED BOX STATUS
  // ============================
  const status = String(form.status ?? "empty")
    .trim()
    .toLowerCase();

  // Keep status colors based on API values.
  const color = statusColors[status] ?? statusColors.empty;

  const dotColor = color.split(" ")[1];

  // Translate only the displayed status.
  const translatedStatus = translateFarmStatus(
    form.status ?? "empty",
    t,
    "box",
  );

  return (
    <div className="space-y-5">
      {/* ============================
          BOX CODE
         ============================ */}
      <div className="space-y-2">
        <Label htmlFor="box-code" className="text-xs text-[#ACB9AE]">
          {t("farm.boxCode")}

          <span className="ml-1 text-[#77FF00]" aria-hidden="true">
            *
          </span>
        </Label>

        <Input
          id="box-code"
          name="code"
          type="text"
          value={form.code ?? ""}
          onChange={handleChange}
          disabled={disabled}
          placeholder="BOX-0001"
          required
          className={[
            "border-[#24382A] bg-[#0D1510]",
            "text-[#DCE4DE]",
            "placeholder:text-[#647466]",
            "focus-visible:border-[#77FF00]/40",
            "focus-visible:ring-[#77FF00]/15",
          ].join(" ")}
        />
      </div>

      {/* ============================
          BOX STATUS
         ============================ */}
      <div className="space-y-2">
        <Label htmlFor="box-status" className="text-xs text-[#ACB9AE]">
          {t("farm.status")}
        </Label>

        {isOccupied ? (
          /* ============================
              OCCUPIED BOX
              STATUS IS READ ONLY
             ============================ */
          <div
            id="box-status"
            className="flex min-h-11 flex-wrap items-center gap-2 rounded-lg border border-[#24382A] bg-[#0D1510] px-3 py-2"
            aria-label={`${t("farmBoxes.currentStatus")}: ${translatedStatus}`}
          >
            {/* STATUS COLOR DOT */}
            <span
              className={["h-2 w-2 shrink-0 rounded-full", dotColor].join(" ")}
              aria-hidden="true"
            />

            {/* TRANSLATED STATUS */}
            <Badge
              variant="outline"
              className="border-[#24382A] text-[#DCE4DE]"
            >
              {translatedStatus}
            </Badge>

            {/* WORKFLOW EXPLANATION */}
            <span className="text-[11px] leading-relaxed text-[#738477]">
              {t("farm.boxWorkflowManaged")}
            </span>
          </div>
        ) : (
          /* ============================
              ADMIN STATUS SELECT
             ============================ */
          <select
            id="box-status"
            name="status"
            value={form.status ?? ""}
            onChange={handleChange}
            disabled={disabled}
            className={[
              "flex h-10 w-full rounded-lg border",
              "border-[#24382A] bg-[#0D1510]",
              "px-3 text-sm text-[#DCE4DE]",
              "outline-none",
              "focus:border-[#77FF00]/40",
              "focus:ring-2 focus:ring-[#77FF00]/15",
              "disabled:cursor-not-allowed",
              "disabled:opacity-50",
            ].join(" ")}
          >
            {BOX_ADMIN_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {translateFarmStatus(option.value, t, "box")}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}

export default BoxForm;
