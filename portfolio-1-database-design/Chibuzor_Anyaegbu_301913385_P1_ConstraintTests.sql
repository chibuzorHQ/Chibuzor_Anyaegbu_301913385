-- Run these deliberately invalid statements one at a time, outside a transaction.
-- Each should fail at the named constraint; the sample rows should remain unchanged.

-- 1. patient pk rejection. Expected: pk_patient, SQLSTATE 23505.
INSERT INTO portfolio."patient" ("patient_id", "given_name", "family_name", "birth_date", "phone")
VALUES (1001, 'Casey', 'Park', '1990-06-15', '555-0102');

-- 2. patient not null rejection. Expected: given_name, SQLSTATE 23502.
INSERT INTO portfolio."patient" ("patient_id", "given_name", "family_name", "birth_date", "phone")
VALUES (4001, NULL, 'Vale', '1992-07-18', '555-0103');

-- 3. clinician pk rejection. Expected: pk_clinician, SQLSTATE 23505.
INSERT INTO portfolio."clinician" ("clinician_id", "given_name", "family_name", "specialty", "active")
VALUES (2001, 'Morgan', 'Shah', 'Neurology', TRUE);

-- 4. appointment pk rejection. Expected: pk_appointment, SQLSTATE 23505.
INSERT INTO portfolio."appointment" ("appointment_id", "patient_id", "clinician_id", "starts_at", "duration_minutes", "status", "reason")
VALUES (3001, 1001, 2001, '2026-12-01T10:00:00Z', 30, 'scheduled', 'Follow-up');

-- 5. appointment unique rejection. Expected: uq_appointment_0, SQLSTATE 23505.
INSERT INTO portfolio."appointment" ("appointment_id", "patient_id", "clinician_id", "starts_at", "duration_minutes", "status", "reason")
VALUES (3002, 1001, 2001, '2026-12-01T09:00:00Z', 45, 'scheduled', 'Consultation');

-- 6. appointment patient fk rejection. Expected: fk_appointment_0, SQLSTATE 23503.
INSERT INTO portfolio."appointment" ("appointment_id", "patient_id", "clinician_id", "starts_at", "duration_minutes", "status", "reason")
VALUES (3003, 9001, 2001, '2026-12-01T11:00:00Z', 30, 'scheduled', 'Consultation');

-- 7. appointment clinician fk rejection. Expected: fk_appointment_1, SQLSTATE 23503.
INSERT INTO portfolio."appointment" ("appointment_id", "patient_id", "clinician_id", "starts_at", "duration_minutes", "status", "reason")
VALUES (3004, 1001, 9002, '2026-12-01T12:00:00Z', 30, 'scheduled', 'Consultation');

-- 8. appointment duration check rejection. Expected: positive_duration, SQLSTATE 23514.
INSERT INTO portfolio."appointment" ("appointment_id", "patient_id", "clinician_id", "starts_at", "duration_minutes", "status", "reason")
VALUES (3005, 1001, 2001, '2026-12-01T13:00:00Z', 0, 'scheduled', 'Consultation');
