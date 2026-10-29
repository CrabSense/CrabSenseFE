import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CheckCircle2,
  Eye,
  KeyRound,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

import PageReveal from "../components/ui/PageReveal";
import EmployeeForm from "../components/farm-users/EmployeeForm";
import { farmUsersApi } from "../services/farmUsersApi";
import useSelectedArea from "../hooks/useSelectedArea";

const ROLES = ["FarmManager", "FarmStaff"];

const buttonSecondary =
  "inline-flex items-center justify-center gap-1.5 " +
  "rounded-lg border border-white/10 bg-white/[0.04] " +
  "px-3 py-2 text-xs font-medium text-[#C7D6C9] " +
  "transition-colors hover:border-[#77FF00]/25 " +
  "hover:bg-[#77FF00]/10 hover:text-[#77FF00] " +
  "disabled:cursor-not-allowed disabled:opacity-40";

const cardClass =
  "rounded-2xl border border-white/[0.08] " +
  "bg-[#101812] shadow-[0_12px_36px_rgba(0,0,0,0.12)]";

function MetricCard({ icon: Icon, label, value }) {
  return (
    <div className={`${cardClass} p-5`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-[#92A694]">
          {label}
        </p>
        <Icon size={19} className="text-[#77FF00]" />
      </div>
      <p className="mt-4 text-3xl font-bold text-[#F4F7F4]">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ active }) {
  return (
    <span
      className={
        active
          ? "inline-flex rounded-full border border-[#77FF00]/25 bg-[#77FF00]/10 px-2.5 py-1 text-xs font-medium text-[#9AFF61]"
          : "inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-[#95A798]"
      }
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function Modal({ title, onClose, children, busy }) {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#77FF00]/15 bg-[#101A13] p-5 text-[#F4F7F4] shadow-2xl sm:p-6"
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#7D9A81]">
            Employee Management
          </span>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            disabled={busy}
            className="rounded-lg p-2 text-[#A5B8A8] hover:bg-white/10 disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function FarmUsersPage({
  enableUpdateRole = false,
}) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [modalError, setModalError] = useState("");
  const [notice, setNotice] = useState("");
  const { areas, selectedAreaId } = useSelectedArea();

  const loadUsers = useCallback(async (initial = false) => {
    if (initial) setLoading(true);
    else setRefreshing(true);

    try {
      const data = await farmUsersApi.list();
      setUsers(
        Array.isArray(data)
          ? data.filter((u) => ROLES.includes(u.role))
          : []
      );
      setError("");
      return true;
    } catch (err) {
      setError(err.message || "Unable to load employees.");
      return false;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadUsers(true);
  }, [loadUsers]);

  const areaUsers = useMemo(() => {
    if (!selectedAreaId) {
      return users;
    }

    return users.filter(
      (user) => user.farmingAreaId === selectedAreaId
    );
  }, [users, selectedAreaId]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return areaUsers.filter((user) => {
      if (roleFilter !== "All" && user.role !== roleFilter) {
        return false;
      }
      if (
        statusFilter === "Active" &&
        !user.isActive
      ) {
        return false;
      }
      if (
        statusFilter === "Inactive" &&
        user.isActive
      ) {
        return false;
      }

      const content = [
        user.username,
        user.fullName,
        user.email,
        user.employeeId,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return content.includes(query);
    });
  }, [areaUsers, search, roleFilter, statusFilter]);
  const counts = useMemo(
    () => ({
      total: users.length,
      managers: users.filter(
        (u) => u.role === "FarmManager"
      ).length,
      staff: users.filter(
        (u) => u.role === "FarmStaff"
      ).length,
      active: users.filter((u) => u.isActive).length,
    }),
    [users]
  );

  function openModal(type, user = null) {
    setModal(type);
    setSelected(user);
    setPassword("");
    setModalError("");
    setNotice("");
  }

  function closeModal() {
    if (busy) return;
    setModal(null);
    setSelected(null);
    setPassword("");
    setModalError("");
  }

  async function execute(operation, successMessage) {
    if (busy) return;
    setBusy(true);
    setError("");
    setModalError("");
    setNotice("");

    try {
      await operation();
      setModal(null);
      setSelected(null);
      setPassword("");

      const reloaded = await loadUsers();
      if (reloaded) setNotice(successMessage);
    } catch (err) {
      if (modal) {
        setModalError(err.message || "Operation failed.");
      } else {
        setError(err.message || "Operation failed.");
      }
    } finally {
      setBusy(false);
    }
  }

  function saveEmployee(data) {
    if (!selected) {
      return execute(
        () => farmUsersApi.create(data),
        "Employee account created successfully."
      );
    }

    if (!enableUpdateRole) return;

    return execute(async () => {
      await farmUsersApi.update(selected.id, {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        employeeId: data.employeeId,
      });

      if (selected.role !== data.role) {
        await farmUsersApi.changeRole(
          selected.id,
          data.role
        );
      }
    }, "Employee updated successfully.");
  }

  function toggleStatus(user) {
    openModal("status", user);
  }

  function confirmStatus() {
    if (!selected) return;

    const activating = !selected.isActive;

    return execute(
      () => farmUsersApi.setStatus(selected.id, activating),
      activating
        ? "Employee account activated."
        : "Employee account deactivated."
    );
  }

  function confirmResetPassword() {
    if (!selected) return;

    if (password.length < 8) {
      setModalError(
        "New password must contain at least 8 characters."
      );
      return;
    }

    return execute(
      () => farmUsersApi.resetPassword(
        selected.id,
        password
      ),
      "Employee password reset successfully."
    );
  }

  async function viewDetails(user) {
    openModal("details", user);

    try {
      const details = await farmUsersApi.getById(user.id);
      setSelected((current) =>
        current?.id === user.id ? details : current
      );
    } catch {
      // The list already contains a usable employee summary.
    }
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1600px] space-y-6 text-[#F4F7F4]">
      <PageReveal delay={0}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#77FF00]">
              Farm Administration
            </p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Employee Management
            </h1>
            <p className="mt-2 text-sm text-[#90A493]">
              Create and manage Farm Manager and Farm Staff accounts.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => loadUsers()}
              disabled={loading || refreshing || busy}
              className={buttonSecondary}
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => openModal("create")}
              className="inline-flex items-center gap-2 rounded-xl bg-[#77FF00] px-4 py-2.5 text-sm font-bold text-[#102010] hover:bg-[#96FF47]"
            >
              <Plus size={17} />
              Create Employee
            </button>
          </div>
        </div>
      </PageReveal>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-[#77FF00]/20 bg-[#77FF00]/10 px-4 py-3 text-sm text-[#B8FF96]"
        >
          <CheckCircle2 size={17} />
          {notice}
        </div>
      )}

      <PageReveal delay={80}>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <MetricCard
            icon={UsersRound}
            label="Total Employees"
            value={counts.total}
          />
          <MetricCard
            icon={ShieldCheck}
            label="Farm Managers"
            value={counts.managers}
          />
          <MetricCard
            icon={UserRound}
            label="Farm Staff"
            value={counts.staff}
          />
          <MetricCard
            icon={CheckCircle2}
            label="Active Accounts"
            value={counts.active}
          />
        </div>
      </PageReveal>

      <PageReveal delay={140}>
        <section className={cardClass}>
          <div className="flex flex-wrap gap-3 border-b border-white/[0.07] p-4 sm:p-5">
            <div className="relative min-w-[180px] flex-1">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718775]"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search employees..."
                className="w-full rounded-xl border border-white/10 bg-[#0B120D] py-2.5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-[#6D826F] focus:border-[#77FF00]/50"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              aria-label="Filter by role"
              className="rounded-xl border border-white/10 bg-[#0B120D] px-3 py-2.5 text-sm text-[#DBE7DD]"
            >
              <option value="All">All Roles</option>
              <option value="FarmManager">Farm Manager</option>
              <option value="FarmStaff">Farm Staff</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
              className="rounded-xl border border-white/10 bg-[#0B120D] px-3 py-2.5 text-sm text-[#DBE7DD]"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[740px] text-left text-sm">
              <thead className="bg-white/[0.025] text-xs uppercase tracking-wide text-[#829787]">
                <tr>
                  <th className="px-5 py-4">Employee</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/[0.06]">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-[#A3B6A6]">
                      <LoaderCircle
                        size={24}
                        className="mx-auto mb-3 animate-spin text-[#77FF00]"
                      />
                      Loading employees...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-[#92A694]">
                      No employees found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => (
                    <tr
                      key={user.id}
                      className="transition-colors hover:bg-white/[0.025]"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[#EFF6EF]">
                          {user.fullName || user.username}
                        </p>
                        <p className="mt-1 text-xs text-[#829786]">
                          {user.username} · {user.email}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-[#C0D3C2]">
                        {user.role === "FarmManager"
                          ? "Farm Manager"
                          : "Farm Staff"}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge active={user.isActive} />
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className={buttonSecondary}
                            onClick={() => viewDetails(user)}
                            title="View details"
                          >
                            <Eye size={15} />
                            View
                          </button>

                          {enableUpdateRole && (
                            <button
                              type="button"
                              className={buttonSecondary}
                              onClick={() => openModal("edit", user)}
                            >
                              <Pencil size={15} />
                              Edit
                            </button>
                          )}

                          <button
                            type="button"
                            className={buttonSecondary}
                            onClick={() => toggleStatus(user)}
                            disabled={busy}
                          >
                            {user.isActive
                              ? "Deactivate"
                              : "Activate"}
                          </button>

                          <button
                            type="button"
                            className={buttonSecondary}
                            onClick={() => openModal("reset", user)}
                          >
                            <KeyRound size={15} />
                            Reset
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-white/[0.07] px-5 py-3 text-xs text-[#839A86]">
            Showing {filtered.length} of {users.length} employees
          </div>
        </section>
      </PageReveal>

      {modal && (
        <Modal
          title="Employee Management"
          busy={busy}
          onClose={closeModal}
        >
          {(modal === "create" || modal === "edit") && (
            <EmployeeForm
              employee={modal === "edit" ? selected : null}
              onSubmit={saveEmployee}
              onCancel={closeModal}
              loading={busy}
              areas={areas}
              selectedAreaId={selectedAreaId}
            />
          )}

          {modal === "details" && selected && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">
                Employee Details
              </h2>

              {[
                ["Full Name", selected.fullName],
                ["Username", selected.username],
                ["Email", selected.email],
                ["Role", selected.role],
                ["Phone", selected.phone],
                ["Employee ID", selected.employeeId],
                [
                  "Status",
                  selected.isActive ? "Active" : "Inactive",
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between gap-4 border-b border-white/10 py-2 text-sm"
                >
                  <span className="text-[#91A594]">
                    {label}
                  </span>
                  <span className="break-all text-right text-[#E5F0E6]">
                    {value || "—"}
                  </span>
                </div>
              ))}

              <button
                type="button"
                className={buttonSecondary}
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          )}

          {modal === "status" && selected && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold">
                {selected.isActive
                  ? "Deactivate Account"
                  : "Activate Account"}
              </h2>

              <p className="text-sm leading-6 text-[#A7BAAA]">
                {selected.isActive
                  ? `Deactivate ${selected.username}? This account should no longer be allowed to sign in.`
                  : `Activate ${selected.username}? This account will be eligible to sign in again.`}
              </p>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className={buttonSecondary}
                  onClick={closeModal}
                  disabled={busy}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={confirmStatus}
                  disabled={busy}
                  className="rounded-xl bg-[#77FF00] px-4 py-2.5 text-sm font-bold text-[#102010] disabled:opacity-50"
                >
                  {busy ? "Saving..." : "Confirm"}
                </button>
              </div>
            </div>
          )}

          {modal === "reset" && selected && (
            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                confirmResetPassword();
              }}
            >
              <h2 className="text-xl font-bold">
                Reset Password
              </h2>

              <p className="text-sm text-[#A1B4A5]">
                Set a new password for{" "}
                <strong className="text-[#F4F7F4]">
                  {selected.username}
                </strong>
                .
              </p>

              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setModalError("");
                }}
                minLength={8}
                autoComplete="new-password"
                required
                placeholder="New password (minimum 8 characters)"
                className="w-full rounded-xl border border-white/10 bg-[#0B120D] px-4 py-3 text-sm text-white outline-none focus:border-[#77FF00]/50"
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className={buttonSecondary}
                  onClick={closeModal}
                  disabled={busy}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={busy || password.length < 8}
                  className="rounded-xl bg-[#77FF00] px-4 py-2.5 text-sm font-bold text-[#102010] disabled:opacity-50"
                >
                  {busy ? "Saving..." : "Reset Password"}
                </button>
              </div>
            </form>
          )}

          {modalError && (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              {modalError}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
