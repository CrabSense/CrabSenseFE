import { Check, ChevronDown, MapPin } from "lucide-react";

import { useCallback, useEffect, useId, useRef, useState } from "react";

import useSelectedArea from "../../hooks/useSelectedArea";
import useClickOutside from "../../hooks/useClickOutside";
import useTranslation from "../../hooks/useTranslation";

// ============================================
// FARMING AREA SELECTOR
// ============================================

function FarmingAreaSelector() {
  const {
    areas,
    selectedAreaId,
    selectedArea,
    setSelectedAreaId,
    areasLoading,
    areasError,
  } = useSelectedArea();

  const { t } = useTranslation();

  // ==========================================
  // DROPDOWN STATE
  // ==========================================

  const [open, setOpen] = useState(false);

  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  const menuId = useId();

  // ==========================================
  // CLOSE DROPDOWN
  // ==========================================

  const closeDropdown = useCallback(() => {
    setOpen(false);
  }, []);

  // Close when clicking outside.
  useClickOutside(dropdownRef, closeDropdown, open);

  // ==========================================
  // KEYBOARD SUPPORT
  // ==========================================

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();

        closeDropdown();

        triggerRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, closeDropdown]);

  // ==========================================
  // CLOSE DURING LOADING OR ERROR
  // ==========================================

  useEffect(() => {
    if (areasLoading || areasError) {
      setOpen(false);
    }
  }, [areasLoading, areasError]);

  // ==========================================
  // SELECT FARMING AREA
  // ==========================================

  const handleSelect = (areaId) => {
    setSelectedAreaId(areaId);
    closeDropdown();
    triggerRef.current?.focus();
  };

  const handleToggle = () => {
    if (areasLoading || areasError) return;

    setOpen((current) => !current);
  };

  // ==========================================
  // AREA DATA
  // ==========================================

  const areaList = Array.isArray(areas) ? areas : [];

  const getAreaLabel = (area) => {
    return [area.code, area.name].filter(Boolean).join(" — ");
  };

  const selectedText = areasLoading
    ? t("areaSelector.loading")
    : selectedArea
      ? getAreaLabel(selectedArea)
      : t("areaSelector.allAreas");

  // ==========================================
  // ERROR STATE
  // ==========================================

  if (areasError) {
    return (
      <div
        role="alert"
        className={[
          "flex w-full max-w-[390px]",
          "items-center gap-2",

          "rounded-lg border",
          "border-red-500/20",
          "bg-red-500/[0.08]",

          "px-3 py-2.5",

          "text-[11px] text-red-400",
        ].join(" ")}
      >
        <MapPin size={15} className="shrink-0" aria-hidden="true" />

        <span>{t("areaSelector.loadError")}</span>
      </div>
    );
  }

  // ==========================================
  // COMPONENT
  // ==========================================

  return (
    <div
      ref={dropdownRef}
      className={[
        "group relative flex w-full",
        "min-w-0 max-w-[390px]",
        "items-center gap-2.5",

        "rounded-[11px] border",
        "px-2.5 py-2",

        "transition-[border-color,background-color,box-shadow]",
        "duration-[240ms] ease-out",

        open
          ? [
              "border-[#77FF00]/35",
              "bg-[#0E1B11]",
              "shadow-[0_0_0_1px_rgba(119,255,0,0.035),0_8px_28px_rgba(0,0,0,0.18)]",
            ].join(" ")
          : [
              "border-[#77FF00]/10",
              "bg-[#0B120D]",
              "hover:border-[#77FF00]/25",
              "hover:bg-[#0D1810]",
            ].join(" "),

        "max-[1200px]:max-w-[350px]",
        "max-[760px]:max-w-none",
      ].join(" ")}
    >
      {/* ======================================
          AREA ICON
         ====================================== */}

      <div
        className={[
          "flex h-[34px] w-[34px]",
          "shrink-0 items-center",
          "justify-center",

          "rounded-lg border",

          "transition-[background-color,border-color,color,transform]",
          "duration-[240ms] ease-out",
          "motion-reduce:transition-none",

          open
            ? [
                "border-[#77FF00]/30",
                "bg-[#77FF00]/10",
                "text-[#77FF00]",
                "scale-[1.04]",
              ].join(" ")
            : [
                "border-[#77FF00]/15",
                "bg-[#77FF00]/[0.05]",
                "text-[#77FF00]",
                "group-hover:bg-[#77FF00]/[0.08]",
              ].join(" "),
        ].join(" ")}
      >
        <MapPin
          size={16}
          aria-hidden="true"
          className={[
            "transition-transform duration-[240ms]",
            "motion-reduce:transition-none",

            open ? "-translate-y-[1px]" : "translate-y-0",
          ].join(" ")}
        />
      </div>

      {/* ======================================
          AREA SELECTOR
         ====================================== */}

      <div className="relative min-w-0 flex-1">
        {/* LABEL */}
        <span
          className={[
            "mb-0.5 block",

            "text-[8px] font-bold",
            "uppercase tracking-[1.2px]",

            "transition-colors duration-200",

            open ? "text-[#A7C49F]" : "text-[#7F9083]",
          ].join(" ")}
        >
          {t("areaSelector.label")}
        </span>

        {/* TRIGGER */}
        <button
          ref={triggerRef}
          type="button"
          onClick={handleToggle}
          disabled={areasLoading}
          aria-expanded={open}
          aria-haspopup="true"
          aria-controls={menuId}
          aria-label={t("areaSelector.label")}
          className={[
            "flex w-full min-w-0",
            "items-center justify-between",

            "gap-2 rounded-sm",

            "bg-transparent p-0",

            "text-left text-[11px]",
            "font-semibold",

            "outline-none",

            "transition-colors duration-200",

            open
              ? "text-[#77FF00]"
              : ["text-[#DCE4DE]", "hover:text-[#77FF00]"].join(" "),

            "focus-visible:ring-2",
            "focus-visible:ring-[#77FF00]/40",

            "disabled:cursor-not-allowed",
            "disabled:opacity-50",
          ].join(" ")}
        >
          <span
            className={[
              "min-w-0 truncate",
              "transition-colors duration-200",
            ].join(" ")}
          >
            {selectedText}
          </span>

          {/* ANIMATED CHEVRON */}
          <ChevronDown
            size={14}
            aria-hidden="true"
            className={[
              "shrink-0",

              "transition-[transform,color]",
              "duration-[260ms]",
              "ease-[cubic-bezier(0.22,1,0.36,1)]",

              "motion-reduce:transition-none",

              open
                ? ["rotate-180", "text-[#77FF00]"].join(" ")
                : ["rotate-0", "text-[#839185]"].join(" "),
            ].join(" ")}
          />
        </button>
      </div>

      {/* ======================================
          SELECTED AREA STATISTICS
         ====================================== */}

      {selectedArea && (
        <div
          className={[
            "flex shrink-0 items-baseline",
            "gap-1 border-l",

            "border-white/[0.08]",
            "pl-2.5",

            "max-[1200px]:hidden",
          ].join(" ")}
        >
          <strong
            className={[
              "text-xs font-bold",
              "tabular-nums",

              "text-[#77FF00]",
            ].join(" ")}
          >
            {selectedArea.boxCount ?? 0}
          </strong>

          <span
            className={[
              "text-[9px] uppercase",
              "tracking-[0.5px]",
              "text-[#829184]",
            ].join(" ")}
          >
            {t("areaSelector.boxes")}
          </span>
        </div>
      )}

      {/* ======================================
          DROPDOWN MENU
          Keep mounted for exit animation.
         ====================================== */}

      <div
        id={menuId}
        aria-hidden={!open}
        inert={!open || areasLoading}
        className={[
          "absolute left-0",
          "top-[calc(100%+12px)]",

          "z-[500]",

          "w-[360px]",
          "max-w-[calc(100vw-36px)]",

          "max-h-[330px]",
          "overflow-y-auto",

          "origin-top-left",

          "rounded-xl border",
          "border-[#77FF00]/15",

          "bg-[#090F0B]/[0.98]",

          "p-[7px]",

          "shadow-[0_20px_55px_rgba(0,0,0,0.55)]",
          "backdrop-blur-[18px]",

          // Open / close transitions.
          "transition-[opacity,transform,visibility]",
          "duration-[240ms]",
          "ease-[cubic-bezier(0.22,1,0.36,1)]",

          "motion-reduce:transition-none",

          open && !areasLoading
            ? [
                "visible",
                "pointer-events-auto",

                "translate-y-0",
                "scale-100",

                "opacity-100",
              ].join(" ")
            : [
                "invisible",
                "pointer-events-none",

                "-translate-y-1.5",
                "scale-[0.985]",

                "opacity-0",
              ].join(" "),

          "max-[760px]:w-full",
          "max-[760px]:max-w-none",
        ].join(" ")}
      >
        {/* ====================================
            ALL FARMING AREAS
           ==================================== */}

        <button
          type="button"
          onClick={() => handleSelect(null)}
          aria-current={!selectedAreaId ? "true" : undefined}
          className={[
            "group/item flex w-full",
            "items-center justify-between",

            "gap-3.5",

            "rounded-[9px] border",

            "px-3 py-[11px]",
            "text-left",

            "transition-[background-color,border-color,color,transform]",
            "duration-[180ms] ease-out",

            "motion-reduce:transition-none",

            !selectedAreaId
              ? [
                  "border-[#77FF00]/15",
                  "bg-[#77FF00]/[0.08]",
                  "text-[#77FF00]",
                ].join(" ")
              : [
                  "border-transparent",
                  "text-[#AAB5AD]",

                  "hover:border-[#77FF00]/10",
                  "hover:bg-[#77FF00]/[0.045]",
                  "hover:text-[#F4F7F4]",
                ].join(" "),

            "focus-visible:outline-none",
            "focus-visible:ring-2",
            "focus-visible:ring-[#77FF00]/40",
          ].join(" ")}
        >
          <div className="flex min-w-0 flex-col gap-1">
            <strong
              className={["truncate text-[11px]", "font-semibold"].join(" ")}
            >
              {t("areaSelector.allAreas")}
            </strong>

            <span className="text-[10px] text-[#839185]">
              {t("areaSelector.viewCompleteSystem")}
            </span>
          </div>

          {/* SELECTED ICON */}
          <span
            className={[
              "flex h-5 w-5 shrink-0",
              "items-center justify-center",

              "transition-[opacity,transform]",
              "duration-200",

              !selectedAreaId ? "scale-100 opacity-100" : "scale-75 opacity-0",
            ].join(" ")}
            aria-hidden="true"
          >
            <Check size={15} className="text-[#77FF00]" />
          </span>
        </button>

        {/* ====================================
            DIVIDER
           ==================================== */}

        <div className="mx-1 my-[5px] h-px bg-white/[0.06]" />

        {/* ====================================
            INDIVIDUAL FARMING AREAS
           ==================================== */}

        {areaList.map((area) => {
          const isSelected = area.id === selectedAreaId;

          return (
            <button
              key={area.id}
              type="button"
              onClick={() => handleSelect(area.id)}
              aria-current={isSelected ? "true" : undefined}
              className={[
                "group/item flex w-full",
                "items-center justify-between",

                "gap-3.5",

                "rounded-[9px] border",

                "px-3 py-[11px]",
                "text-left",

                "transition-[background-color,border-color,color,transform]",
                "duration-[180ms] ease-out",

                "motion-reduce:transition-none",

                isSelected
                  ? [
                      "border-[#77FF00]/15",
                      "bg-[#77FF00]/[0.08]",
                      "text-[#77FF00]",
                    ].join(" ")
                  : [
                      "border-transparent",
                      "text-[#AAB5AD]",

                      "hover:border-[#77FF00]/10",
                      "hover:bg-[#77FF00]/[0.045]",
                      "hover:text-[#F4F7F4]",
                    ].join(" "),

                "focus-visible:outline-none",
                "focus-visible:ring-2",
                "focus-visible:ring-[#77FF00]/40",
              ].join(" ")}
            >
              {/* AREA INFORMATION */}
              <div className="flex min-w-0 flex-col gap-1">
                <strong
                  className={["truncate text-[11px]", "font-semibold"].join(
                    " ",
                  )}
                >
                  {getAreaLabel(area)}
                </strong>

                <span className="text-[10px] text-[#839185]">
                  {area.boxCount ?? 0} {t("areaSelector.boxes")}
                  {" · "}
                  {area.crabCount ?? 0} {t("areaSelector.crabs")}
                </span>
              </div>

              {/* SELECTED CHECK */}
              <span
                className={[
                  "flex h-5 w-5 shrink-0",
                  "items-center justify-center",

                  "transition-[opacity,transform]",
                  "duration-200",

                  isSelected ? "scale-100 opacity-100" : "scale-75 opacity-0",
                ].join(" ")}
                aria-hidden="true"
              >
                <Check size={15} className="text-[#77FF00]" />
              </span>
            </button>
          );
        })}

        {/* ====================================
            EMPTY STATE
           ==================================== */}

        {areaList.length === 0 && (
          <div className="px-4 py-[18px] text-center text-[11px] text-[#839185]">
            {t("areaSelector.noActiveAreas")}
          </div>
        )}
      </div>
    </div>
  );
}

export default FarmingAreaSelector;
