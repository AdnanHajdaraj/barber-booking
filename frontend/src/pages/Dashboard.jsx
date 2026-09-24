import { useEffect, useState } from "react";

function Dashboard() {
    const [message, setMessage] = useState("Loading...");
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

                setMessage("");

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
                        setServices(
                            servicesData.services || []
                        );
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

    return (
        <main>
            <h1>Dashboard</h1>

            {message && <p>{message}</p>}

            {/* Barber dashboard */}
            {workingHours.length > 0 && (
                <>
                    {/* Appointments */}
                    <section>
                        <h2>Appointments</h2>

                        {barberAppointments.length === 0 ? (
                            <p>No appointments found.</p>
                        ) : (
                            barberAppointments.map((appointment) => (
                                <div
                                    key={appointment.id}
                                    style={{
                                        border: "1px solid #ccc",
                                        padding: "15px",
                                        marginBottom: "10px"
                                    }}
                                >
                                    <h3>
                                        {appointment.client_name}
                                    </h3>

                                    <p>
                                        <strong>Email:</strong>{" "}
                                        {appointment.client_email}
                                    </p>

                                    <p>
                                        <strong>Service:</strong>{" "}
                                        {appointment.service_name}
                                    </p>

                                    <p>
                                        <strong>Date:</strong>{" "}
                                        {appointment.appointment_date}
                                    </p>

                                    <p>
                                        <strong>Time:</strong>{" "}
                                        {appointment.start_time.slice(0, 5)}
                                        {" – "}
                                        {appointment.end_time.slice(0, 5)}
                                    </p>

                                    <p>
                                        <strong>Price:</strong>{" "}
                                        €{appointment.price}
                                    </p>

                                    <p>
                                        <strong>Status:</strong>{" "}
                                        {appointment.status}
                                    </p>

                                    {appointment.status === "CONFIRMED" && (
                                        <div>
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

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateAppointmentStatus(
                                                        appointment.id,
                                                        "CANCELLED"
                                                    )
                                                }
                                            >
                                                Cancel Appointment
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </section>

                    <section>
                        <h2>Working Hours</h2>

                        {workingHours.map((day) => (
                            <div
                                key={day.day_of_week}
                                style={{
                                    border: "1px solid #ccc",
                                    padding: "15px",
                                    marginBottom: "10px"
                                }}
                            >
                                <h3>
                                    {
                                        dayNames[
                                        Number(
                                            day.day_of_week
                                        )
                                        ]
                                    }
                                </h3>

                                <label>
                                    <input
                                        type="checkbox"
                                        checked={
                                            day.is_working
                                        }
                                        onChange={() =>
                                            handleWorkingDayToggle(
                                                day.day_of_week
                                            )
                                        }
                                    />{" "}
                                    Working day
                                </label>

                                {day.is_working && (
                                    <div>
                                        <br />

                                        <label>
                                            Start time:{" "}
                                            <input
                                                type="time"
                                                value={day.start_time.slice(
                                                    0,
                                                    5
                                                )}
                                                onChange={(
                                                    event
                                                ) =>
                                                    handleWorkingHoursChange(
                                                        day.day_of_week,
                                                        "start_time",
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                            />
                                        </label>

                                        {"  "}

                                        <label>
                                            End time:{" "}
                                            <input
                                                type="time"
                                                value={day.end_time.slice(
                                                    0,
                                                    5
                                                )}
                                                onChange={(
                                                    event
                                                ) =>
                                                    handleWorkingHoursChange(
                                                        day.day_of_week,
                                                        "end_time",
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                            />
                                        </label>
                                    </div>
                                )}
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={
                                handleSaveWorkingHours
                            }
                        >
                            Save Working Hours
                        </button>
                    </section>

                    {/* Services */}
                    <section>
                        <h2>Services & Prices</h2>

                        <h3>Add New Service</h3>

                        <div>
                            <label>
                                Name:
                                <input
                                    type="text"
                                    value={serviceName}
                                    onChange={(event) =>
                                        setServiceName(
                                            event.target.value
                                        )
                                    }
                                    placeholder="e.g. Haircut"
                                />
                            </label>

                            <br />
                            <br />

                            <label>
                                Description:
                                <input
                                    type="text"
                                    value={
                                        serviceDescription
                                    }
                                    onChange={(event) =>
                                        setServiceDescription(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Optional"
                                />
                            </label>

                            <br />
                            <br />

                            <label>
                                Price:
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={servicePrice}
                                    onChange={(event) =>
                                        setServicePrice(
                                            event.target.value
                                        )
                                    }
                                    placeholder="12"
                                />
                            </label>

                            <br />
                            <br />

                            <label>
                                Duration:
                                <input
                                    type="number"
                                    min="1"
                                    value={
                                        serviceDuration
                                    }
                                    onChange={(event) =>
                                        setServiceDuration(
                                            event.target.value
                                        )
                                    }
                                    placeholder="25"
                                />{" "}
                                minutes
                            </label>

                            <br />
                            <br />

                            <button
                                type="button"
                                onClick={
                                    handleAddService
                                }
                                disabled={
                                    !serviceName ||
                                    !servicePrice ||
                                    !serviceDuration
                                }
                            >
                                Add Service
                            </button>
                        </div>

                        <h3>Current Services</h3>

                        {services.length === 0 ? (
                            <p>
                                No services added yet.
                            </p>
                        ) : (
                            services.map((service) => (
                                <div
                                    key={service.id}
                                    style={{
                                        border:
                                            "1px solid #ccc",
                                        padding: "15px",
                                        marginBottom:
                                            "10px"
                                    }}
                                >
                                    <h3>
                                        {
                                            service.name
                                        }
                                    </h3>

                                    <p>
                                        <strong>
                                            Description:
                                        </strong>{" "}
                                        {service.description ||
                                            "No description"}
                                    </p>

                                    <p>
                                        <strong>
                                            Price:
                                        </strong>{" "}
                                        €{service.price}
                                    </p>

                                    <p>
                                        <strong>
                                            Duration:
                                        </strong>{" "}
                                        {
                                            service.duration
                                        }{" "}
                                        minutes
                                    </p>

                                    <p>
                                        <strong>
                                            Status:
                                        </strong>{" "}
                                        {service.active
                                            ? "Active"
                                            : "Inactive"}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleEditService(
                                                service
                                            )
                                        }
                                    >
                                        Edit
                                    </button>

                                    {" "}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleToggleService(
                                                service
                                            )
                                        }
                                    >
                                        {service.active
                                            ? "Deactivate"
                                            : "Activate"}
                                    </button>
                                </div>
                            ))
                        )}
                    </section>

                    {/* Days Off */}
                    <section>
                        <h2>Days Off</h2>

                        <div>
                            <label>
                                Start date:
                                <input
                                    type="date"
                                    value={
                                        dayOffStart
                                    }
                                    onChange={(event) =>
                                        setDayOffStart(
                                            event.target.value
                                        )
                                    }
                                />
                            </label>

                            <br />
                            <br />

                            <label>
                                End date:
                                <input
                                    type="date"
                                    value={
                                        dayOffEnd
                                    }
                                    min={
                                        dayOffStart ||
                                        undefined
                                    }
                                    onChange={(event) =>
                                        setDayOffEnd(
                                            event.target.value
                                        )
                                    }
                                />
                            </label>

                            <br />
                            <br />

                            <label>
                                Reason:
                                <input
                                    type="text"
                                    value={
                                        dayOffReason
                                    }
                                    onChange={(event) =>
                                        setDayOffReason(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Optional"
                                />
                            </label>

                            <br />
                            <br />

                            <button
                                type="button"
                                onClick={
                                    handleAddDayOff
                                }
                                disabled={
                                    !dayOffStart ||
                                    !dayOffEnd
                                }
                            >
                                Add Days Off
                            </button>
                        </div>

                        <h3>
                            Scheduled Days Off
                        </h3>

                        {daysOff.length === 0 ? (
                            <p>
                                No days off scheduled.
                            </p>
                        ) : (
                            groupedDaysOff.map(
                                (group) => (
                                    <div
                                        key={group.ids.join(
                                            "-"
                                        )}
                                        style={{
                                            border:
                                                "1px solid #ccc",
                                            padding:
                                                "10px",
                                            marginBottom:
                                                "10px"
                                        }}
                                    >
                                        <p>
                                            <strong>
                                                {group.startDate ===
                                                    group.endDate
                                                    ? group.startDate
                                                    : `${group.startDate} – ${group.endDate}`}
                                            </strong>
                                        </p>

                                        <p>
                                            <strong>
                                                Reason:
                                            </strong>{" "}
                                            {group.reason ||
                                                "No reason provided"}
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemoveDayOff(
                                                    group.ids
                                                )
                                            }
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )
                            )
                        )}
                    </section>

                    {/* Breaks */}
                    <section>
                        <h2>Breaks</h2>

                        <div>
                            <label>
                                Day:
                                <select
                                    value={breakDay}
                                    onChange={(event) =>
                                        setBreakDay(
                                            event.target.value
                                        )
                                    }
                                >
                                    <option value="">
                                        Select a day
                                    </option>

                                    {dayNames.map(
                                        (
                                            day,
                                            index
                                        ) => (
                                            <option
                                                key={
                                                    index
                                                }
                                                value={
                                                    index
                                                }
                                            >
                                                {day}
                                            </option>
                                        )
                                    )}
                                </select>
                            </label>

                            <br />
                            <br />

                            <label>
                                Start time:
                                <input
                                    type="time"
                                    value={
                                        breakStart
                                    }
                                    onChange={(event) =>
                                        setBreakStart(
                                            event.target.value
                                        )
                                    }
                                />
                            </label>

                            <br />
                            <br />

                            <label>
                                End time:
                                <input
                                    type="time"
                                    value={
                                        breakEnd
                                    }
                                    onChange={(event) =>
                                        setBreakEnd(
                                            event.target.value
                                        )
                                    }
                                />
                            </label>

                            <br />
                            <br />

                            <label>
                                Name:
                                <input
                                    type="text"
                                    value={
                                        breakName
                                    }
                                    onChange={(event) =>
                                        setBreakName(
                                            event.target.value
                                        )
                                    }
                                    placeholder="e.g. Lunch"
                                />
                            </label>

                            <br />
                            <br />

                            <button
                                type="button"
                                onClick={
                                    handleAddBreak
                                }
                                disabled={
                                    breakDay === "" ||
                                    !breakStart ||
                                    !breakEnd
                                }
                            >
                                Add Break
                            </button>
                        </div>

                        <h3>
                            Scheduled Breaks
                        </h3>

                        {breaks.length === 0 ? (
                            <p>
                                No breaks scheduled.
                            </p>
                        ) : (
                            breaks.map(
                                (breakItem) => (
                                    <div
                                        key={
                                            breakItem.id
                                        }
                                        style={{
                                            border:
                                                "1px solid #ccc",
                                            padding:
                                                "10px",
                                            marginBottom:
                                                "10px"
                                        }}
                                    >
                                        <p>
                                            <strong>
                                                {
                                                    dayNames[
                                                    Number(
                                                        breakItem.day_of_week
                                                    )
                                                    ]
                                                }
                                            </strong>
                                        </p>

                                        <p>
                                            {breakItem.start_time.slice(
                                                0,
                                                5
                                            )}
                                            {" – "}
                                            {breakItem.end_time.slice(
                                                0,
                                                5
                                            )}
                                        </p>

                                        <p>
                                            <strong>
                                                Name:
                                            </strong>{" "}
                                            {breakItem.name ||
                                                "No name provided"}
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemoveBreak(
                                                    breakItem.id
                                                )
                                            }
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )
                            )
                        )}
                    </section>
                </>
            )}

            {/* Client dashboard */}
            {workingHours.length === 0 && (
                <section>
                    <h2>My Appointments</h2>

                    {appointments.length === 0 ? (
                        <p>
                            You don't have any appointments.
                        </p>
                    ) : (
                        appointments.map(
                            (appointment) => (
                                <div
                                    key={
                                        appointment.id
                                    }
                                    style={{
                                        border:
                                            "1px solid #ccc",
                                        padding: "15px",
                                        marginBottom:
                                            "15px"
                                    }}
                                >
                                    <h3>
                                        {
                                            appointment.service_name
                                        }
                                    </h3>

                                    <p>
                                        <strong>
                                            Barber:
                                        </strong>{" "}
                                        {
                                            appointment.barber_name
                                        }
                                    </p>

                                    <p>
                                        <strong>
                                            Shop:
                                        </strong>{" "}
                                        {
                                            appointment.shop_name
                                        }
                                    </p>

                                    <p>
                                        <strong>
                                            Date:
                                        </strong>{" "}
                                        {
                                            appointment.appointment_date
                                        }
                                    </p>

                                    <p>
                                        <strong>
                                            Time:
                                        </strong>{" "}
                                        {
                                            appointment.start_time
                                        }{" "}
                                        -{" "}
                                        {
                                            appointment.end_time
                                        }
                                    </p>

                                    <p>
                                        <strong>
                                            Price:
                                        </strong>{" "}
                                        €{appointment.price}
                                    </p>

                                    <p>
                                        <strong>
                                            Status:
                                        </strong>{" "}
                                        {appointment.status}
                                    </p>

                                    {appointment.status === "CONFIRMED" && (
                                        <div>
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

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateAppointmentStatus(
                                                        appointment.id,
                                                        "CANCELLED"
                                                    )
                                                }
                                            >
                                                Cancel Appointment
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )
                        )
                    )}
                </section>
            )}
        </main>
    );
}

export default Dashboard;