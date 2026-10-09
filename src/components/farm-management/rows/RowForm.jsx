import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import useTranslation from "@/hooks/useTranslation";

// ============================
// SHARED INPUT STYLES
// ============================
const inputStyles = [
  "border-[#24382A]",
  "bg-[#0D1510]",
  "text-[#DCE4DE]",
  "placeholder:text-[#647466]",
  "focus-visible:border-[#77FF00]/40",
  "focus-visible:ring-[#77FF00]/15",
  "disabled:cursor-not-allowed",
  "disabled:opacity-50",
].join(" ");

// ============================
// ROW FORM COMPONENT
// ============================
function RowForm({ form, onChange, disabled = false }) {
  const { t } = useTranslation();

  // ============================
  // HANDLE INPUT CHANGE
  // ============================
  const handleChange = (event) => {
    const { name, value } = event.target;

    onChange?.(name, value);
  };

  return (
    <div className="space-y-5">
      {/* ============================
          ROW NAME
         ============================ */}
      <div className="space-y-2">
        <Label htmlFor="row-name" className="text-xs text-[#ACB9AE]">
          {t("farmRows.rowName")}

          <span className="ml-1 text-[#77FF00]" aria-hidden="true">
            *
          </span>
        </Label>

        <Input
          id="row-name"
          name="name"
          type="text"
          value={form.name ?? ""}
          onChange={handleChange}
          placeholder={t("farmRows.namePlaceholder")}
          disabled={disabled}
          required
          autoFocus
          className={inputStyles}
        />
      </div>

      {/* ============================
          ROW LOCATION
         ============================ */}
      <div className="space-y-2">
        <Label htmlFor="row-location" className="text-xs text-[#ACB9AE]">
          {t("farm.location")}
        </Label>

        <Input
          id="row-location"
          name="location"
          type="text"
          value={form.location ?? ""}
          onChange={handleChange}
          placeholder={t("farmRows.locationPlaceholder")}
          disabled={disabled}
          className={inputStyles}
        />
      </div>

      {/* ============================
          CAPACITY & SORT ORDER
         ============================ */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* CAPACITY */}
        <div className="space-y-2">
          <Label htmlFor="row-capacity" className="text-xs text-[#ACB9AE]">
            {t("farm.capacity")}
          </Label>

          <Input
            id="row-capacity"
            name="capacity"
            type="number"
            min="0"
            step="1"
            value={form.capacity ?? ""}
            onChange={handleChange}
            placeholder="0"
            disabled={disabled}
            aria-describedby="row-capacity-hint"
            className={inputStyles}
          />

          <p
            id="row-capacity-hint"
            className="text-[11px] leading-relaxed text-[#738477]"
          >
            {t("farmRows.capacityHint")}
          </p>
        </div>

        {/* SORT ORDER */}
        <div className="space-y-2">
          <Label htmlFor="row-sort-order" className="text-xs text-[#ACB9AE]">
            {t("farm.sortOrder")}
          </Label>

          <Input
            id="row-sort-order"
            name="sortOrder"
            type="number"
            min="0"
            step="1"
            value={form.sortOrder ?? ""}
            onChange={handleChange}
            placeholder="0"
            disabled={disabled}
            aria-describedby="row-sort-order-hint"
            className={inputStyles}
          />

          <p
            id="row-sort-order-hint"
            className="text-[11px] leading-relaxed text-[#738477]"
          >
            {t("farmRows.sortOrderHint")}
          </p>
        </div>
      </div>

      {/* ============================
          DESCRIPTION
         ============================ */}
      <div className="space-y-2">
        <Label htmlFor="row-description" className="text-xs text-[#ACB9AE]">
          {t("farm.descriptionLabel")}
        </Label>

        <Textarea
          id="row-description"
          name="description"
          value={form.description ?? ""}
          onChange={handleChange}
          placeholder={t("farmRows.descriptionPlaceholder")}
          disabled={disabled}
          rows={4}
          className={`${inputStyles} min-h-24 resize-y`}
        />
      </div>
    </div>
  );
}

export default RowForm;
