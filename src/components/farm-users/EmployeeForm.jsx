
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { LoaderCircle, UserPlus, UserRoundCog } from "lucide-react";

const EMPTY_FORM = {
  username: "",
  email: "",
  password: "",
  fullName: "",
  role: "FarmStaff",
  phone: "",
  farmingAreaId: "",
};

const inputClass =
  "w-full rounded-xl border border-white/10 " +
  "bg-[#0B120D] px-4 py-3 text-sm text-[#F4F7F4] " +
  "placeholder:text-[#718376] outline-none " +
  "transition-colors focus:border-[#77FF00]/60 " +
  "disabled:cursor-not-allowed disabled:opacity-50";

const labelClass =
  "mb-1.5 block text-xs font-semibold text-[#B7C8B9]";

export default function EmployeeForm({
  employee = null,
  onSubmit,
  onCancel,
  loading = false,
  areas = [],
  selectedAreaId = null,
}) {
  const isEdit = Boolean(employee);
  const [form, setForm] = useState(EMPTY_FORM);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    setForm(
      employee
        ? {
          username: employee.username || "",
          email: employee.email || "",
          password: "",
          fullName: employee.fullName || "",
          role: employee.role || "FarmStaff",
          phone: employee.phone || "",
          employeeId: employee.employeeId || "",
          farmingAreaId: "",
        }
        : { ...EMPTY_FORM }
    );

    setValidationError("");
  }, [employee]);

  useEffect(() => {
    if (employee || form.farmingAreaId || !selectedAreaId) {
      return;
    }

    const selectedAreaExists = areas.some(
      (area) => area.id === selectedAreaId
    );

    if (!selectedAreaExists) {
      return;
    }

    // Chỉ điền khu mặc định khi trường này còn trống; không thay lựa chọn người dùng.
    setForm((current) =>
      current.farmingAreaId
        ? current
        : { ...current, farmingAreaId: selectedAreaId }
    );
  }, [employee, areas, selectedAreaId, form.farmingAreaId]);

  function change(field, value) {
    setValidationError("");
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;

    if (
      !form.fullName.trim() ||
      !form.email.trim() ||
      (!isEdit && !form.username.trim())
    ) {
      setValidationError("Please fill in all required fields.");
      return;
    }

    if (!isEdit && form.password.length < 8) {
      setValidationError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (!["FarmManager", "FarmStaff"].includes(form.role)) {
      setValidationError("Invalid employee role.");
      return;
    }

    if (isEdit) {
      onSubmit({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        employeeId: form.employeeId.trim() || null,
        role: form.role,
      });
      return;
    }

    //Kiểm tra và gửi ID khu
    if (!isEdit && !form.farmingAreaId) {
      setValidationError("Please select a farming area.");
      return;
    }

    onSubmit({
      username: form.username.trim(),
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role,
      farmingAreaId: form.farmingAreaId,

    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#77FF00]/20 bg-[#77FF00]/10 text-[#77FF00]">
          {isEdit ? (
            <UserRoundCog size={22} />
          ) : (
            <UserPlus size={22} />
          )}
        </div>

        <div>
          <h2 className="text-lg font-bold text-[#F4F7F4]">
            {isEdit ? "Edit Employee" : "Create Employee"}
          </h2>
          <p className="text-xs text-[#91A395]">
            {isEdit
              ? "Update employee information."
              : "Create a Farm Manager or Farm Staff account."}
          </p>
        </div>
      </div>

      {/* Chọn khu nuôi được gán cho tài khoản nhân viên */}
      {!isEdit && (
        <div>
          <label htmlFor="emp-farming-area" className={labelClass}>
            Khu vực nuôi *
          </label>

          <select
            id="emp-farming-area"
            className={inputClass}
            value={form.farmingAreaId}
            onChange={(e) => change("farmingAreaId", e.target.value)}
            required
            disabled={loading || areas.length === 0}
          >
            <option value="">Chọn khu vực nuôi</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.code} — {area.name}
              </option>
            ))}
          </select>

          {areas.length === 0 && (
            <p className="mt-1.5 text-xs text-amber-300">
              Tài khoản hiện chưa có khu vực nuôi được gán.
            </p>
          )}
        </div>
      )}
      {!isEdit && (
        <div>
          <label htmlFor="emp-username" className={labelClass}>
            Username *
          </label>
          <input
            id="emp-username"
            className={inputClass}
            value={form.username}
            onChange={(e) => change("username", e.target.value)}
            autoComplete="off"
            maxLength={100}
            required
            disabled={loading}
          />
        </div>
      )}

      <div>
        <label htmlFor="emp-name" className={labelClass}>
          Full Name *
        </label>
        <input
          id="emp-name"
          className={inputClass}
          value={form.fullName}
          onChange={(e) => change("fullName", e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="emp-email" className={labelClass}>
          Email *
        </label>
        <input
          id="emp-email"
          type="email"
          className={inputClass}
          value={form.email}
          onChange={(e) => change("email", e.target.value)}
          required
          disabled={loading}
        />
      </div>

      {!isEdit && (
        <div>
          <label htmlFor="emp-password" className={labelClass}>
            Initial Password *
          </label>
          <input
            id="emp-password"
            type="password"
            autoComplete="new-password"
            className={inputClass}
            value={form.password}
            onChange={(e) => change("password", e.target.value)}
            minLength={8}
            required
            disabled={loading}
          />
          <p className="mt-1.5 text-xs text-[#8C9F90]">
            Minimum 8 characters. Share credentials securely.
          </p>
        </div>
      )}

      {isEdit && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="emp-phone" className={labelClass}>
              Phone
            </label>
            <input
              id="emp-phone"
              className={inputClass}
              value={form.phone}
              onChange={(e) => change("phone", e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="emp-id" className={labelClass}>
              Employee ID
            </label>
            <input
              id="emp-id"
              className={inputClass}
              value={form.employeeId}
              onChange={(e) => change("employeeId", e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
      )}

      <div>
        <label htmlFor="emp-role" className={labelClass}>
          Employee Role *
        </label>
        <select
          id="emp-role"
          className={inputClass}
          value={form.role}
          onChange={(e) => change("role", e.target.value)}
          disabled={loading}
        >
          <option value="FarmStaff">Farm Staff</option>
          <option value="FarmManager">Farm Manager</option>
        </select>
      </div>

      {validationError && (
        <p
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
        >
          {validationError}
        </p>
      )}

      <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-xl border border-white/15 px-4 py-2.5 text-sm text-[#C0CFC2] hover:bg-white/5 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-[#77FF00] px-5 py-2.5 text-sm font-bold text-[#101B11] hover:bg-[#91FF37] disabled:opacity-50"
        >
          {loading && (
            <LoaderCircle size={16} className="animate-spin" />
          )}
          {loading
            ? "Saving..."
            : isEdit
              ? "Save Changes"
              : "Create Employee"}
        </button>
      </div>
    </form>
  );
}

EmployeeForm.propTypes = {
  employee: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  areas: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      code: PropTypes.string,
      name: PropTypes.string,
    })
  ),
  selectedAreaId: PropTypes.string,
};
