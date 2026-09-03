-- Race-condition guarantees (spec section 40)

-- Hard guarantee for single-booking-per-day businesses (max_bookings_per_day = 1):
-- at most one active hold (PENDING or CONFIRMED) per calendar date.
CREATE UNIQUE INDEX "bookings_day_hold" ON "Booking" ("bookingDate") WHERE status IN ('PENDING', 'CONFIRMED');

-- Optional for time-slot businesses (max_bookings_per_day > 1):
-- drop "bookings_day_hold" and enable the exclusion constraint instead.
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Sequence used to generate human-readable booking codes (BK-YYYY-0001)
CREATE SEQUENCE "booking_code_seq" START 1;
