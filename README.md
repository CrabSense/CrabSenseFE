# CrabSense Frontend

Hệ thống giám sát chất lượng nước cho nuôi trồng cua biển.

## Tính năng

- 📊 Dashboard hiển thị thông số chất lượng nước theo thời gian thực
- 🔍 Giám sát các thông số: nhiệt độ, pH, oxy hòa tan, độ mặn
- 📈 Phân tích và báo cáo dữ liệu lịch sử
- ⚠️ Cảnh báo khi thông số vượt ngưỡng an toàn
- ⚙️ Cài đặt tùy chỉnh giao diện và tần suất cập nhật

## Công nghệ sử dụng

- **React 18** - Thư viện UI
- **Vite** - Build tool và dev server
- **ESLint** - Linting
- **CSS3** - Styling

## Cài đặt

1. Clone repository:

```bash
git clone <repository-url>
cd CrabSenseFE
```

2. Cài đặt dependencies:

```bash
npm install
```

3. Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

4. Chạy development server:

```bash
npm run dev
```

5. Mở trình duyệt tại `http://localhost:5173`

## Scripts

- `npm run dev` - Chạy development server
- `npm run build` - Build production
- `npm run preview` - Preview production build
- `npm run lint` - Chạy ESLint

## Cấu trúc thư mục

```
src/
├── assets/          # Hình ảnh, icons, SVG
├── components/      # React components tái sử dụng
├── pages/          # Các trang chính
├── services/       # API services và data fetching
├── styles/         # CSS files
└── utils/          # Utility functions và constants
```

## API Integration

Ứng dụng kết nối với backend API để lấy dữ liệu chất lượng nước. Cấu hình URL API trong file `.env`:

```
VITE_API_BASE_URL=http://localhost:3000/api
```

## License

MIT

> Frontend **Web** (React) cho CrabSense — quản lý trại, giám sát, AI Decision Support, thu hoạch, kho đông, QR, bán hàng.

Repo này triển khai **Member 2 (Web)** theo workbook (sheet `02_Man_hinh_UI` filter **Platform = Web**).

## Vai trò

| Mục       | Nội dung (Excel)                                                                       |
| --------- | -------------------------------------------------------------------------------------- |
| Module UI | Farm, IoT monitor, Alerts, AI Decision, Harvest, Frozen, Trace, Sales, Reports, System |
| FR UI     | FR-1 UI, FR-2 charts, FR-9, FR-10 UI                                                   |
| Layout    | Sidebar + top bar; desktop browser = Desktop layout khi fullscreen                     |

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

### AI Decision Support _(không gọi “AI Detection” đơn thuần)_

- Video gallery + schedules
- Review detections, Manual Inspection, Feedback, Recommendations, Dataset (YOLO)

### Harvest / Frozen / Trace / Sales (văn phòng — không chạy trên Kiosk trại)

- Harvest vouchers, Frozen lots, Trace lookup + public page `/p/{code}`
- Customers, Price lists (M/L + live + frozen)
- Sales orders (Quotation→…→Completed), Deliveries
- **Payments / Invoices** (`payment_status`: unpaid|partial|paid|overdue — không cần cổng TT online)
- Reports: Harvest, Inventory, Sales, Mortality, Water Quality, AI Accuracy

> Máy **Kiosk tại trại** chỉ edge HDF5 (IoT+AI → BE). Thanh toán/hóa đơn chỉ trên **FE (+ App bán nhanh nếu cần)**.

## Prompt gen UI (sheet 10_Ghi_chu)

Lọc Excel cột Platform = **Web** → đưa từng dòng (Mã MH / Thành phần UI / Actions / API) cho AI gen wireframe + React components.

## Stack đề xuất

- React + Vite + TypeScript
- React Router, TanStack Query, chart lib
- Gọi API CrabSenseBE (`success/data` JSON)

## Liên kết

- API: [CrabSenseBE](https://github.com/CrabSense/CrabSenseBE)
- Mobile: [CrabSenseApp](https://github.com/CrabSense/CrabSenseApp)
- Edge HDF5 gateway (trại nuôi): [CrabSenseKiosk](https://github.com/CrabSense/CrabSenseKiosk) — **không** chứa UI thanh toán/hóa đơn
- Wallboard / thu ngân / bán hàng PC: fullscreen trên **repo này (FE)**
