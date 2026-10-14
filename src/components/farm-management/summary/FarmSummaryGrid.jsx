import { Boxes, Grid3X3, Map, Shell } from "lucide-react";

import FarmSummaryCard from "./FarmSummaryCard";

// ============================================
// FARM SUMMARY GRID
// ============================================

function FarmSummaryGrid({ areas = [], rows = [], boxes = [] }) {
  // ==========================================
  // SAFE DATA
  // ==========================================

  const safeAreas = Array.isArray(areas) ? areas : [];

  const safeRows = Array.isArray(rows) ? rows : [];

  const safeBoxes = Array.isArray(boxes) ? boxes : [];

  // ==========================================
  // TOTAL CRAB COUNT
  // ==========================================

  const crabCount = safeBoxes.reduce(
    (sum, box) => sum + (Number(box.crabCount) || 0),
    0,
  );

  // ==========================================
  // SUMMARY GRID
  // ==========================================

  return (
    <section
      aria-label="Farm management summary"
      className={[
        "mb-6 grid min-w-0 gap-5",
        "grid-cols-1 sm:grid-cols-2",
        "2xl:grid-cols-4",
      ].join(" ")}
    >
      {/* TOTAL FARMING AREAS */}
      <FarmSummaryCard
        index={0}
        icon={Map}
        labelKey="farm.areas"
        value={safeAreas.length}
      />

      {/* TOTAL FARMING ROWS */}
      <FarmSummaryCard
        index={1}
        icon={Grid3X3}
        labelKey="farm.rows"
        value={safeRows.length}
      />

      {/* TOTAL FARM BOXES */}
      <FarmSummaryCard
        index={2}
        icon={Boxes}
        labelKey="farm.boxes"
        value={safeBoxes.length}
      />

      {/* TOTAL CRABS */}
      <FarmSummaryCard
        index={3}
        icon={Shell}
        labelKey="farm.crabs"
        value={crabCount}
        tone="bio"
      />
    </section>
  );
}

export default FarmSummaryGrid;
