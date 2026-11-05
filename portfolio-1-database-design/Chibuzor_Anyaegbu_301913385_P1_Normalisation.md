# Grapevine Hospital Management System — normalisation

The example uses the saved sample records. The full set of fields is in the design and schema.

## Starting grouped records

| patient_id | appointment records (list) |
| --- | --- |
| 1001 | [3001] |


The record IDs are grouped in a list. In 1NF, each record has its own row and each cell holds one value.

## 1NF: one value per cell

| appointment.appointment_id | appointment.patient_id | appointment.clinician_id | appointment.status | patient.patient_id | patient.given_name | clinician.clinician_id | clinician.given_name |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 3001 | 1001 | 2001 | scheduled | 1001 | Avery | 2001 | Jordan |

Key: appointment_id.

## 2NF: depend on the whole key

appointment: clinician_id is a proper part of candidate key (clinician_id, starts_at), and determines clinician details.

## clinician_example

| clinician.clinician_id | clinician.given_name |
| --- | --- |
| 2001 | Jordan |

## appointment_example

| appointment.appointment_id | appointment.patient_id | appointment.clinician_id | appointment.status | patient.patient_id | patient.given_name |
| --- | --- | --- | --- | --- | --- |
| 3001 | 1001 | 2001 | scheduled | 1001 | Avery |

## 3NF: store each entity’s details once

The entity keys determine their own descriptions. Related records keep foreign keys rather than repeating those descriptions.

## patient

| patient_id | given_name | family_name | birth_date | phone |
| --- | --- | --- | --- | --- |
| 1001 | Avery | Reed | 1988-04-12 | 555-0101 |

## clinician

| clinician_id | given_name | family_name | specialty | active |
| --- | --- | --- | --- | --- |
| 2001 | Jordan | Lin | Cardiology | true |

## appointment

| appointment_id | patient_id | clinician_id | starts_at | duration_minutes | status | reason |
| --- | --- | --- | --- | --- | --- | --- |
| 3001 | 1001 | 2001 | 2026-12-01T09:00:00+00:00 | 30 | scheduled | Routine consultation |

## Dependencies

- patient: (patient_id) → given_name, family_name, birth_date, phone
- clinician: (clinician_id) → given_name, family_name, specialty, active
- appointment: (appointment_id) → patient_id, clinician_id, starts_at, duration_minutes, status, reason

Joining the decomposed sample tables reproduces the original 1 example rows. The design assumes the declared keys describe the relevant business dependencies.
