# Grapevine Hospital Management System — SQL queries

## 1. Show related appointment, patient, clinician records (up to 20).

```sql
SELECT t0."appointment_id" AS "appointment_appointment_id",
       t0."starts_at" AS "appointment_starts_at",
       t1."patient_id" AS "patient_patient_id",
       t1."given_name" AS "patient_given_name",
       t2."clinician_id" AS "clinician_clinician_id",
       t2."given_name" AS "clinician_given_name"
FROM portfolio."appointment" t0
JOIN portfolio."patient" t1 ON t0."patient_id" = t1."patient_id"
JOIN portfolio."clinician" t2 ON t0."clinician_id" = t2."clinician_id"
ORDER BY t0."appointment_id", t1."patient_id", t2."clinician_id"
LIMIT 20;
```

| appointment_appointment_id | appointment_starts_at | patient_patient_id | patient_given_name | clinician_clinician_id | clinician_given_name |
| --- | --- | --- | --- | --- | --- |
| 3001 | 2026-12-01T09:00:00+00:00 | 1001 | Avery | 2001 | Jordan |

## 2. Find appointment records where starts_at matches "2026-12-01T09:00:00Z" (up to 20).

```sql
SELECT * FROM portfolio."appointment"
WHERE "starts_at" IS NOT DISTINCT FROM '2026-12-01T09:00:00Z'
ORDER BY "appointment_id"
LIMIT 20;
```

| appointment_id | patient_id | clinician_id | starts_at | duration_minutes | status | reason |
| --- | --- | --- | --- | --- | --- | --- |
| 3001 | 1001 | 2001 | 2026-12-01T09:00:00+00:00 | 30 | scheduled | Routine consultation |

## 3. Count appointment records for each patient_id (up to 20 groups).

```sql
SELECT "patient_id", count(*) AS record_count
FROM portfolio."appointment"
GROUP BY "patient_id"
ORDER BY record_count DESC, "patient_id" NULLS LAST
LIMIT 20;
```

| patient_id | record_count |
| --- | --- |
| 1001 | 1 |


## Index comparison

| Phase | Median (ms) | Three runs (ms) | Plan nodes | Buffer hits |
| --- | --- | --- | --- | --- |
| Before index | 1.059 | 1.059, 1.059, 1.094 | Sort → Seq Scan | 112 |
| After index | 0.198 | 0.198, 0.198, 0.262 | Sort → Bitmap Heap Scan → Bitmap Index Scan | 25 |

The median execution time changed from 1.059 ms to 0.198 ms. The measured plan used p2_filter_idx. The results matched in both phases. An index adds storage and write-maintenance costs; timings depend on the selected lookup and environment.

## Execution plans

### Before index, run 1

```text
Sort (actual time=1.034..1.035 rows=20 loops=1)
  Seq Scan on appointment (actual time=0.014..1.002 rows=20 loops=1)
Planning Time: 0.324 ms
Execution Time: 1.059 ms
```

### Before index, run 2

```text
Sort (actual time=1.033..1.035 rows=20 loops=1)
  Seq Scan on appointment (actual time=0.013..0.999 rows=20 loops=1)
Planning Time: 0.325 ms
Execution Time: 1.059 ms
```

### Before index, run 3

```text
Sort (actual time=1.069..1.07 rows=20 loops=1)
  Seq Scan on appointment (actual time=0.015..1.036 rows=20 loops=1)
Planning Time: 0.334 ms
Execution Time: 1.094 ms
```

### After index, run 1

```text
Sort (actual time=0.145..0.147 rows=20 loops=1)
  Bitmap Heap Scan on appointment (actual time=0.025..0.111 rows=20 loops=1)
    Bitmap Index Scan using p2_filter_idx (actual time=0.013..0.013 rows=20 loops=1)
Planning Time: 0.549 ms
Execution Time: 0.198 ms
```

### After index, run 2

```text
Sort (actual time=0.148..0.149 rows=20 loops=1)
  Bitmap Heap Scan on appointment (actual time=0.05..0.113 rows=20 loops=1)
    Bitmap Index Scan using p2_filter_idx (actual time=0.013..0.013 rows=20 loops=1)
Planning Time: 0.528 ms
Execution Time: 0.198 ms
```

### After index, run 3

```text
Sort (actual time=0.195..0.196 rows=20 loops=1)
  Bitmap Heap Scan on appointment (actual time=0.035..0.148 rows=20 loops=1)
    Bitmap Index Scan using p2_filter_idx (actual time=0.018..0.019 rows=20 loops=1)
Planning Time: 1.046 ms
Execution Time: 0.262 ms
```

## Reproduce

Use a fresh database with the Portfolio 1 schema and sample data. Run Chibuzor_Anyaegbu_301913385_P2_Queries.sql, then Chibuzor_Anyaegbu_301913385_P2_Optimisation.sql. The optimisation script creates a separate performance table and runs EXPLAIN (ANALYZE, BUFFERS).

[Query screenshot](screenshots/Chibuzor_Anyaegbu_301913385_P2_QueryResults.png) · [Index comparison](screenshots/Chibuzor_Anyaegbu_301913385_P2_IndexComparison.png)

## References

- [PostgreSQL — EXPLAIN](https://www.postgresql.org/docs/17/using-explain.html)

