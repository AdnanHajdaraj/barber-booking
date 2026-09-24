import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Dashboard() {
    const [message, setMessage] = useState("Loading...");
    const [isOwner, setIsOwner] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [barberAppointments, setBarberAppointments] = useState([]);
    const [workingHours, setWorkingHours] = useState([]);
    const [daysOff, setDaysOff] = useState([]);
    const [dayOffStart, setDayOffStart] = useState("");
    const [dayOffEnd, setDayOffEnd] = useState("");
    const [dayOffReason, setDayOffReason] = useState("");
    const [breaks, setBreaks] = useState([]);
    const [breakDay, setBreakDay] = useState("");
    const [breakStart, setBreakStart] = useState("");
    const [breakEnd, setBreakEnd] = useState("");
    const [breakName, setBreakName] = useState("");

    const [services, setServices] = useState([]);
    const [serviceName, setServiceName] = useState("");
    const [serviceDescription, setServiceDescription] = useState("");
    const [servicePrice, setServicePrice] = useState("");
    const [serviceDuration, setServiceDuration] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            setMessage("You are not logged in.");
            return;
        }

        const getDashboard = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5000/api/auth/protected",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    setMessage(data.message || "Access denied.");
                    return;
                }

                // The protected endpoint returns the user directly.
                // So `data.role` and `data.is_owner` are on the root.
                setMessage("");
                setIsOwner(data.user.is_owner === true);

                if (data.user.role === "CLIENT") {
                    const appointmentsResponse = await fetch(
                        "http://localhost:5000/api/appointments/my",
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    );

                    const appointmentsData =
                        await appointmentsResponse.json();

                    if (appointmentsResponse.ok) {
                        setAppointments(
                            appointmentsData.appointments || []
                        );
                    }
                }

                if (data.user.role === "BARBER") {
                    const workingHoursResponse = await fetch(
                        "http://localhost:5000/api/working-hours",
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    );

                    const workingHoursData =
                        await workingHoursResponse.json();

                    if (!workingHoursResponse.ok) {
                        setMessage(
                            workingHoursData.message ||
                            "Failed to load working hours."
                        );
                        return;
                    }

                    setWorkingHours(
                        workingHoursData.working_hours || []
                    );

                    const servicesResponse = await fetch(
                        "http://localhost:5000/api/services",
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    );

                    const servicesData =
                        await servicesResponse.json();

                    if (servicesResponse.ok) {
                        setServices(servicesData.services || []);
                    }

                    const barberAppointmentsResponse = await fetch(
                        "http://localhost:5000/api/appointments/barber",
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    );

                    const barberAppointmentsData =
                        await barberAppointmentsResponse.json();

                    if (barberAppointmentsResponse.ok) {
                        setBarberAppointments(
                            barberAppointmentsData.appointments || []
                        );
                    }
                }
            } catch (error) {
                console.error(error);
                setMessage("Unable to connect to the server.");
            }
        };

        getDashboard();
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            return;
        }

        const loadDaysOff = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5000/api/days-off",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    console.error(
                        data.message ||
                        "Failed to load days off."
                    );
                    return;
                }

                setDaysOff(data.days_off || []);
            } catch (error) {
                console.error(error);
            }
        };

        loadDaysOff();
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            return;
        }

        const loadBreaks = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5000/api/breaks",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    console.error(
                        data.message ||
                        "Failed to load breaks."
                    );
                    return;
                }

                setBreaks(data.breaks || []);
            } catch (error) {
                console.error(error);
            }
        };

        loadBreaks();
    }, []);

    const handleAddService = async () => {
        const token = localStorage.getItem("token");

        if (
            !token ||
            !serviceName ||
            !servicePrice ||
            !serviceDuration
        ) {
            alert(
                "Name, price and duration are required."
            );
            return;
        }

        if (
            Number(servicePrice) <= 0 ||
            Number(serviceDuration) <= 0
        ) {
            alert(
                "Price and duration must be greater than 0."
            );
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:5000/api/services",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name: serviceName,
                        description: serviceDescription,
                        price: Number(servicePrice),
                        duration: Number(serviceDuration)
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(
                    data.message ||
                    "Failed to add service."
                );
                return;
            }

            alert("Service added successfully.");

            setServices((currentServices) => [
                ...currentServices,
                data.service
            ]);

            setServiceName("");
            setServiceDescription("");
            setServicePrice("");
            setServiceDuration("");
        } catch (error) {
            console.error(error);
            alert("Unable to connect to the server.");
        }
    };

    const handleEditService = async (service) => {
        const token = localStorage.getItem("token");

        if (!token) {
            return;
        }

        const newName = window.prompt(
            "Service name:",
            service.name
        );

        if (newName === null || !newName.trim()) {
            return;
        }

        const newDescription = window.prompt(
            "Description:",
            service.description || ""
        );

        if (newDescription === null) {
            return;
        }

        const newPrice = window.prompt(
            "Price:",
            service.price
        );

        if (
            newPrice === null ||
            Number(newPrice) <= 0
        ) {
            alert("Price must be greater than 0.");
            return;
        }

        const newDuration = window.prompt(
            "Duration in minutes:",
            service.duration
        );

        if (
            newDuration === null ||
            Number(newDuration) <= 0
        ) {
            alert(
                "Duration must be greater than 0."
            );
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:5000/api/services/${service.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name: newName.trim(),
                        description: newDescription,
                        price: Number(newPrice),
                        duration: Number(newDuration),
                        active: service.active
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(
                    data.message ||
                    "Failed to update service."
                );
                return;
            }

            setServices((currentServices) =>
                currentServices.map((item) =>
                    item.id === service.id
                        ? data.service
                        : item
                )
            );

            alert("Service updated successfully.");
        } catch (error) {
            console.error(error);
            alert("Unable to connect to the server.");
        }
    };

    const handleToggleService = async (service) => {
        const token = localStorage.getItem("token");

        if (!token) {
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:5000/api/services/${service.id}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        active: !service.active
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(
                    data.message ||
                    "Failed to update service status."
                );
                return;
            }

            setServices((currentServices) =>
                currentServices.map((item) =>
                    item.id === service.id
                        ? data.service
                        : item
                )
            );
        } catch (error) {
            console.error(error);
            alert("Unable to connect to the server.");
        }
    };

    const getDaysOff = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:5000/api/days-off",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(
                    data.message ||
                    "Failed to load days off."
                );
                return;
            }

            setDaysOff(data.days_off || []);
        } catch (error) {
            console.error(error);
            alert("Unable to connect to the server.");
        }
    };

    const handleAddDayOff = async () => {
        const token = localStorage.getItem("token");

        if (!token || !dayOffStart || !dayOffEnd) {
            return;
        }

        if (dayOffEnd < dayOffStart) {
            alert(
                "End date cannot be before start date."
            );
            return;
        }

        try {
            const startDate = new Date(
                `${dayOffStart}T00:00:00`
            );
            const endDate = new Date(
                `${dayOffEnd}T00:00:00`
            );

            const dates = [];

            for (
                let current = new Date(startDate);
                current <= endDate;
                current.setDate(
                    current.getDate() + 1
                )
            ) {
                const year = current.getFullYear();
                const month = String(
                    current.getMonth() + 1
                ).padStart(2, "0");
                const day = String(
                    current.getDate()
                ).padStart(2, "0");

                dates.push(
                    `${year}-${month}-${day}`
                );
            }

            for (const date of dates) {
                const response = await fetch(
                    "http://localhost:5000/api/days-off",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            date,
                            reason: dayOffReason
                        })
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    alert(
                        data.message ||
                        `Failed to add day off: ${date}`
                    );
                    return;
                }
            }

            alert(
                `${dates.length} day(s) off added successfully.`
            );

            setDayOffStart("");
            setDayOffEnd("");
            setDayOffReason("");

            await getDaysOff();
        } catch (error) {
            console.error(error);
            alert("Unable to connect to the server.");
        }
    };

    const handleRemoveDayOff = async (ids) => {
        const token = localStorage.getItem("token");

        if (!token) {
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to remove this day off?"
        );

        if (!confirmed) {
            return;
        }

        try {
            for (const id of ids) {
                const response = await fetch(
                    `http://localhost:5000/api/days-off/${id}`,
                    {
                        method: "DELETE",
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    alert(
                        data.message ||
                        "Failed to remove day off."
                    );
                    return;
                }
            }

            alert("Day off removed successfully.");

            setDaysOff((currentDaysOff) =>
                currentDaysOff.filter(
                    (dayOff) =>
                        !ids.includes(dayOff.id)
                )
            );
        } catch (error) {
            console.error(error);
            alert("Unable to connect to the server.");
        }
    };

    const handleAddBreak = async () => {
        const token = localStorage.getItem("token");

        if (
            !token ||
            breakDay === "" ||
            !breakStart ||
            !breakEnd
        ) {
            return;
        }

        if (breakStart >= breakEnd) {
            alert(
                "Break start time must be before end time."
            );
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:5000/api/breaks",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        day_of_week: Number(breakDay),
                        start_time: breakStart,
                        end_time: breakEnd,
                        name: breakName
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(
                    data.message ||
                    "Failed to add break."
                );
                return;
            }

            alert("Break added successfully.");

            setBreakDay("");
            setBreakStart("");
            setBreakEnd("");
            setBreakName("");

            setBreaks((currentBreaks) => [
                ...currentBreaks,
                data.break
            ]);
        } catch (error) {
            console.error(error);
            alert("Unable to connect to the server.");
        }
    };

    const handleRemoveBreak = async (breakId) => {
        const token = localStorage.getItem("token");

        if (!token) {
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to remove this break?"
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:5000/api/breaks/${breakId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(
                    data.message ||
                    "Failed to remove break."
                );
                return;
            }

            alert("Break removed successfully.");

            setBreaks((currentBreaks) =>
                currentBreaks.filter(
                    (breakItem) =>
                        breakItem.id !== breakId
                )
            );
        } catch (error) {
            console.error(error);
            alert("Unable to connect to the server.");
        }
    };

    const handleWorkingHoursChange = (
        dayOfWeek,
        field,
        value
    ) => {
        setWorkingHours((currentHours) =>
            currentHours.map((day) =>
                Number(day.day_of_week) ===
                    Number(dayOfWeek)
                    ? {
                        ...day,
                        [field]: value
                    }
                    : day
            )
        );
    };

    const handleWorkingDayToggle = (dayOfWeek) => {
        setWorkingHours((currentHours) =>
            currentHours.map((day) =>
                Number(day.day_of_week) ===
                    Number(dayOfWeek)
                    ? {
                        ...day,
                        is_working: !day.is_working
                    }
                    : day
            )
        );
    };

    const handleSaveWorkingHours = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            return;
        }

        try {
            for (const day of workingHours) {
                const response = await fetch(
                    "http://localhost:5000/api/working-hours",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            day_of_week: Number(
                                day.day_of_week
                            ),
                            start_time:
                                day.start_time.slice(0, 5),
                            end_time:
                                day.end_time.slice(0, 5),
                            is_working:
                                day.is_working
                        })
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    alert(
                        data.message ||
                        "Failed to save working hours."
                    );
                    return;
                }
            }

            alert(
                "Working hours saved successfully."
            );
        } catch (error) {
            console.error(error);
            alert("Unable to connect to the server.");
        }
    };
    const updateAppointmentStatus = async (appointmentId, newStatus) => {
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(
                `http://localhost:5000/api/appointments/${appointmentId}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ status: newStatus }),
                }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                setMessage(data.message || "Could not update appointment.");
                return;
            }

            // Update local state so the badge changes without a refetch
            setBarberAppointments((prev) =>
                prev.map((a) =>
                    a.id === appointmentId ? { ...a, status: newStatus } : a
                )
            );
            setMessage("Appointment marked as completed.");
        } catch (error) {
            console.error(error);
            setMessage("Unable to connect to the server.");
        }
    };

    const cancelAppointment = async (appointmentId) => {
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(
                `http://localhost:5000/api/appointments/${appointmentId}/cancel`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                setMessage(data.message || "Could not cancel appointment.");
                return;
            }

            setAppointments((prev) =>
                prev.map((a) =>
                    a.id === appointmentId ? { ...a, status: "CANCELLED" } : a
                )
            );
            setMessage("Appointment cancelled.");
        } catch (error) {
            console.error(error);
            setMessage("Unable to connect to the server.");
        }
    };
    const handleCancel = async (appointmentId) => {
        const token = localStorage.getItem("token");

        if (!token) {
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to cancel this appointment?"
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:5000/api/appointments/${appointmentId}/cancel`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(
                    data.message ||
                    "Unable to cancel appointment."
                );
                return;
            }

            alert(
                "Appointment cancelled successfully."
            );

            setAppointments(
                (currentAppointments) =>
                    currentAppointments.map(
                        (appointment) =>
                            appointment.id ===
                                appointmentId
                                ? {
                                    ...appointment,
                                    status: "CANCELLED"
                                }
                                : appointment
                    )
            );
        } catch (error) {
            console.error(error);
            alert("Unable to connect to the server.");
        }
    };

    const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];

    const groupedDaysOff = [];

    const sortedDaysOff = [...daysOff].sort(
        (a, b) =>
            a.date.localeCompare(b.date)
    );

    sortedDaysOff.forEach((dayOff) => {
        const lastGroup =
            groupedDaysOff[
            groupedDaysOff.length - 1
            ];

        if (!lastGroup) {
            groupedDaysOff.push({
                startDate: dayOff.date,
                endDate: dayOff.date,
                reason: dayOff.reason,
                ids: [dayOff.id]
            });

            return;
        }

        const previousDate = new Date(
            `${lastGroup.endDate}T00:00:00`
        );

        previousDate.setDate(
            previousDate.getDate() + 1
        );

        const nextDate =
            `${previousDate.getFullYear()}-${String(
                previousDate.getMonth() + 1
            ).padStart(2, "0")}-${String(
                previousDate.getDate()
            ).padStart(2, "0")}`;

        if (
            nextDate === dayOff.date &&
            lastGroup.reason === dayOff.reason
        ) {
            lastGroup.endDate = dayOff.date;
            lastGroup.ids.push(dayOff.id);
        } else {
            groupedDaysOff.push({
                startDate: dayOff.date,
                endDate: dayOff.date,
                reason: dayOff.reason,
                ids: [dayOff.id]
            });
        }
    });
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
    return (
        <main className="page dashboard">
            <header className="page-hero">
                <p className="eyebrow">
                    {workingHours.length > 0 ? "Barber panel" : "My account"}
                </p>
                <h1>Dashboard</h1>
                {isOwner && (
                    <div className="dash-actions">
                        <Link to="/dashboard/add-barber" className="btn">
                            + Add Barber
                        </Link>
                    </div>
                )}
            </header>

            {message && <p className="alert">{message}</p>}

            {/* ============ BARBER DASHBOARD ============ */}
            {workingHours.length > 0 && (
                <>
                    {/* Appointments */}
                    <section className="dash-section">
                        <div className="section-head">
                            <h2>Appointments</h2>
                            <span className="count-badge">
                                {barberAppointments.length}
                            </span>
                        </div>

                        {barberAppointments.length === 0 ? (
                            <p className="hint">No appointments found.</p>
                        ) : (
                            <div className="appt-grid">
                                {barberAppointments.map((appointment) => (
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

                    {/* Services */}
                    <section className="dash-section">
                        <div className="section-head">
                            <h2>Services &amp; Prices</h2>
                            <span className="count-badge">{services.length}</span>
                        </div>

                        <div className="panel">
                            <h3>Add New Service</h3>
                            <div className="form-grid">
                                <label>
                                    <span>Name</span>
                                    <input
                                        type="text"
                                        value={serviceName}
                                        onChange={(e) => setServiceName(e.target.value)}
                                        placeholder="e.g. Haircut"
                                    />
                                </label>

                                <label>
                                    <span>Description</span>
                                    <input
                                        type="text"
                                        value={serviceDescription}
                                        onChange={(e) =>
                                            setServiceDescription(e.target.value)
                                        }
                                        placeholder="Optional"
                                    />
                                </label>

                                <label>
                                    <span>Price (€)</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={servicePrice}
                                        onChange={(e) => setServicePrice(e.target.value)}
                                        placeholder="12"
                                    />
                                </label>

                                <label>
                                    <span>Duration (min)</span>
                                    <input
                                        type="number"
                                        min="1"
                                        value={serviceDuration}
                                        onChange={(e) =>
                                            setServiceDuration(e.target.value)
                                        }
                                        placeholder="25"
                                    />
                                </label>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    onClick={handleAddService}
                                    disabled={
                                        !serviceName || !servicePrice || !serviceDuration
                                    }
                                >
                                    Add Service
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
                                                className={`pill ${service.active ? "pill-success" : "pill-muted"
                                                    }`}
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
                                                onClick={() => handleEditService(service)}
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
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Days Off */}
                    <section className="dash-section">
                        <div className="section-head">
                            <h2>Days Off</h2>
                        </div>

                        <div className="panel">
                            <div className="form-grid">
                                <label>
                                    <span>Start date</span>
                                    <input
                                        type="date"
                                        value={dayOffStart}
                                        onChange={(e) => setDayOffStart(e.target.value)}
                                    />
                                </label>

                                <label>
                                    <span>End date</span>
                                    <input
                                        type="date"
                                        value={dayOffEnd}
                                        min={dayOffStart || undefined}
                                        onChange={(e) => setDayOffEnd(e.target.value)}
                                    />
                                </label>

                                <label className="span-2">
                                    <span>Reason</span>
                                    <input
                                        type="text"
                                        value={dayOffReason}
                                        onChange={(e) => setDayOffReason(e.target.value)}
                                        placeholder="Optional"
                                    />
                                </label>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    onClick={handleAddDayOff}
                                    disabled={!dayOffStart || !dayOffEnd}
                                >
                                    Add Days Off
                                </button>
                            </div>
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

                    {/* Breaks */}
                    <section className="dash-section">
                        <div className="section-head">
                            <h2>Breaks</h2>
                        </div>

                        <div className="panel">
                            <div className="form-grid">
                                <label>
                                    <span>Day</span>
                                    <select
                                        value={breakDay}
                                        onChange={(e) => setBreakDay(e.target.value)}
                                    >
                                        <option value="">Select a day</option>
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
                                        value={breakStart}
                                        onChange={(e) => setBreakStart(e.target.value)}
                                    />
                                </label>

                                <label>
                                    <span>End time</span>
                                    <input
                                        type="time"
                                        value={breakEnd}
                                        onChange={(e) => setBreakEnd(e.target.value)}
                                    />
                                </label>

                                <label>
                                    <span>Name</span>
                                    <input
                                        type="text"
                                        value={breakName}
                                        onChange={(e) => setBreakName(e.target.value)}
                                        placeholder="e.g. Lunch"
                                    />
                                </label>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    onClick={handleAddBreak}
                                    disabled={
                                        breakDay === "" || !breakStart || !breakEnd
                                    }
                                >
                                    Add Break
                                </button>
                            </div>
                        </div>

                        <h3 className="subheading">Scheduled Breaks</h3>

                        {breaks.length === 0 ? (
                            <p className="hint">No breaks scheduled.</p>
                        ) : (
                            <div className="card-grid">
                                {breaks.map((breakItem) => (
                                    <article key={breakItem.id} className="mini-card">
                                        <h4>
                                            {dayNames[Number(breakItem.day_of_week)]}
                                        </h4>

                                        <p className="time-range">
                                            {breakItem.start_time.slice(0, 5)} –{" "}
                                            {breakItem.end_time.slice(0, 5)}
                                        </p>

                                        <p className="muted">
                                            {breakItem.name || "No name provided"}
                                        </p>

                                        <div className="mini-actions">
                                            <button
                                                type="button"
                                                className="btn-ghost danger"
                                                onClick={() => handleRemoveBreak(breakItem.id)}
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

            {/* ============ CLIENT DASHBOARD ============ */}
            {workingHours.length === 0 && (
                <section className="dash-section">
                    <div className="section-head">
                        <h2>My Appointments</h2>
                        <span className="count-badge">{appointments.length}</span>
                    </div>

                    {appointments.length === 0 ? (
                        <p className="hint">You don't have any appointments.</p>
                    ) : (
                        <div className="appt-grid">
                            {appointments.map((appointment) => (
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
            )}
        </main>
    );
}

export default Dashboard;