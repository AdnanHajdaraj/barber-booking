-- USERS
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'CLIENT',
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT users_role_check
        CHECK (role IN ('CLIENT', 'BARBER', 'ADMIN'))
);


-- BARBERS
CREATE TABLE barbers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    shop_name VARCHAR(150),
    description TEXT,

    CONSTRAINT fk_barber_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- SERVICES
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    barber_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration INTEGER NOT NULL DEFAULT 25,
    active BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_service_barber
        FOREIGN KEY (barber_id)
        REFERENCES barbers(id)
        ON DELETE CASCADE,

    CONSTRAINT services_price_check
        CHECK (price >= 0),

    CONSTRAINT services_duration_check
        CHECK (duration > 0)
);


-- WORKING HOURS
CREATE TABLE working_hours (
    id SERIAL PRIMARY KEY,
    barber_id INTEGER NOT NULL,
    day_of_week INTEGER NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_working BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_working_hours_barber
        FOREIGN KEY (barber_id)
        REFERENCES barbers(id)
        ON DELETE CASCADE,

    CONSTRAINT working_hours_day_check
        CHECK (day_of_week BETWEEN 0 AND 6),

    CONSTRAINT working_hours_time_check
        CHECK (start_time < end_time),

    CONSTRAINT unique_barber_day
        UNIQUE (barber_id, day_of_week)
);


-- BREAKS
CREATE TABLE breaks (
    id SERIAL PRIMARY KEY,
    barber_id INTEGER NOT NULL,
    day_of_week INTEGER NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    name VARCHAR(100) NOT NULL DEFAULT 'Break',

    CONSTRAINT fk_break_barber
        FOREIGN KEY (barber_id)
        REFERENCES barbers(id)
        ON DELETE CASCADE,

    CONSTRAINT breaks_day_check
        CHECK (day_of_week BETWEEN 0 AND 6),

    CONSTRAINT breaks_time_check
        CHECK (start_time < end_time)
);


-- DAYS OFF
CREATE TABLE days_off (
    id SERIAL PRIMARY KEY,
    barber_id INTEGER NOT NULL,
    date DATE NOT NULL,
    reason VARCHAR(255),

    CONSTRAINT fk_day_off_barber
        FOREIGN KEY (barber_id)
        REFERENCES barbers(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_barber_day_off
        UNIQUE (barber_id, date)
);


-- APPOINTMENTS
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL,
    barber_id INTEGER NOT NULL,
    service_id INTEGER NOT NULL,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_appointment_client
        FOREIGN KEY (client_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_appointment_barber
        FOREIGN KEY (barber_id)
        REFERENCES barbers(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_appointment_service
        FOREIGN KEY (service_id)
        REFERENCES services(id)
        ON DELETE RESTRICT,

    CONSTRAINT appointments_status_check
        CHECK (status IN ('CONFIRMED', 'COMPLETED', 'CANCELLED')),

    CONSTRAINT appointments_time_check
        CHECK (start_time < end_time)
);


-- Prevent the same barber from having
-- two appointments starting at exactly the same time.
CREATE UNIQUE INDEX unique_active_appointment
ON appointments (barber_id, appointment_date, start_time)
WHERE status = 'CONFIRMED';