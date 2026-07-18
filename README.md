# CrabSenseFE

> Frontend **Web** (React) cho CrabSense — quản lý trại, giám sát, AI Decision Support, thu hoạch, kho đông, QR, bán hàng.

Repo này triển khai **Member 2 (Web)** theo workbook (sheet `02_Man_hinh_UI` filter **Platform = Web**).

## Vai trò

| Mục | Nội dung (Excel) |
|-----|------------------|
| Module UI | Farm, IoT monitor, Alerts, AI Decision, Harvest, Frozen, Trace, Sales, Reports, System |
| FR UI | FR-1 UI, FR-2 charts, FR-9, FR-10 UI |
| Layout | Sidebar + top bar; desktop browser = Desktop layout khi fullscreen |

## Màn hình Web chính (sheet 02_Man_hinh_UI)

### Auth & Dashboard
- `WEB-AUTH-Login` — `/login`
- `WEB-HOME-Dashboard` — `/` KPI trại + alert + AI harvest window

### Farm
- Areas / Rows / Boxes grid / Box detail (tabs Overview·Crabs·WQ·Videos·Alerts·Ops·Trace)
- Crop batches, Crabs, Crab lots
- Operation Log (`/ops/logs`) — cho ăn, thay nước, Canxi, muối, vệ sinh, lọc, điều trị

### IoT
- Water systems / zones + flow diagram
- Realtime monitoring + lịch sử WQ charts
- Device Management (ESP32 / phone: battery, RSSI, firmware)

### Cảnh báo & System
- Alerts list + resolve
- Alert thresholds
- In-App notifications + **Notification Center** (Telegram/Email/In-App/SMS)

### AI Decision Support *(không gọi “AI Detection” đơn thuần)*
- Video gallery + schedules
- Review detections, Manual Inspection, Feedback, Recommendations, Dataset (YOLO)

### Harvest / Frozen / Trace / Sales
- Harvest vouchers, Frozen lots, Trace lookup + public page `/p/{code}`
- Customers, Price lists (M/L + live + frozen)
- Sales orders (Quotation→…→Completed), Deliveries, Payments/Invoices

### Reports
- Harvest, Inventory, Sales, Mortality, Water Quality, AI Accuracy

## Prompt gen UI (sheet 10_Ghi_chu)

Lọc Excel cột Platform = **Web** → đưa từng dòng (Mã MH / Thành phần UI / Actions / API) cho AI gen wireframe + React components.

## Stack đề xuất

- React + Vite + TypeScript
- React Router, TanStack Query, chart lib
- Gọi API CrabSenseBE (`success/data` JSON)

## Liên kết

- API: [CrabSenseBE](https://github.com/CrabSense/CrabSenseBE)
- Mobile: [CrabSenseApp](https://github.com/CrabSense/CrabSenseApp)
- Edge HDF5 gateway: [CrabSenseKiosk](https://github.com/CrabSense/CrabSenseKiosk) *(không phải UI Desktop — wallboard/thu ngân làm fullscreen trên FE này)*
