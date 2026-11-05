# Grapevine Hospital Management System — database design

My case study records patient, clinician, appointment.

## Users

- Scheduling staff
- Clinicians
- Hospital administrators

## Main operations

- Register synthetic patients and clinicians
- Book and cancel appointments
- Review clinician schedules and workloads

## Entities

| Entity | Information stored |
| --- | --- |
| patient | Stores synthetic patient identity and contact details referenced by appointments. |
| clinician | Stores synthetic clinician identity, specialty, and active status for scheduling. |
| appointment | Records a scheduled patient visit with its clinician, start time, duration, and status. |

## patient

| Field | Type | Key | Required |
| --- | --- | --- | --- |
| patient_id | BIGINT | PK | Yes |
| given_name | TEXT |  | Yes |
| family_name | TEXT |  | Yes |
| birth_date | DATE |  | Yes |
| phone | TEXT |  | No |


## clinician

| Field | Type | Key | Required |
| --- | --- | --- | --- |
| clinician_id | BIGINT | PK | Yes |
| given_name | TEXT |  | Yes |
| family_name | TEXT |  | Yes |
| specialty | TEXT |  | Yes |
| active | BOOLEAN |  | Yes |


## appointment

| Field | Type | Key | Required |
| --- | --- | --- | --- |
| appointment_id | BIGINT | PK | Yes |
| patient_id | BIGINT | FK | Yes |
| clinician_id | BIGINT | FK | Yes |
| starts_at | TIMESTAMPTZ |  | Yes |
| duration_minutes | INTEGER |  | Yes |
| status | TEXT |  | Yes |
| reason | TEXT |  | No |
- patient_id → patient.patient_id
- clinician_id → clinician.clinician_id
- Unique key: (clinician_id, starts_at).

## Relationships and business rules

- Every appointment must reference an existing patient through patient_id.
- Every appointment must reference an existing clinician through clinician_id.
- A clinician cannot have two appointments with the same start timestamp.
- Appointment duration must be greater than zero minutes.

## Assumptions

- All records and identifiers are synthetic; no real patient, clinician, or student data is used.
- Each entity has one single-column primary key, with generated identifiers kept globally unique across the entities.
- Each appointment has one patient, one clinician, and one start timestamp; multi-clinician appointments are outside the model.
- A clinician may have no more than one appointment at a given start timestamp; overlaps at different start times are outside the model.
- The separate benchmark plan uses 20000 synthetic appointment rows and compares query plans without prescribing results or timings.

