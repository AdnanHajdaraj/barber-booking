import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

function Booking() {
    const [barbers, setBarbers] = useState([]);
    const [selectedBarber, setSelectedBarber] = useState(null);

    const [workingHours, setWorkingHours] = useState([]);
    const [daysOff, setDaysOff] = useState([]);

    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(null);

    const [selectedDate, setSelectedDate] = useState("");
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);

    const [message, setMessage] = useState("Loading barbers...");

    // Get barbers
    useEffect(() => {
        const getBarbers = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5000/api/barbers"
                );

                const data = await response.json();

                if (!response.ok) {
                    setMessage(data.message || "Failed to load barbers.");
                    return;
                }

                setBarbers(data.barbers || []);
                setMessage("");
            } catch (error) {
                console.error(error);
                setMessage("Unable to connect to the server.");
            }
        };

        getBarbers();
    }, []);

    // Get working hours when barber is selected
    useEffect(() => {
        if (!selectedBarber) {
            setWorkingHours([]);
            return;
        }

        const getWorkingHours = async () => {
            try {
                const response = await fetch(
                    `http://localhost:5000/api/working-hours/public/${selectedBarber.id}`
                );

                const data = await response.json();

                if (!response.ok) {
                    console.error(
                        data.message || "Failed to load working hours."
                    );
                    setWorkingHours([]);
                    return;
                }

                setWorkingHours(data.working_hours || []);
            } catch (error) {
                console.error(error);
                setWorkingHours([]);
            }
        };

        getWorkingHours();
    }, [selectedBarber]);
    // Get days off when barber is selected
    useEffect(() => {
        if (!selectedBarber) {
            setDaysOff([]);
            return;
        }

        const getDaysOff = async () => {
            try {
                const response = await fetch(
                    `http://localhost:5000/api/days-off/public/${selectedBarber.id}`
                );

                const data = await response.json();

                if (!response.ok) {
                    console.error(
                        data.message || "Failed to load days off."
                    );
                    setDaysOff([]);
                    return;
                }

                setDaysOff(data.days_off || []);
            } catch (error) {
                console.error(error);
                setDaysOff([]);
            }
        };

        getDaysOff();
    }, [selectedBarber]);
    // Get services when barber is selected
    useEffect(() => {
        if (!selectedBarber) {
            setServices([]);
            setSelectedService(null);
            return;
        }

        const getServices = async () => {
            try {
                const response = await fetch(
                    `http://localhost:5000/api/services/public/${selectedBarber.id}`
                );

                const data = await response.json();

                if (!response.ok) {
                    console.error(
                        data.message || "Failed to load services."
                    );
                    setServices([]);
                    return;
                }

                setServices(data.services || []);
            } catch (error) {
                console.error(error);
                setServices([]);
            }
        };

        getServices();
    }, [selectedBarber]);

    // Get available time slots
    useEffect(() => {
        if (!selectedBarber || !selectedService || !selectedDate) {
            setAvailableSlots([]);
            return;
        }

        const getAvailableSlots = async () => {
            try {
                const params = new URLSearchParams({
                    barberId: selectedBarber.id,
                    serviceId: selectedService.id,
                    date: selectedDate
                });

                const response = await fetch(
                    `http://localhost:5000/api/appointments/availability?${params}`
                );

                const data = await response.json();

                if (!response.ok) {
                    console.error(
                        data.message || "Failed to load available slots."
                    );
                    setAvailableSlots([]);
                    return;
                }

                setAvailableSlots(data.available_slots || []);
            } catch (error) {
                console.error(error);
                setAvailableSlots([]);
            }
        };

        getAvailableSlots();
    }, [selectedBarber, selectedService, selectedDate]);

    const handleBooking = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            alert("You must be logged in to book an appointment.");
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:5000/api/appointments",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        barberId: selectedBarber.id,
                        serviceId: selectedService.id,
                        appointmentDate: selectedDate,
                        startTime: selectedSlot.start_time
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Failed to book appointment.");
                return;
            }

            alert("Appointment booked successfully!");

            setSelectedSlot(null);

            // Refresh available slots
            const params = new URLSearchParams({
                barberId: selectedBarber.id,
                serviceId: selectedService.id,
                date: selectedDate
            });

            const availabilityResponse = await fetch(
                `http://localhost:5000/api/appointments/availability?${params}`
            );

            const availabilityData =
                await availabilityResponse.json();

            if (availabilityResponse.ok) {
                setAvailableSlots(
                    availabilityData.available_slots || []
                );
            }
        } catch (error) {
            console.error(error);
            alert("Unable to connect to the server.");
        }
    };

    // Check if a date is a working day
    const isWorkingDay = (date) => {
        const dayOfWeek = date.getDay();

        return workingHours.some(
            (day) =>
                Number(day.day_of_week) === dayOfWeek &&
                day.is_working === true
        );
    };
    // Check if a date is a specific day off
    const isDayOff = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        const formattedDate = `${year}-${month}-${day}`;

        return daysOff.some((dayOff) => dayOff.date === formattedDate);
    };

   return (
  <main className="page booking">
    <header className="page-hero">
      <p className="eyebrow">Reserve your chair</p>
      <h1>Book an Appointment</h1>
      <p className="lede">
        Select a barber, service, date and available time.
      </p>
    </header>

    {/* Progress indicator */}
    <ol className="booking-progress" aria-label="Booking progress">
      <li className={selectedBarber ? "done" : "active"}>Barber</li>
      <li
        className={
          selectedService ? "done" : selectedBarber ? "active" : ""
        }
      >
        Service
      </li>
      <li
        className={
          selectedDate ? "done" : selectedService ? "active" : ""
        }
      >
        Date
      </li>
      <li
        className={
          selectedSlot ? "done" : selectedDate ? "active" : ""
        }
      >
        Time
      </li>
    </ol>

    {message && <p className="alert">{message}</p>}

    {/* Barber selection */}
    <section className="booking-step" aria-labelledby="step-barber">
      <h2 id="step-barber">1. Select a Barber</h2>

      <div className="option-grid">
        {barbers.map((barber) => {
          const isActive = selectedBarber?.id === barber.id;
          return (
            <button
              key={barber.id}
              type="button"
              className={`option-card ${isActive ? "is-active" : ""}`}
              aria-pressed={isActive}
              onClick={() => {
                setSelectedBarber(barber);
                setSelectedService(null);
                setSelectedDate("");
                setSelectedSlot(null);
                setAvailableSlots([]);
              }}
            >
              <h3>{barber.shop_name}</h3>
              <p>{barber.description}</p>
            </button>
          );
        })}
      </div>
    </section>

    {/* Service selection */}
    <section className="booking-step" aria-labelledby="step-service">
      <h2 id="step-service">2. Select a Service</h2>

      {!selectedBarber ? (
        <p className="hint">Select a barber first.</p>
      ) : services.length === 0 ? (
        <p className="hint">No services available for this barber.</p>
      ) : (
        <div className="option-grid">
          {services.map((service) => {
            const isActive = selectedService?.id === service.id;
            return (
              <button
                key={service.id}
                type="button"
                className={`option-card ${isActive ? "is-active" : ""}`}
                aria-pressed={isActive}
                onClick={() => {
                  setSelectedService(service);
                  setAvailableSlots([]);
                  setSelectedSlot(null);
                }}
              >
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                <div className="option-meta">
                  <span className="price">€{service.price}</span>
                  <span className="duration">
                    {service.duration} min
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>

    {/* Date selection */}
    <section className="booking-step" aria-labelledby="step-date">
      <h2 id="step-date">3. Select a Date</h2>

      <div className="calendar-wrap">
        <Calendar
          value={
            selectedDate
              ? new Date(`${selectedDate}T00:00:00`)
              : null
          }
          minDate={new Date()}
          tileDisabled={({ date, view }) => {
            if (view !== "month") return false;
            return !isWorkingDay(date) || isDayOff(date);
          }}
          onChange={(date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");

            setSelectedDate(`${year}-${month}-${day}`);
            setAvailableSlots([]);
            setSelectedSlot(null);
          }}
        />
      </div>
    </section>

    {/* Available times */}
    <section className="booking-step" aria-labelledby="step-time">
      <h2 id="step-time">4. Available Times</h2>

      {!selectedDate || !selectedService || !selectedBarber ? (
        <p className="hint">
          Select a barber, service and date to see available times.
        </p>
      ) : availableSlots.length === 0 ? (
        <p className="hint">No available times for this date.</p>
      ) : (
        <div className="slot-grid">
          {availableSlots.map((slot) => {
            const isActive =
              selectedSlot?.start_time === slot.start_time;
            return (
              <button
                key={slot.start_time}
                type="button"
                className={`slot ${isActive ? "is-active" : ""}`}
                aria-pressed={isActive}
                onClick={() => setSelectedSlot(slot)}
              >
                {slot.start_time}
              </button>
            );
          })}
        </div>
      )}
    </section>

    {/* Booking button */}
    <section className="booking-submit">
      <button
        type="button"
        className="btn btn-lg"
        disabled={
          !selectedBarber ||
          !selectedService ||
          !selectedDate ||
          !selectedSlot
        }
        onClick={handleBooking}
      >
        Book Appointment
      </button>
    </section>
  </main>
);
}

export default Booking;

