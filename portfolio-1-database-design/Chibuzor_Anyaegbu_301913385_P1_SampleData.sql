-- Fictional sample records for Grapevine Hospital Management System.
BEGIN;
SET LOCAL standard_conforming_strings = on;
INSERT INTO portfolio."patient" ("patient_id", "given_name", "family_name", "birth_date", "phone") VALUES (1001, 'Avery', 'Reed', '1988-04-12', '555-0101');
INSERT INTO portfolio."clinician" ("clinician_id", "given_name", "family_name", "specialty", "active") VALUES (2001, 'Jordan', 'Lin', 'Cardiology', TRUE);
INSERT INTO portfolio."appointment" ("appointment_id", "patient_id", "clinician_id", "starts_at", "duration_minutes", "status", "reason") VALUES (3001, 1001, 2001, '2026-12-01T09:00:00Z', 30, 'scheduled', 'Routine consultation');
COMMIT;
