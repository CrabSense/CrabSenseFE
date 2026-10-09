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
].join(" ");

function AreaForm({ form, onChange, disabled = false }) {
  const { t } = useTranslation();

  // ============================
  // HANDLE INPUT CHANGE
  // ============================
  const handleChange = (event) => {
    const { name, value } = event.target;
    onChange(name, value);
  };

  return (
    <div className="space-y-5">
      {/* ============================
          AREA NAME
         ============================ */}
      <div className="space-y-2">
        <Label htmlFor="area-name" className="text-xs text-[#ACB9AE]">
          {t("farmAreas.areaName")}
          <span className="ml-1 text-[#77FF00]" aria-hidden="true">
            *
          </span>
        </Label>

        <Input
          id="area-name"
          name="name"
          type="text"
          value={form.name ?? ""}
          onChange={handleChange}
          placeholder={t("farmAreas.namePlaceholder")}
          disabled={disabled}
          autoFocus
          required
          className={inputStyles}
        />
      </div>

      {/* ============================
          LOCATION & REGION
         ============================ */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* LOCATION */}
        <div className="space-y-2">
          <Label htmlFor="area-location" className="text-xs text-[#ACB9AE]">
            {t("farm.location")}
          </Label>

          <Input
            id="area-location"
            name="location"
            type="text"
            value={form.location ?? ""}
            onChange={handleChange}
            placeholder={t("farmAreas.locationPlaceholder")}
            disabled={disabled}
            className={inputStyles}
          />
        </div>

        {/* REGION */}
        <div className="space-y-2">
          <Label htmlFor="area-region" className="text-xs text-[#ACB9AE]">
            {t("farm.region")}
          </Label>

          <Input
            id="area-region"
            name="region"
            type="text"
            value={form.region ?? ""}
            onChange={handleChange}
            placeholder={t("farmAreas.regionPlaceholder")}
            disabled={disabled}
            className={inputStyles}
          />
        </div>
      </div>

      {/* ============================
          ADDRESS
         ============================ */}
      <div className="space-y-2">
        <Label htmlFor="area-address" className="text-xs text-[#ACB9AE]">
          {t("farm.address")}
        </Label>

        <Input
          id="area-address"
          name="address"
          type="text"
          value={form.address ?? ""}
          onChange={handleChange}
          placeholder={t("farmAreas.addressPlaceholder")}
          disabled={disabled}
          className={inputStyles}
        />
      </div>

      {/* ============================
          AREA SIZE & ESTABLISHED DATE
         ============================ */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* AREA SIZE */}
        <div className="space-y-2">
          <Label htmlFor="area-size" className="text-xs text-[#ACB9AE]">
            {t("farm.areaSize")}

            <span className="ml-1 text-[#738477]">(m²)</span>
          </Label>

          <Input
            id="area-size"
            name="areaSquareMeters"
            type="number"
            min="0"
            step="0.01"
            value={form.areaSquareMeters ?? ""}
            onChange={handleChange}
            placeholder="0"
            disabled={disabled}
            className={inputStyles}
          />
        </div>

        {/* ESTABLISHED DATE */}
        <div className="space-y-2">
          <Label htmlFor="area-established" className="text-xs text-[#ACB9AE]">
            {t("farm.established")}
          </Label>

          <Input
            id="area-established"
            name="establishedAt"
            type="date"
            value={form.establishedAt ?? ""}
            disabled
            readOnly
            className={`${inputStyles} scheme-dark disabled:opacity-70`}
          />
        </div>
      </div>

      {/* ============================
          DESCRIPTION
         ============================ */}
      <div className="space-y-2">
        <Label htmlFor="area-description" className="text-xs text-[#ACB9AE]">
          {t("farm.descriptionLabel")}
        </Label>

        <Textarea
          id="area-description"
          name="description"
          value={form.description ?? ""}
          onChange={handleChange}
          placeholder={t("farmAreas.descriptionPlaceholder")}
          rows={4}
          disabled={disabled}
          className={`${inputStyles} min-h-24 resize-y`}
        />
      </div>
    </div>
  );
}

export default AreaForm;
