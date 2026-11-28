import { Wifi } from "lucide-react";
import { deviceInventory } from "../../../services/monitoringInventory";
import { readingAssessment } from "../../../services/rasWaterModel";

import EnvironmentCard from "./EnvironmentCard";

import useTranslation from "@/hooks/useTranslation";

function EnvironmentGrid({ readings=[], now, areaId, devices, showDevices=true }) {
  const { t } = useTranslation();

  const inventory = deviceInventory(areaId ? devices : null);
  const devicePercentage=inventory.percentage;
  const deviceStatus=inventory.kind==="empty"?"unknown":inventory.kind;
  const deviceCountDescription=inventory.kind==="unknown"?t("monitoring.unknown"):
    inventory.kind==="empty"?t("monitoring.noRegisteredDevices"):
    t("monitoring.devicesOnlineCount").replace("{online}",String(inventory.online)).replace("{total}",String(inventory.total));

  return (
    <section
      aria-label={t("monitoring.environmentMetrics")}
      className={[
        "mb-6 grid min-w-0 gap-5",
        "grid-cols-1",
        "sm:grid-cols-2",
        "2xl:grid-cols-4",
      ].join(" ")}
    >
      <div className="col-span-full">
        <h2 className="text-lg font-semibold">Nước RAS chung cấp khu</h2>
        <p className="text-xs text-[#8C9A90]">Dữ liệu đại diện cho mọi dãy/hộp cùng khu; không đo riêng từng hộp. Không kết luận nước an toàn.</p>
        {!areaId ? <p>Chọn một khu cụ thể để xem phép đo.</p> :
          readings.length===0 ? <p>Chưa có phép đo đã xác minh.</p> : null}
        <p className="text-xs text-[#8C9A90]">NH₃/NH₄, NO₂, NO₃: xem Phân tích nước WaterBench.</p>
      </div>
      {readings.map(r=><article key={r.id} data-testid="ras-sensor" className="rounded-2xl border border-[#24382A] bg-[#0D1510] p-4 min-w-0">
        <h3 className="font-semibold break-words">{r.label} · {r.code}</h3>
        <p className="text-2xl tabular-nums">{r.value} <span className="text-sm">{r.unit}</span></p>
        {r.location&&<p className="text-xs break-words">Vị trí cảm biến: {r.location}</p>}
        <p className="text-xs">Đo: {new Date(r.measured).toLocaleString("vi-VN")}</p>
        <p className="text-xs">Nhận: {new Date(r.received).toLocaleString("vi-VN")}</p>
        <p className="text-xs">Ngưỡng: {r.min===null&&r.max===null?"Chưa cấu hình": [r.min===null?null:"≥ "+r.min,r.max===null?null:"≤ "+r.max].filter(Boolean).join(" · ")+" "+r.unit}</p>
        <p className="text-sm text-[#DCE7DE]">{readingAssessment(r,now)}</p>
      </article>)}

      {/* IOT DEVICES ONLINE */}
      {showDevices && <EnvironmentCard
        index={3}
        icon={Wifi}
        label={t("monitoring.devicesOnline")}
        value={devicePercentage === null ? null : `${devicePercentage}%`}
        numericValue={devicePercentage}
        suffix="%"
        decimals={0}
        description={deviceCountDescription}
        status={deviceStatus}
      />}
    </section>
  );
}

export default EnvironmentGrid;
