import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api/client";

/* ============================================================
   Inline sub-components (kept in this file on purpose)
   ============================================================ */

function Modal({ title, onClose, children }) {
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div
                className="modal"
                role="dialog"
                aria-modal="true"
                aria-label={title}
                onClick={(e) => e.stopPropagation()}
            >
                <header className="modal-head">
                    <h3>{title}</h3>
                    <button
                        type="button"
                        className="modal-close"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </header>
                <div className="modal-body">{children}</div>
            </div>
        </div>
    );
}

function ConfirmDialog({ title, message, confirmLabel = "Confirm", danger, onCancel, onConfirm }) {
    return (
        <Modal title={title} onClose={onCancel}>
            <p>{message}</p>
            <div className="form-actions">
                <button type="button" className="btn-ghost" onClick={onCancel}>
                    Cancel
                </button>
                <button
                    type="button"
                    className={danger ? "btn-ghost danger" : ""}
                    onClick={onConfirm}
                >
                    {confirmLabel}
                </button>
            </div>
        </Modal>
    );
}

function EditServiceModal({ service, onClose, onSaved }) {
    const [form, setForm] = useState({
        name: service.name,
        description: service.description || "",
        price: service.price,
        duration: service.duration,
    });
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const set = (field) => (e) =>
        setForm((f) => ({ ...f, [field]: e.target.value }));

    async function submit(e) {
        e.preventDefault();
        setError("");

        if (!form.name.trim()) return setError("Name is required.");
        if (Number(form.price) <= 0) return setError("Price must be greater than 0.");
        if (Number(form.duration) <= 0) return setError("Duration must be greater than 0.");

        setSaving(true);
        try {
            const data = await apiFetch(`/api/services/${service.id}`, {
                method: "PUT",
                body: JSON.stringify({
                    name: form.name.trim(),
                    description: form.description,
                    price: Number(form.price),
                    duration: Number(form.duration),
                    active: service.active,
                }),
            });
            onSaved(data.service);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <Modal title="Edit service" onClose={onClose}>
            <form onSubmit={submit} className="form-grid">
                <label>
                    <span>Name</span>
                    <input value={form.name} onChange={set("name")} />
                </label>
                <label>
                    <span>Description</span>
                    <input value={form.description} onChange={set("description")} />
                </label>
                <label>
                    <span>Price (€)</span>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.price}
                        onChange={set("price")}
                    />
                </label>
                <label>
                    <span>Duration (min)</span>
                    <input
                        type="number"
                        min="1"
                        value={form.duration}
                        onChange={set("duration")}
                    />
                </label>

                {error && <p className="alert">{error}</p>}

                <div className="form-actions">
                    <button type="button" className="btn-ghost" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="submit" disabled={saving}>
                        {saving ? "Saving…" : "Save"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
function AddServiceModal({ onClose, onAdded }) {
    const [form, setForm] = useState({
        name: "",
        description: "",
        price: "",
        duration: "",
    });
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const set = (field) => (e) =>
        setForm((f) => ({ ...f, [field]: e.target.value }));

    async function submit(e) {
        e.preventDefault();
        setError("");

        if (!form.name.trim()) return setError("Name is required.");
        if (Number(form.price) <= 0) return setError("Price must be greater than 0.");
        if (Number(form.duration) <= 0) return setError("Duration must be greater than 0.");

        setSaving(true);
        try {
            const data = await apiFetch("/api/services", {
                method: "POST",
                body: JSON.stringify({
                    name: form.name.trim(),
                    description: form.description,
                    price: Number(form.price),
                    duration: Number(form.duration),
                }),
            });
            onAdded(data.service);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <Modal title="Add service" onClose={onClose}>
            <form onSubmit={submit} className="form-grid">
                <label>
                    <span>Name</span>
                    <input
                        autoFocus
                        value={form.name}
                        onChange={set("name")}
                        placeholder="e.g. Haircut"
                    />
                </label>
                <label>
                    <span>Description</span>
                    <input
                        value={form.description}
                        onChange={set("description")}
                        placeholder="Optional"
                    />
                </label>
                <label>
                    <span>Price (€)</span>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.price}
                        onChange={set("price")}
                        placeholder="12"
                    />
                </label>
                <label>
                    <span>Duration (min)</span>
                    <input
                        type="number"
                        min="1"
                        value={form.duration}
                        onChange={set("duration")}
                        placeholder="25"
                    />
                </label>

                {error && <p className="alert">{error}</p>}

                <div className="form-actions">
                    <button type="button" className="btn-ghost" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="submit" disabled={saving}>
                        {saving ? "Saving…" : "Add service"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
function AddDayOffModal({ onClose, onAdded }) {
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    async function submit(e) {
        e.preventDefault();
        setError("");

        if (!start || !end) return setError("Start and end dates are required.");
        if (end < start) return setError("End date cannot be before start date.");

        setSaving(true);
        try {
            const startDate = new Date(`${start}T00:00:00`);
            const endDate = new Date(`${end}T00:00:00`);

            const dates = [];
            for (
                let current = new Date(startDate);
                current <= endDate;
                current.setDate(current.getDate() + 1)
            ) {
                const year = current.getFullYear();
                const month = String(current.getMonth() + 1).padStart(2, "0");
                const day = String(current.getDate()).padStart(2, "0");
                dates.push(`${year}-${month}-${day}`);
            }

            await Promise.all(
                dates.map((date) =>
                    apiFetch("/api/days-off", {
                        method: "POST",
                        body: JSON.stringify({ date, reason }),
                    })
                )
            );

            onAdded(dates.length);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <Modal title="Add days off" onClose={onClose}>
            <form onSubmit={submit} className="form-grid">
                <label>
                    <span>Start date</span>
                    <input
                        type="date"
                        autoFocus
                        value={start}
                        onChange={(e) => setStart(e.target.value)}
                    />
                </label>
                <label>
                    <span>End date</span>
                    <input
                        type="date"
                        value={end}
                        min={start || undefined}
                        onChange={(e) => setEnd(e.target.value)}
                    />
                </label>
                <label className="span-2">
                    <span>Reason</span>
                    <input
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Optional"
                    />
                </label>

                {error && <p className="alert">{error}</p>}

                <div className="form-actions">
                    <button type="button" className="btn-ghost" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="submit" disabled={saving}>
                        {saving ? "Saving…" : "Add"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
const BREAK_PRESETS = [
    { label: "☕ 15 min", name: "Coffee", start: "10:00", end: "10:15" },
    { label: "🍽 Lunch 1h", name: "Lunch", start: "12:00", end: "13:00" },
    { label: "🚬 10 min", name: "Smoke", start: "15:00", end: "15:10" },
    { label: "🍽 Dinner 1h", name: "Dinner", start: "17:00", end: "18:00" },
];
function AddBreakModal({ dayNames, breaks = [], defaultDay, onClose, onAdded }) {
    const [form, setForm] = useState({
        day_of_week: defaultDay ?? 1,
        start_time: "",
        end_time: "",
        name: "",
    });
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const set = (field) => (e) =>
        setForm((f) => ({ ...f, [field]: e.target.value }));

    const applyPreset = (preset) =>
        setForm((f) => ({
            ...f,
            name: preset.name,
            start_time: preset.start,
            end_time: preset.end,
        }));

    async function submit(e) {
        e.preventDefault();
        setError("");

        if (form.day_of_week === "" || !form.start_time || !form.end_time) {
            return setError("Day, start and end time are required.");
        }
        if (form.start_time >= form.end_time) {
            return setError("Start time must be before end time.");
        }
        const alreadyExists = breaks.some(
            (b) =>
                Number(b.day_of_week) === Number(form.day_of_week) &&
                b.start_time === form.start_time &&
                b.end_time === form.end_time
        );
        if (alreadyExists) {
            setError("This break already exists on that day.");
            return;
        }
        setSaving(true);
        try {
            const data = await apiFetch("/api/breaks", {
                method: "POST",
                body: JSON.stringify({
                    day_of_week: Number(form.day_of_week),
                    start_time: form.start_time,
                    end_time: form.end_time,
                    name: form.name,
                }),
            });
            onAdded(data.break);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <Modal title="Add break" onClose={onClose}>
            <div className="preset-row">
                <span className="preset-label">Quick:</span>
                {BREAK_PRESETS.map((p) => (
                    <button
                        key={p.label}
                        type="button"
                        className="preset-chip"
                        onClick={() => applyPreset(p)}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            <form onSubmit={submit} className="form-grid">
                <label>
                    <span>Day</span>
                    <select value={form.day_of_week} onChange={set("day_of_week")}>
                        {dayNames.map((day, index) => (
                            <option key={index} value={index}>
                                {day}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    <span>Start time</span>
                    <input
                        type="time"
                        value={form.start_time}
                        onChange={set("start_time")}
                    />
                </label>
                <label>
                    <span>End time</span>
                    <input
                        type="time"
                        value={form.end_time}
                        onChange={set("end_time")}
                    />
                </label>
                <label>
                    <span>Name</span>
                    <input
                        value={form.name}
                        onChange={set("name")}
                        placeholder="e.g. Lunch"
                    />
                </label>

                {error && <p className="alert">{error}</p>}

                <div className="form-actions">
                    <button type="button" className="btn-ghost" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="submit" disabled={saving}>
                        {saving ? "Saving…" : "Add break"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}



function StatusBadge({ status }) {
    const map = {
        CONFIRMED: "pill-info",
        COMPLETED: "pill-success",
        CANCELLED: "pill-danger",
        PENDING: "pill-warn",
    };
    return (
        <span className={`pill ${map[status] || "pill-muted"}`}>
            {status}
        </span>
    );
}
const APPT_FILTERS = [
    { id: "all", label: "All" },
    { id: "upcoming", label: "Upcoming" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
];

function AppointmentFilters({ value, onChange, counts }) {
    return (
        <div className="filter-chips">
            {APPT_FILTERS.map((f) => (
                <button
                    key={f.id}
                    type="button"
                    className={`filter-chip ${value === f.id ? "is-active" : ""}`}
                    onClick={() => onChange(f.id)}
                >
                    {f.label}
                    {counts && counts[f.id] !== undefined && (
                        <span className="filter-count">{counts[f.id]}</span>
                    )}
                </button>
            ))}
        </div>
    );
}
/* ============================================================
   Main component
   ============================================================ */

function Dashboard() {
    const [message, setMessage] = useState("Loading...");
    const [messageKind, setMessageKind] = useState("error"); // "error" | "success"
    const [isOwner, setIsOwner] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [barberAppointments, setBarberAppointments] = useState([]);
    const [workingHours, setWorkingHours] = useState([]);
    const [daysOff, setDaysOff] = useState([]);

    const [breaks, setBreaks] = useState([]);

    const [services, setServices] = useState([]);

    // Modal state
    const [editingService, setEditingService] = useState(null);
    const [confirm, setConfirm] = useState(null);

    const [addingService, setAddingService] = useState(false);
    const [addingDayOff, setAddingDayOff] = useState(false);
    const [addingBreak, setAddingBreak] = useState(false);

    const [tab, setTab] = useState("schedule");

    const [apptFilter, setApptFilter] = useState("all");

    const TABS = [
        { id: "schedule", label: "Schedule" },
        { id: "services", label: "Services" },
        { id: "timeoff", label: "Time Off" },
        { id: "breaks", label: "Breaks" },
    ];

    // Auto-clear success messages
    useEffect(() => {
        if (!message || message === "Loading...") return;
        if (messageKind !== "success") return;
        const t = setTimeout(() => setMessage(""), 4000);
        return () => clearTimeout(t);
    }, [message, messageKind]);

    const notify = (text, kind = "success") => {
        setMessage(text);
        setMessageKind(kind);
    };
    const fail = (text) => notify(text, "error");

    /* ---------- Initial load ---------- */
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setMessage("You are not logged in.");
            setMessageKind("error");
            return;
        }

        const getDashboard = async () => {
            try {
                const data = await apiFetch("/api/auth/protected");

                setMessage("");
                setIsOwner(data.user.is_owner === true);

                if (data.user.role === "CLIENT") {
                    try {
                        const apptData = await apiFetch("/api/appointments/my");
                        setAppointments(apptData.appointments || []);
                    } catch (err) {
                        console.error(err);
                    }
                }

                if (data.user.role === "BARBER") {
                    try {
                        const whData = await apiFetch("/api/working-hours");
                        setWorkingHours(whData.working_hours || []);
                    } catch (err) {
                        fail(err.message || "Failed to load working hours.");
                        return;
                    }

                    try {
                        const svcData = await apiFetch("/api/services");
                        setServices(svcData.services || []);
                    } catch (err) {
                        console.error(err);
                    }

                    try {
                        const baData = await apiFetch("/api/appointments/barber");
                        setBarberAppointments(baData.appointments || []);
                    } catch (err) {
                        console.error(err);
                    }
                }
            } catch (error) {
                console.error(error);
                fail("Unable to connect to the server.");
            }
        };

        getDashboard();
    }, []);

    /* ---------- Load days off + breaks (barber) ---------- */
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        (async () => {
            try {
                const data = await apiFetch("/api/days-off");
                setDaysOff(data.days_off || []);
            } catch (err) {
                console.error(err);
            }
        })();

        (async () => {
            try {
                const data = await apiFetch("/api/breaks");
                setBreaks(data.breaks || []);
            } catch (err) {
                console.error(err);
            }
        })();
    }, []);

    /* ---------- Services ---------- */

    const handleToggleService = async (service) => {
        try {
            const data = await apiFetch(`/api/services/${service.id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ active: !service.active }),
            });
            setServices((cur) =>
                cur.map((item) => (item.id === service.id ? data.service : item))
            );
        } catch (err) {
            console.error(err);
            fail(err.message || "Unable to connect to the server.");
        }
    };
    const handleDeleteService = (service) => {
        setConfirm({
            title: `Delete "${service.name}"?`,
            message:
                "This cannot be undone. Existing appointments using this service will not be affected, but new bookings won't see it anymore.",
            confirmLabel: "Delete service",
            danger: true,
            onConfirm: async () => {
                try {
                    await apiFetch(`/api/services/${service.id}`, {
                        method: "DELETE",
                    });
                    setServices((cur) =>
                        cur.filter((s) => s.id !== service.id)
                    );
                    notify("Service deleted.");
                } catch (err) {
                    console.error(err);
                    fail(err.message || "Unable to delete service.");
                }
            },
        });
    };
    /* ---------- Days off ---------- */
    const getDaysOff = async () => {
        try {
            const data = await apiFetch("/api/days-off");
            setDaysOff(data.days_off || []);
        } catch (err) {
            console.error(err);
            fail(err.message || "Unable to connect to the server.");
        }
    };


    const handleRemoveDayOff = (ids) => {
        setConfirm({
            title: "Remove day off?",
            message: "Are you sure you want to remove this day off?",
            confirmLabel: "Remove",
            danger: true,
            onConfirm: async () => {
                try {
                    await Promise.all(
                        ids.map((id) =>
                            apiFetch(`/api/days-off/${id}`, { method: "DELETE" })
                        )
                    );
                    setDaysOff((cur) => cur.filter((d) => !ids.includes(d.id)));
                    notify("Day off removed successfully.");
                } catch (err) {
                    console.error(err);
                    fail(err.message || "Unable to connect to the server.");
                }
            },
        });
    };

    /* ---------- Breaks ---------- */


    const handleRemoveBreak = (breakId) => {
        setConfirm({
            title: "Remove break?",
            message: "Are you sure you want to remove this break?",
            confirmLabel: "Remove",
            danger: true,
            onConfirm: async () => {
                try {
                    await apiFetch(`/api/breaks/${breakId}`, { method: "DELETE" });
                    setBreaks((cur) => cur.filter((b) => b.id !== breakId));
                    notify("Break removed successfully.");
                } catch (err) {
                    console.error(err);
                    fail(err.message || "Unable to connect to the server.");
                }
            },
        });
    };

    /* ---------- Working hours ---------- */
    const handleWorkingHoursChange = (dayOfWeek, field, value) => {
        setWorkingHours((cur) =>
            cur.map((day) =>
                Number(day.day_of_week) === Number(dayOfWeek)
                    ? { ...day, [field]: value }
                    : day
            )
        );
    };

    const handleWorkingDayToggle = (dayOfWeek) => {
        setWorkingHours((cur) =>
            cur.map((day) =>
                Number(day.day_of_week) === Number(dayOfWeek)
                    ? { ...day, is_working: !day.is_working }
                    : day
            )
        );
    };
    const handleCopyRowToAll = (dayOfWeek) => {
        setWorkingHours((cur) => {
            const source = cur.find(
                (d) => Number(d.day_of_week) === Number(dayOfWeek)
            );
            if (!source) return cur;

            return cur.map((d) =>
                Number(d.day_of_week) === Number(dayOfWeek)
                    ? d
                    : {
                        ...d,
                        start_time: source.start_time,
                        end_time: source.end_time,
                        is_working: source.is_working,
                    }
            );
        });
    };
    const handleCopyBreakToAll = (breakItem) => {
        setConfirm({
            title: "Copy break to all days?",
            message: `This will add "${breakItem.name || "break"}" (${breakItem.start_time.slice(0, 5)} – ${breakItem.end_time.slice(0, 5)}) to every other day of the week.`,
            confirmLabel: "Copy to all",
            onConfirm: async () => {
                try {
                    const others = [0, 1, 2, 3, 4, 5, 6].filter(
                        (d) => Number(d) !== Number(breakItem.day_of_week)
                    );

                    const results = await Promise.all(
                        others.map((day) =>
                            apiFetch("/api/breaks", {
                                method: "POST",
                                body: JSON.stringify({
                                    day_of_week: day,
                                    start_time: breakItem.start_time,
                                    end_time: breakItem.end_time,
                                    name: breakItem.name,
                                }),
                            })
                        )
                    );

                    const newBreaks = results
                        .map((r) => r.break)
                        .filter(Boolean);

                    setBreaks((cur) => [...cur, ...newBreaks]);
                    notify(`Break copied to ${newBreaks.length} days.`);
                } catch (err) {
                    console.error(err);
                    fail(err.message || "Unable to connect to the server.");
                }
            },
        });
    };
    const handleSaveWorkingHours = async () => {
        try {
            await Promise.all(
                workingHours.map((day) =>
                    apiFetch("/api/working-hours", {
                        method: "POST",
                        body: JSON.stringify({
                            day_of_week: Number(day.day_of_week),
                            start_time: day.start_time.slice(0, 5),
                            end_time: day.end_time.slice(0, 5),
                            is_working: day.is_working,
                        }),
                    })
                )
            );
            notify("Working hours saved successfully.");
        } catch (err) {
            console.error(err);
            fail(err.message || "Unable to connect to the server.");
        }
    };

    /* ---------- Appointments ---------- */
    const updateAppointmentStatus = async (appointmentId, newStatus) => {
        try {
            await apiFetch(`/api/appointments/${appointmentId}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status: newStatus }),
            });
            setBarberAppointments((prev) =>
                prev.map((a) =>
                    a.id === appointmentId ? { ...a, status: newStatus } : a
                )
            );
            notify("Appointment marked as completed.");
        } catch (err) {
            console.error(err);
            fail(err.message || "Unable to connect to the server.");
        }
    };

    const cancelAppointment = (appointmentId) => {
        setConfirm({
            title: "Cancel appointment?",
            message: "Are you sure you want to cancel this appointment?",
            confirmLabel: "Cancel appointment",
            danger: true,
            onConfirm: async () => {
                try {
                    await apiFetch(`/api/appointments/${appointmentId}/cancel`, {
                        method: "PATCH",
                    });
                    setAppointments((prev) =>
                        prev.map((a) =>
                            a.id === appointmentId ? { ...a, status: "CANCELLED" } : a
                        )
                    );
                    notify("Appointment cancelled.");
                } catch (err) {
                    console.error(err);
                    fail(err.message || "Unable to connect to the server.");
                }
            },
        });
    };

    /* ---------- Derived data ---------- */
    const dayNames = useMemo(
        () => ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        []
    );

    const groupedDaysOff = useMemo(() => {
        const grouped = [];
        const sorted = [...daysOff].sort((a, b) => a.date.localeCompare(b.date));

        sorted.forEach((dayOff) => {
            const lastGroup = grouped[grouped.length - 1];
            if (!lastGroup) {
                grouped.push({
                    startDate: dayOff.date,
                    endDate: dayOff.date,
                    reason: dayOff.reason,
                    ids: [dayOff.id],
                });
                return;
            }

            const previousDate = new Date(`${lastGroup.endDate}T00:00:00`);
            previousDate.setDate(previousDate.getDate() + 1);
            const nextDate = `${previousDate.getFullYear()}-${String(
                previousDate.getMonth() + 1
            ).padStart(2, "0")}-${String(previousDate.getDate()).padStart(2, "0")}`;

            if (nextDate === dayOff.date && lastGroup.reason === dayOff.reason) {
                lastGroup.endDate = dayOff.date;
                lastGroup.ids.push(dayOff.id);
            } else {
                grouped.push({
                    startDate: dayOff.date,
                    endDate: dayOff.date,
                    reason: dayOff.reason,
                    ids: [dayOff.id],
                });
            }
        });

        return grouped;
    }, [daysOff]);
    const breaksByDay = useMemo(() => {
        const buckets = Array.from({ length: 7 }, () => []);
        breaks.forEach((b) => {
            const day = Number(b.day_of_week);
            if (day >= 0 && day <= 6) buckets[day].push(b);
        });
        buckets.forEach((list) =>
            list.sort((a, b) => a.start_time.localeCompare(b.start_time))
        );
        return buckets;
    }, [breaks]);
    const filterAppointments = (list) => {
        if (apptFilter === "all") return list;
        if (apptFilter === "upcoming") {
            return list.filter(
                (a) => a.status === "CONFIRMED" || a.status === "PENDING"
            );
        }
        if (apptFilter === "completed") {
            return list.filter((a) => a.status === "COMPLETED");
        }
        if (apptFilter === "cancelled") {
            return list.filter((a) => a.status === "CANCELLED");
        }
        return list;
    };
    const isBarber = workingHours.length > 0;

    /* ---------- Render ---------- */
    return (
        <main className="page dashboard">
            <header className="page-hero">
                <p className="eyebrow">{isBarber ? "Barber panel" : "My account"}</p>
                <h1>Dashboard</h1>
                {isOwner && (
                    <div className="dash-actions">
                        <Link to="/dashboard/add-barber" className="btn">
                            + Add Barber
                        </Link>
                    </div>
                )}
            </header>

            {message && (
                <p className={`alert ${messageKind === "success" ? "alert-success" : ""}`}>
                    {message}
                </p>
            )}

            {/* ============ BARBER DASHBOARD ============ */}
            {isBarber && (
                <>

                    {/* Appointments */}
                    <section className="dash-section">
                        <div className="section-head">
                            <h2>Appointments</h2>
                            <span className="count-badge">
                                {barberAppointments.length}
                            </span>
                        </div>

                        <AppointmentFilters
                            value={apptFilter}
                            onChange={setApptFilter}
                            counts={{
                                all: barberAppointments.length,
                                upcoming: barberAppointments.filter(
                                    (a) => a.status === "CONFIRMED" || a.status === "PENDING"
                                ).length,
                                completed: barberAppointments.filter(
                                    (a) => a.status === "COMPLETED"
                                ).length,
                                cancelled: barberAppointments.filter(
                                    (a) => a.status === "CANCELLED"
                                ).length,
                            }}
                        />

                        {filterAppointments(barberAppointments).length === 0 ? (
                            <p className="hint">No appointments in this filter.</p>
                        ) : (
                            <div className="appt-grid">
                                {filterAppointments(barberAppointments).map((appointment) => (
                                    <article key={appointment.id} className="appt-card">
                                        <header className="appt-head">
                                            <h3>{appointment.client_name}</h3>
                                            <StatusBadge status={appointment.status} />
                                        </header>

                                        <dl className="appt-meta">
                                            <div>
                                                <dt>Email</dt>
                                                <dd>{appointment.client_email}</dd>
                                            </div>
                                            <div>
                                                <dt>Service</dt>
                                                <dd>{appointment.service_name}</dd>
                                            </div>
                                            <div>
                                                <dt>Date</dt>
                                                <dd>{appointment.appointment_date}</dd>
                                            </div>
                                            <div>
                                                <dt>Time</dt>
                                                <dd>
                                                    {appointment.start_time.slice(0, 5)} –{" "}
                                                    {appointment.end_time.slice(0, 5)}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt>Price</dt>
                                                <dd className="price">€{appointment.price}</dd>
                                            </div>
                                        </dl>

                                        {appointment.status === "CONFIRMED" && (
                                            <div className="appt-actions">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateAppointmentStatus(
                                                            appointment.id,
                                                            "COMPLETED"
                                                        )
                                                    }
                                                >
                                                    Mark Completed
                                                </button>
                                            </div>
                                        )}
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                    {/* Tabs */}
                    <div className="tabs">
                        {TABS.map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                className={`tab ${tab === t.id ? "tab-active" : ""}`}
                                onClick={() => setTab(t.id)}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                    {tab === "schedule" && (
                        <>
                            {/* Working Hours */}
                            <section className="dash-section">
                                <div className="section-head">
                                    <h2>Working Hours</h2>
                                </div>

                                <div className="hours-list">
                                    {workingHours.map((day) => (
                                        <div key={day.day_of_week} className="hours-row">
                                            <h3 className="hours-day">
                                                {dayNames[Number(day.day_of_week)]}
                                            </h3>

                                            <label className="switch">
                                                <input
                                                    type="checkbox"
                                                    checked={day.is_working}
                                                    onChange={() =>
                                                        handleWorkingDayToggle(day.day_of_week)
                                                    }
                                                />
                                                <span>Working day</span>
                                            </label>

                                            {day.is_working && (
                                                <div className="hours-times">
                                                    <label>
                                                        <span>Start</span>
                                                        <input
                                                            type="time"
                                                            value={day.start_time.slice(0, 5)}
                                                            onChange={(event) =>
                                                                handleWorkingHoursChange(
                                                                    day.day_of_week,
                                                                    "start_time",
                                                                    event.target.value
                                                                )
                                                            }
                                                        />
                                                    </label>

                                                    <label>
                                                        <span>End</span>

                                                        <input
                                                            type="time"
                                                            value={day.end_time.slice(0, 5)}
                                                            onChange={(event) =>
                                                                handleWorkingHoursChange(
                                                                    day.day_of_week,
                                                                    "end_time",
                                                                    event.target.value
                                                                )
                                                            }
                                                        />
                                                    </label>
                                                    <button
                                                        type="button"
                                                        className="btn-ghost small"
                                                        title="Copy this day's hours to all other days"
                                                        onClick={() => handleCopyRowToAll(day.day_of_week)}
                                                    >
                                                        Copy to all
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="form-actions">
                                    <button type="button" onClick={handleSaveWorkingHours}>
                                        Save Working Hours
                                    </button>
                                </div>
                            </section>
                        </>)}
                    {tab === "services" && (
                        <>
                            {/* Services */}
                            <section className="dash-section">
                                <div className="section-head">
                                    <h2>Services &amp; Prices</h2>
                                    <div className="head-right">
                                        <span className="count-badge">{services.length}</span>
                                        <button
                                            type="button"
                                            className="btn"
                                            onClick={() => setAddingService(true)}
                                        >
                                            + Add
                                        </button>
                                    </div>
                                </div>



                                <h3 className="subheading">Current Services</h3>

                                {services.length === 0 ? (
                                    <p className="hint">No services added yet.</p>
                                ) : (
                                    <div className="card-grid">
                                        {services.map((service) => (
                                            <article key={service.id} className="mini-card">
                                                <header className="mini-head">
                                                    <h4>{service.name}</h4>
                                                    <span
                                                        className={`pill ${service.active ? "pill-success" : "pill-muted"}`}
                                                    >
                                                        {service.active ? "Active" : "Inactive"}
                                                    </span>
                                                </header>

                                                <p className="muted">
                                                    {service.description || "No description"}
                                                </p>

                                                <div className="mini-meta">
                                                    <span className="price">€{service.price}</span>
                                                    <span>{service.duration} min</span>
                                                </div>

                                                <div className="mini-actions">
                                                    <button
                                                        type="button"
                                                        className="btn-ghost"
                                                        onClick={() => setEditingService(service)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn-ghost"
                                                        onClick={() => handleToggleService(service)}
                                                    >
                                                        {service.active ? "Deactivate" : "Activate"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn-ghost danger"
                                                        onClick={() => handleDeleteService(service)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                )}
                            </section>

                        </>)}
                    {tab === "timeoff" && (
                        <>
                            {/* Days Off */}
                            <section className="dash-section">
                                <div className="section-head">
                                    <h2>Days Off</h2>
                                    <button
                                        type="button"
                                        className="btn btn-sm"
                                        onClick={() => setAddingDayOff(true)}
                                    >
                                        + Add
                                    </button>
                                </div>

                                <h3 className="subheading">Scheduled Days Off</h3>

                                {daysOff.length === 0 ? (
                                    <p className="hint">No days off scheduled.</p>
                                ) : (
                                    <div className="card-grid">
                                        {groupedDaysOff.map((group) => (
                                            <article
                                                key={group.ids.join("-")}
                                                className="mini-card"
                                            >
                                                <h4>
                                                    {group.startDate === group.endDate
                                                        ? group.startDate
                                                        : `${group.startDate} – ${group.endDate}`}
                                                </h4>

                                                <p className="muted">
                                                    {group.reason || "No reason provided"}
                                                </p>

                                                <div className="mini-actions">
                                                    <button
                                                        type="button"
                                                        className="btn-ghost danger"
                                                        onClick={() => handleRemoveDayOff(group.ids)}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </>
                    )}
                    {tab === "breaks" && (
                        <>

                            {/* Breaks */}
                            < section className="dash-section" >
                                <div className="section-head">
                                    <h2>Breaks</h2>
                                    <button
                                        type="button"
                                        className="btn btn-sm"
                                        onClick={() => setAddingBreak(true)}
                                    >
                                        + Add
                                    </button>
                                </div>



                                <h3 className="subheading">Scheduled Breaks</h3>

                                {breaks.length === 0 ? (
                                    <p className="hint">No breaks scheduled.</p>
                                ) : (
                                    <div className="day-grid">
                                        {breaksByDay.map((dayBreaks, dayIndex) => {
                                            const day = workingHours.find(
                                                (d) => Number(d.day_of_week) === dayIndex
                                            );
                                            const isWorking = day?.is_working ?? false;

                                            return (
                                                <article
                                                    key={dayIndex}
                                                    className={`mini-card day-card ${isWorking ? "" : "is-off"}`}
                                                >
                                                    <header className="mini-head">
                                                        <h4>{dayNames[dayIndex]}</h4>
                                                        {isWorking ? (
                                                            <span className="count-badge">{dayBreaks.length}</span>
                                                        ) : (
                                                            <span className="pill pill-muted">Day off</span>
                                                        )}
                                                    </header>

                                                    {!isWorking ? (
                                                        <p className="muted">Not a working day</p>
                                                    ) : dayBreaks.length === 0 ? (
                                                        <p className="muted">No breaks</p>
                                                    ) : (
                                                        <ul className="break-list">
                                                            {dayBreaks.map((breakItem) => (
                                                                <li key={breakItem.id} className="break-row">
                                                                    <div className="break-info">
                                                                        <span className="time-range">
                                                                            {breakItem.start_time.slice(0, 5)} –{" "}
                                                                            {breakItem.end_time.slice(0, 5)}
                                                                        </span>
                                                                        {breakItem.name && (
                                                                            <span className="muted">{breakItem.name}</span>
                                                                        )}
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        className="btn-ghost danger small"
                                                                        title="Remove"
                                                                        onClick={() => handleRemoveBreak(breakItem.id)}
                                                                    >
                                                                        ×
                                                                    </button>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}

                                                    {isWorking && (
                                                        <button
                                                            type="button"
                                                            className="btn-ghost small day-add"
                                                            onClick={() => setAddingBreak({ day: dayIndex })}
                                                        >
                                                            + Add
                                                        </button>
                                                    )}
                                                </article>
                                            );
                                        })}
                                    </div>
                                )}
                            </section >
                        </>)}
                </>)
            }

            {/* ============ CLIENT DASHBOARD ============ */}
            {
                !isBarber && (
                    <section className="dash-section">
                        <div className="section-head">
                            <h2>My Appointments</h2>
                            <span className="count-badge">{appointments.length}</span>
                        </div>

                        <AppointmentFilters
                            value={apptFilter}
                            onChange={setApptFilter}
                            counts={{
                                all: appointments.length,
                                upcoming: appointments.filter(
                                    (a) => a.status === "CONFIRMED" || a.status === "PENDING"
                                ).length,
                                completed: appointments.filter(
                                    (a) => a.status === "COMPLETED"
                                ).length,
                                cancelled: appointments.filter(
                                    (a) => a.status === "CANCELLED"
                                ).length,
                            }}
                        />

                        {filterAppointments(appointments).length === 0 ? (
                            <p className="hint">No appointments in this filter.</p>
                        ) : (
                            <div className="appt-grid">
                                {filterAppointments(appointments).map((appointment) => (
                                    <article key={appointment.id} className="appt-card">
                                        <header className="appt-head">
                                            <h3>{appointment.service_name}</h3>
                                            <StatusBadge status={appointment.status} />
                                        </header>

                                        <dl className="appt-meta">
                                            <div>
                                                <dt>Barber</dt>
                                                <dd>{appointment.barber_name}</dd>
                                            </div>
                                            <div>
                                                <dt>Shop</dt>
                                                <dd>{appointment.shop_name}</dd>
                                            </div>
                                            <div>
                                                <dt>Date</dt>
                                                <dd>{appointment.appointment_date}</dd>
                                            </div>
                                            <div>
                                                <dt>Time</dt>
                                                <dd>
                                                    {appointment.start_time} - {appointment.end_time}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt>Price</dt>
                                                <dd className="price">€{appointment.price}</dd>
                                            </div>
                                        </dl>

                                        {appointment.status === "CONFIRMED" && (
                                            <div className="appt-actions">
                                                <button
                                                    type="button"
                                                    className="btn-ghost danger"
                                                    onClick={() => cancelAppointment(appointment.id)}
                                                >
                                                    Cancel Appointment
                                                </button>
                                            </div>
                                        )}
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                )
            }

            {/* ============ MODALS ============ */}
            {
                editingService && (
                    <EditServiceModal
                        service={editingService}
                        onClose={() => setEditingService(null)}
                        onSaved={(updated) => {
                            setServices((cur) =>
                                cur.map((s) => (s.id === updated.id ? updated : s))
                            );
                            setEditingService(null);
                            notify("Service updated successfully.");
                        }}
                    />
                )
            }

            {
                confirm && (
                    <ConfirmDialog
                        title={confirm.title}
                        message={confirm.message}
                        confirmLabel={confirm.confirmLabel}
                        danger={confirm.danger}
                        onCancel={() => setConfirm(null)}
                        onConfirm={async () => {
                            await confirm.onConfirm();
                            setConfirm(null);
                        }}
                    />
                )
            }
            {addingService && (
                <AddServiceModal
                    onClose={() => setAddingService(false)}
                    onAdded={(service) => {
                        setServices((cur) => [...cur, service]);
                        setAddingService(false);
                        notify("Service added successfully.");
                    }}
                />
            )
            }

            {addingDayOff && (
                <AddDayOffModal
                    onClose={() => setAddingDayOff(false)}
                    onAdded={async (count) => {
                        setAddingDayOff(false);
                        notify(`${count} day(s) off added successfully.`);
                        await getDaysOff();
                    }}
                />
            )
            }

            {addingBreak && (
                <AddBreakModal
                    dayNames={dayNames}
                    breaks={breaks}
                    defaultDay={
                        typeof addingBreak === "object" ? addingBreak.day : undefined
                    }
                    onClose={() => setAddingBreak(false)}
                    onAdded={(breakItem) => {
                        setBreaks((cur) => [...cur, breakItem]);
                        setAddingBreak(false);
                        notify("Break added successfully.");
                    }}
                />
            )}
        </main >
    );
}

export default Dashboard;