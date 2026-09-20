const db = require("../db");

const validateAppointmentSlot = async (
    barberId,
    serviceId,
    appointmentDate,
    startTime
) => {
    // Get service
    const serviceResult = await db.query(
        `SELECT id, duration
         FROM services
         WHERE id = $1
           AND barber_id = $2
           AND active = true`,
        [serviceId, barberId]
    );

    if (serviceResult.rows.length === 0) {
        return {
            valid: false,
            message: "Service not found"
        };
    }

    const serviceDuration = serviceResult.rows[0].duration;
    // Prevent booking in the past
    const [year, month, day] = appointmentDate.split("-").map(Number);
    const [hours, minutes] = startTime.split(":").map(Number);

const appointmentDateTime = new Date(
    year,
    month - 1,
    day,
    hours,
    minutes
);

if (appointmentDateTime <= new Date()) {
    return {
        valid: false,
        message: "Cannot book an appointment in the past"
    };
}
    // Calculate day of week without timezone conversion
    const selectedDate = new Date(year, month - 1, day);
    const dayOfWeek = selectedDate.getDay();

    // Get working hours
    const workingHoursResult = await db.query(
        `SELECT start_time, end_time, is_working
         FROM working_hours
         WHERE barber_id = $1
           AND day_of_week = $2`,
        [barberId, dayOfWeek]
    );

    if (
        workingHoursResult.rows.length === 0 ||
        !workingHoursResult.rows[0].is_working
    ) {
        return {
            valid: false,
            message: "Barber is not working on this day"
        };
    }

    const workingHours = workingHoursResult.rows[0];

    // Check day off
    const dayOffResult = await db.query(
        `SELECT id
         FROM days_off
         WHERE barber_id = $1
           AND date = $2`,
        [barberId, appointmentDate]
    );

    if (dayOffResult.rows.length > 0) {
        return {
            valid: false,
            message: "Barber is off on this date"
        };
    }

    // Convert time to minutes
    const timeToMinutes = (time) => {
        const [hours, minutes] = time.slice(0, 5).split(":").map(Number);
        return hours * 60 + minutes;
    };

    const startMinutes = timeToMinutes(startTime);
    const workStartMinutes = timeToMinutes(workingHours.start_time);
    const workEndMinutes = timeToMinutes(workingHours.end_time);

    const endMinutes = startMinutes + serviceDuration;

    // Appointment must fit inside working hours
    if (
        startMinutes < workStartMinutes ||
        endMinutes > workEndMinutes
    ) {
        return {
            valid: false,
            message: "Appointment is outside working hours"
        };
    }

    // Require 30-minute booking slots
    const minutesFromOpening = startMinutes - workStartMinutes;

    if (minutesFromOpening % 30 !== 0) {
        return {
            valid: false,
            message: "Invalid appointment time slot"
        };
    }

    // Get breaks
    const breaksResult = await db.query(
        `SELECT start_time, end_time
         FROM breaks
         WHERE barber_id = $1
           AND day_of_week = $2`,
        [barberId, dayOfWeek]
    );

    // Check break overlap
    for (const breakTime of breaksResult.rows) {
        const breakStart = timeToMinutes(breakTime.start_time);
        const breakEnd = timeToMinutes(breakTime.end_time);

        if (
            startMinutes < breakEnd &&
            endMinutes > breakStart
        ) {
            return {
                valid: false,
                message: "This time overlaps with a barber break"
            };
        }
    }

    // Check appointment overlap
    const appointmentsResult = await db.query(
        `SELECT start_time, end_time
         FROM appointments
         WHERE barber_id = $1
           AND appointment_date = $2
           AND status = 'CONFIRMED'`,
        [barberId, appointmentDate]
    );

    for (const appointment of appointmentsResult.rows) {
        const existingStart = timeToMinutes(appointment.start_time);
        const existingEnd = timeToMinutes(appointment.end_time);

        if (
            startMinutes < existingEnd &&
            endMinutes > existingStart
        ) {
            return {
                valid: false,
                message: "This appointment slot is already booked"
            };
        }
    }

    return {
        valid: true,
        duration: serviceDuration
    };
};

const getAvailableSlots = async (req, res) => {
    try {
        const { barberId, date, serviceId } = req.query;

        if (!barberId || !date || !serviceId) {
            return res.status(400).json({
                message: "Barber, date and service are required"
            });
        }

        // Get service
        const serviceResult = await db.query(
            `SELECT id, duration
             FROM services
             WHERE id = $1
               AND barber_id = $2
               AND active = true`,
            [serviceId, barberId]
        );

        if (serviceResult.rows.length === 0) {
            return res.status(404).json({
                message: "Service not found"
            });
        }

        const serviceDuration = serviceResult.rows[0].duration;

        // Get day of week
        const selectedDate = new Date(`${date}T00:00:00`);
        const dayOfWeek = selectedDate.getDay();

        // Check working hours
        const workingHoursResult = await db.query(
            `SELECT start_time, end_time, is_working
             FROM working_hours
             WHERE barber_id = $1
               AND day_of_week = $2`,
            [barberId, dayOfWeek]
        );

        if (
            workingHoursResult.rows.length === 0 ||
            !workingHoursResult.rows[0].is_working
        ) {
            return res.json({
                date,
                available_slots: []
            });
        }

        const workingHours = workingHoursResult.rows[0];

        // Check day off
        const dayOffResult = await db.query(
            `SELECT id
             FROM days_off
             WHERE barber_id = $1
               AND date = $2`,
            [barberId, date]
        );

        if (dayOffResult.rows.length > 0) {
            return res.json({
                date,
                available_slots: []
            });
        }

        // Get breaks
        const breaksResult = await db.query(
            `SELECT start_time, end_time
             FROM breaks
             WHERE barber_id = $1
               AND day_of_week = $2`,
            [barberId, dayOfWeek]
        );

        // Get existing appointments
        const appointmentsResult = await db.query(
            `SELECT start_time, end_time
             FROM appointments
             WHERE barber_id = $1
               AND appointment_date = $2
               AND status = 'CONFIRMED'`,
            [barberId, date]
        );

        const availableSlots = [];

        const start = new Date(
            `${date}T${workingHours.start_time}`
        );

        const end = new Date(
            `${date}T${workingHours.end_time}`
        );

        // Appointment start times are always 30 minutes apart
        const slotInterval = 30;

        for (
            let current = new Date(start);
            current < end;
            current.setMinutes(
                current.getMinutes() + slotInterval
            )
        ) {
            const slotStart = new Date(current);

            const slotEnd = new Date(current);
            slotEnd.setMinutes(
                slotEnd.getMinutes() + serviceDuration
            );

            // Service must finish before closing time
            if (slotEnd > end) {
                break;
            }

            const startTime = slotStart
                .toTimeString()
                .slice(0, 5);

            const endTime = slotEnd
                .toTimeString()
                .slice(0, 5);

            // Check break overlap
            const overlapsBreak = breaksResult.rows.some(
                (breakTime) => {
                    return (
                        startTime < breakTime.end_time &&
                        endTime > breakTime.start_time
                    );
                }
            );

            if (overlapsBreak) {
                continue;
            }

            // Check appointment overlap
            const overlapsAppointment =
                appointmentsResult.rows.some(
                    (appointment) => {
                        return (
                            startTime < appointment.end_time &&
                            endTime > appointment.start_time
                        );
                    }
                );

            if (overlapsAppointment) {
                continue;
            }

            availableSlots.push({
                start_time: startTime,
                end_time: endTime
            });
        }

        res.json({
            date,
            barber_id: Number(barberId),
            service_id: Number(serviceId),
            available_slots: availableSlots
        });

    } catch (error) {
        console.error("Get available slots error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};
const createAppointment = async (req, res) => {
    try {
        const {
            barberId,
            serviceId,
            appointmentDate,
            startTime
        } = req.body;

        if (!barberId || !serviceId || !appointmentDate || !startTime) {
            return res.status(400).json({
                message: "Barber, service, date and start time are required"
            });
        }

        // Check that the user is a client
        if (req.user.role !== "CLIENT") {
            return res.status(403).json({
                message: "Only clients can book appointments"
            });
        }

        // Check email verification
        const userResult = await db.query(
            `SELECT email_verified
             FROM users
             WHERE id = $1`,
            [req.user.id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (!userResult.rows[0].email_verified) {
            return res.status(403).json({
                message: "Email verification is required before booking"
            });
        }

        // Validate the requested appointment slot
const slotValidation = await validateAppointmentSlot(
    barberId,
    serviceId,
    appointmentDate,
    startTime
);

if (!slotValidation.valid) {
    return res.status(409).json({
        message: slotValidation.message
    });
}

const serviceDuration = slotValidation.duration;

// Calculate appointment end time
const [hours, minutes] = startTime.split(":").map(Number);

const totalMinutes = hours * 60 + minutes + serviceDuration;

const endHours = Math.floor(totalMinutes / 60);
const endMinutes = totalMinutes % 60;

const endTime =
    `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
// Check if client already has an upcoming appointment
const upcomingAppointment = await db.query(
    `SELECT id
     FROM appointments
     WHERE client_id = $1
       AND status = 'CONFIRMED'
       AND (
           appointment_date > CURRENT_DATE
           OR (
               appointment_date = CURRENT_DATE
               AND start_time > CURRENT_TIME
           )
       )
     LIMIT 1`,
    [req.user.id]
);

if (upcomingAppointment.rows.length > 0) {
    return res.status(409).json({
        message: "You already have an upcoming appointment"
    });
}
        // Create appointment
        const result = await db.query(
            `INSERT INTO appointments
                (client_id, barber_id, service_id,
                 appointment_date, start_time, end_time)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, client_id, barber_id, service_id,
                       appointment_date, start_time, end_time, status`,
            [
                req.user.id,
                barberId,
                serviceId,
                appointmentDate,
                startTime,
                endTime
            ]
        );

        res.status(201).json({
            message: "Appointment booked successfully",
            appointment: result.rows[0]
        });

    } catch (error) {
        console.error("Create appointment error:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                message: "This appointment slot is already booked"
            });
        }

        res.status(500).json({
            message: "Server error"
        });
    }
};
const cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;

        if (req.user.role !== "CLIENT") {
            return res.status(403).json({
                message: "Only clients can cancel appointments"
            });
        }

        const appointmentResult = await db.query(
            `SELECT id, appointment_date::text AS appointment_date, start_time, status
             FROM appointments
             WHERE id = $1
               AND client_id = $2`,
            [id, req.user.id]
        );

        if (appointmentResult.rows.length === 0) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        const appointment = appointmentResult.rows[0];

        if (appointment.status !== "CONFIRMED") {
            return res.status(400).json({
                message: "This appointment cannot be cancelled"
            });
        }

        const appointmentDateTime = new Date(
    `${appointment.appointment_date}T${appointment.start_time}`
);

        const now = new Date();

        const hoursUntilAppointment =
            (appointmentDateTime - now) / (1000 * 60 * 60);

        if (hoursUntilAppointment < 24) {
            return res.status(400).json({
                message: "Appointments can only be cancelled at least 24 hours in advance"
            });
        }

        const result = await db.query(
            `UPDATE appointments
             SET status = 'CANCELLED'
             WHERE id = $1
               AND client_id = $2
             RETURNING id, appointment_date, start_time, end_time, status`,
            [id, req.user.id]
        );

        res.json({
            message: "Appointment cancelled successfully",
            appointment: result.rows[0]
        });

    } catch (error) {
        console.error("Cancel appointment error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};
const getMyAppointments = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT
                a.id,
                a.appointment_date::text AS appointment_date,
                a.start_time,
                a.end_time,
                a.status,
                b.id AS barber_id,
                b.shop_name,
                u.name AS barber_name,
                s.id AS service_id,
                s.name AS service_name,
                s.price,
                s.duration
             FROM appointments a
             JOIN barbers b ON a.barber_id = b.id
             JOIN users u ON b.user_id = u.id
             JOIN services s ON a.service_id = s.id
             WHERE a.client_id = $1
             ORDER BY a.appointment_date DESC, a.start_time DESC`,
            [req.user.id]
        );

        res.json({
            appointments: result.rows
        });

    } catch (error) {
        console.error("Get my appointments error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};
const getBarberAppointments = async (req, res) => {
    try {
        if (req.user.role !== "BARBER") {
            return res.status(403).json({
                message: "Only barbers can view barber appointments"
            });
        }

        const barberResult = await db.query(
            `SELECT id
             FROM barbers
             WHERE user_id = $1`,
            [req.user.id]
        );

        if (barberResult.rows.length === 0) {
            return res.status(404).json({
                message: "Barber profile not found"
            });
        }

        const barberId = barberResult.rows[0].id;

        const result = await db.query(
            `SELECT
                a.id,
                a.appointment_date::text AS appointment_date,
                a.start_time,
                a.end_time,
                a.status,
                u.id AS client_id,
                u.name AS client_name,
                u.email AS client_email,
                s.id AS service_id,
                s.name AS service_name,
                s.price,
                s.duration
             FROM appointments a
             JOIN users u ON a.client_id = u.id
             JOIN services s ON a.service_id = s.id
             WHERE a.barber_id = $1
             ORDER BY a.appointment_date ASC, a.start_time ASC`,
            [barberId]
        );

        res.json({
            appointments: result.rows
        });

    } catch (error) {
        console.error("Get barber appointments error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};
const updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (req.user.role !== "BARBER") {
            return res.status(403).json({
                message: "Only barbers can update appointment status"
            });
        }

        const allowedStatuses = [
            "CONFIRMED",
            "COMPLETED",
            "CANCELLED"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid appointment status"
            });
        }

        const barberResult = await db.query(
            `SELECT id
             FROM barbers
             WHERE user_id = $1`,
            [req.user.id]
        );

        if (barberResult.rows.length === 0) {
            return res.status(404).json({
                message: "Barber profile not found"
            });
        }

        const barberId = barberResult.rows[0].id;

        const result = await db.query(
            `UPDATE appointments
             SET status = $1
             WHERE id = $2
               AND barber_id = $3
             RETURNING id, appointment_date, start_time,
                       end_time, status`,
            [status, id, barberId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        res.json({
            message: "Appointment status updated successfully",
            appointment: result.rows[0]
        });

    } catch (error) {
        console.error("Update appointment status error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    getAvailableSlots,
    createAppointment,
    cancelAppointment,
    getMyAppointments,
    getBarberAppointments,
    updateAppointmentStatus
};