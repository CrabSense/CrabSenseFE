export function menuGroups(row) {
  const maintenance = row.statusKey === "maintenance" || (row.source === "sensor" && row.raw?.isActive === false);
  const offline = row.statusKey === "offline";
  const device = row.source === "device";
  const groups = [
    ["Xem", []],
    ["Cấu hình", []],
    ["Hệ thống", []],
  ];
  const add = (group, id, label, enabled, reason = "") => {
    groups.find(([name]) => name === group)[1].push({ id, label, enabled, reason });
  };

  add("Xem", "diagnostics", "Chẩn đoán", !maintenance, maintenance ? "Đang vô hiệu hóa. Chỉ xem, nhật ký và kích hoạt lại." : "");
  add("Xem", "logs", "Xem nhật ký", device, device ? "" : "Nhật ký nằm trên bộ điều khiển, chưa có API riêng cho sensor.");

  if (row.type === "camera") {
    add("Xem", "preview", "Xem trực tiếp", true);
    add(
      "Xem",
      "rtsp",
      "Kiểm tra luồng RTSP",
      device && !maintenance && !offline && Boolean(row.raw.streamUrl),
      !row.raw.streamUrl ? "Chưa có stream URL." : offline ? "Thiết bị offline. Lệnh cần kết nối đang khóa." : "",
    );
    add("Xem", "recording", "Chuyển sang trang ghi hình", true);
  }
  if (row.type === "sensor") {
    add("Xem", "latest", "Xem dữ liệu mới nhất", true);
    add("Xem", "abnormal", "Kiểm tra dữ liệu bất thường", !maintenance);
    add("Xem", "mqtt", "Kiểm tra MQTT", false, "API chưa có kiểm tra MQTT.");
  }
  if (row.type === "controller") {
    add("Xem", "io", "Xem danh sách Input/Output", true);
    add("Xem", "relay", "Kiểm tra trạng thái relay", true, "Chỉ đọc. Không bật hoặc tắt relay.");
    add("Xem", "actuators", "Kiểm tra actuator liên kết", true);
    add("Xem", "heartbeat", "Kiểm tra heartbeat", !maintenance);
  }

  add("Cấu hình", "assign", "Gán vị trí", device && !maintenance, device ? "" : "Sensor được gắn vào bộ điều khiển khi tạo.");
  add(
    "Cấu hình",
    "firmware",
    "Cập nhật firmware",
    device && !maintenance,
    device ? "Ghi phiên bản trên server. API chưa tải file firmware." : "Sensor không có phiên bản firmware.",
  );
  add("Cấu hình", "copy", "Sao chép cấu hình", !maintenance, "Chỉ sao chép thông số. Không sao chép mã, IP hoặc MAC.");
  if (row.type === "camera") add("Cấu hình", "stream", "Chỉnh thông số stream", device && !maintenance);
  if (row.type === "sensor") {
    add("Cấu hình", "calibrate", "Hiệu chuẩn cảm biến", !maintenance, "Chỉnh ngưỡng min/max đang lưu trên server.");
    add("Cấu hình", "sample", "Chỉnh chu kỳ lấy mẫu", false, "API chưa có chu kỳ lấy mẫu.");
  }
  if (row.type === "controller") add("Cấu hình", "mapping", "Xem ánh xạ I/O", true, "Chỉ đọc kênh relay đã lưu.");

  add(
    "Hệ thống",
    "restart",
    "Khởi động lại",
    device && !maintenance,
    !device ? "Sensor không nhận lệnh restart." : offline ? "Lệnh được xếp hàng cho đến khi thiết bị nhận." : "",
  );
  add("Hệ thống", maintenance ? "enable" : "disable", maintenance ? "Kích hoạt" : "Vô hiệu hóa", true);
  add("Hệ thống", "remove", "Gỡ thiết bị", true, "Cần xác nhận. Sensor và actuator gắn sẽ được tách ra.");

  return groups;
}
