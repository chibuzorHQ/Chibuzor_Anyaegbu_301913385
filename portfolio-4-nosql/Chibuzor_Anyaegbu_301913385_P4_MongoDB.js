// Run once in mongosh against a fresh exercise database.
// These records are fictional events for the case study.
(async function () {
  db = db.getSiblingDB('portfolio_nosql');
  if ((await db.getCollectionNames()).includes("hospital_events")) {
    throw new Error('The exercise collection already exists. Use a fresh database.');
  }

  // The validator checks the stable event fields while details can vary.
  await db.createCollection("hospital_events", {
    validator: {
    "$jsonSchema": {
        "bsonType": "object",
        "required": [
            "_id",
            "schemaVersion",
            "simulation",
            "eventType",
            "occurredAt",
            "source",
            "embedded",
            "references",
            "details"
        ],
        "properties": {
            "_id": {
                "bsonType": "string",
                "minLength": 1
            },
            "schemaVersion": {
                "enum": [
                    1
                ]
            },
            "simulation": {
                "enum": [
                    true
                ]
            },
            "eventType": {
                "bsonType": "string",
                "enum": [
                    "appointment_booked",
                    "appointment_cancelled"
                ]
            },
            "occurredAt": {
                "bsonType": "date"
            },
            "source": {
                "bsonType": "object",
                "required": [
                    "entity",
                    "key",
                    "snapshot"
                ],
                "properties": {
                    "entity": {
                        "enum": [
                            "appointment"
                        ]
                    },
                    "key": {
                        "bsonType": "object",
                        "required": [
                            "appointment_id"
                        ]
                    },
                    "snapshot": {
                        "bsonType": "object"
                    }
                }
            },
            "embedded": {
                "bsonType": "object"
            },
            "references": {
                "bsonType": "object"
            },
            "details": {
                "bsonType": "object"
            }
        }
    }
},
    validationLevel: 'strict', validationAction: 'error'
  });

  // Insert the four example events and show their IDs.
  printjson(await db.getCollection("hospital_events").insertMany([
    {
        "_id": "event_000001",
        "schemaVersion": 1,
        "simulation": true,
        "eventType": "appointment_booked",
        "occurredAt": ISODate("2030-01-01T10:00:00Z"),
        "source": {
            "entity": "appointment",
            "key": {
                "appointment_id": 3001
            },
            "snapshot": {
                "appointment_id": 3001,
                "patient_id": 1001,
                "clinician_id": 2001,
                "starts_at": "2026-12-01T09:00:00Z",
                "duration_minutes": 30,
                "status": "scheduled",
                "reason": "Routine consultation"
            }
        },
        "embedded": {
            "patient": [
                {
                    "key": {
                        "patient_id": 1001
                    },
                    "snapshot": {
                        "patient_id": 1001,
                        "given_name": "Avery",
                        "family_name": "Reed",
                        "birth_date": "1988-04-12",
                        "phone": "555-0101"
                    },
                    "via": [
                        "appointment.patient_id → patient"
                    ]
                }
            ],
            "clinician": [
                {
                    "key": {
                        "clinician_id": 2001
                    },
                    "snapshot": {
                        "clinician_id": 2001,
                        "given_name": "Jordan",
                        "family_name": "Lin",
                        "specialty": "Cardiology",
                        "active": true
                    },
                    "via": [
                        "appointment.clinician_id → clinician"
                    ]
                }
            ]
        },
        "references": {},
        "details": {
            "channel": "web"
        }
    },
    {
        "_id": "event_000002",
        "schemaVersion": 1,
        "simulation": true,
        "eventType": "appointment_cancelled",
        "occurredAt": ISODate("2030-01-01T10:01:00Z"),
        "source": {
            "entity": "appointment",
            "key": {
                "appointment_id": 3001
            },
            "snapshot": {
                "appointment_id": 3001,
                "patient_id": 1001,
                "clinician_id": 2001,
                "starts_at": "2026-12-01T09:00:00Z",
                "duration_minutes": 30,
                "status": "scheduled",
                "reason": "Routine consultation"
            }
        },
        "embedded": {
            "patient": [
                {
                    "key": {
                        "patient_id": 1001
                    },
                    "snapshot": {
                        "patient_id": 1001,
                        "given_name": "Avery",
                        "family_name": "Reed",
                        "birth_date": "1988-04-12",
                        "phone": "555-0101"
                    },
                    "via": [
                        "appointment.patient_id → patient"
                    ]
                }
            ],
            "clinician": [
                {
                    "key": {
                        "clinician_id": 2001
                    },
                    "snapshot": {
                        "clinician_id": 2001,
                        "given_name": "Jordan",
                        "family_name": "Lin",
                        "specialty": "Cardiology",
                        "active": true
                    },
                    "via": [
                        "appointment.clinician_id → clinician"
                    ]
                }
            ]
        },
        "references": {},
        "details": {
            "channel": "mobile",
            "note": "Illustrative event-specific metadata",
            "examples": {
                "change_reason": "illustrative change_reason",
                "check_in_note": "illustrative check_in_note"
            }
        }
    }
]));
  await db.getCollection("hospital_events").createIndex({eventType: 1, occurredAt: -1}, {name: 'event_type_time'});

  // 1. Find the first sample event type (up to five documents).
  printjson(await db.getCollection("hospital_events").find({"eventType":"appointment_booked"}).sort({_id:1}).limit(5).toArray());

  // 2. Find events for the first source record using nested key fields (up to five).
  printjson(await db.getCollection("hospital_events").find({"source.key.appointment_id":3001}).sort({_id:1}).limit(5).toArray());

  // 3. Find events in the sample time range using a MongoDB Date filter (up to five).
  printjson(await db.getCollection("hospital_events").find({"occurredAt":{"$gte":ISODate("2030-01-01T10:00:00Z"), "$lt":ISODate("2030-01-01T11:00:00Z")}}).sort({_id:1}).limit(5).toArray());

  // 4. Count documents for each event type.
  printjson(await db.getCollection("hospital_events").aggregate([{"$group":{"_id":"$eventType", "documentCount":{"$sum":1}}}, {"$sort":{"_id":1}}]).toArray());

  // A date stored as text should be rejected by the validator.
  try {
    await db.getCollection("hospital_events").insertOne({...{
    "_id": "event_000001",
    "schemaVersion": 1,
    "simulation": true,
    "eventType": "appointment_booked",
    "occurredAt": ISODate("2030-01-01T10:00:00Z"),
    "source": {
        "entity": "appointment",
        "key": {
            "appointment_id": 3001
        },
        "snapshot": {
            "appointment_id": 3001,
            "patient_id": 1001,
            "clinician_id": 2001,
            "starts_at": "2026-12-01T09:00:00Z",
            "duration_minutes": 30,
            "status": "scheduled",
            "reason": "Routine consultation"
        }
    },
    "embedded": {
        "patient": [
            {
                "key": {
                    "patient_id": 1001
                },
                "snapshot": {
                    "patient_id": 1001,
                    "given_name": "Avery",
                    "family_name": "Reed",
                    "birth_date": "1988-04-12",
                    "phone": "555-0101"
                },
                "via": [
                    "appointment.patient_id → patient"
                ]
            }
        ],
        "clinician": [
            {
                "key": {
                    "clinician_id": 2001
                },
                "snapshot": {
                    "clinician_id": 2001,
                    "given_name": "Jordan",
                    "family_name": "Lin",
                    "specialty": "Cardiology",
                    "active": true
                },
                "via": [
                    "appointment.clinician_id → clinician"
                ]
            }
        ]
    },
    "references": {},
    "details": {
        "channel": "web"
    }
}, _id: 'invalid_date_example', occurredAt: 'not-a-date'});
  } catch (error) { print('Invalid date error: ' + error.code); }

  // Reusing an event ID should be rejected by the unique _id index.
  try { await db.getCollection("hospital_events").insertOne({
    "_id": "event_000001",
    "schemaVersion": 1,
    "simulation": true,
    "eventType": "appointment_booked",
    "occurredAt": ISODate("2030-01-01T10:00:00Z"),
    "source": {
        "entity": "appointment",
        "key": {
            "appointment_id": 3001
        },
        "snapshot": {
            "appointment_id": 3001,
            "patient_id": 1001,
            "clinician_id": 2001,
            "starts_at": "2026-12-01T09:00:00Z",
            "duration_minutes": 30,
            "status": "scheduled",
            "reason": "Routine consultation"
        }
    },
    "embedded": {
        "patient": [
            {
                "key": {
                    "patient_id": 1001
                },
                "snapshot": {
                    "patient_id": 1001,
                    "given_name": "Avery",
                    "family_name": "Reed",
                    "birth_date": "1988-04-12",
                    "phone": "555-0101"
                },
                "via": [
                    "appointment.patient_id → patient"
                ]
            }
        ],
        "clinician": [
            {
                "key": {
                    "clinician_id": 2001
                },
                "snapshot": {
                    "clinician_id": 2001,
                    "given_name": "Jordan",
                    "family_name": "Lin",
                    "specialty": "Cardiology",
                    "active": true
                },
                "via": [
                    "appointment.clinician_id → clinician"
                ]
            }
        ]
    },
    "references": {},
    "details": {
        "channel": "web"
    }
}); }
  catch (error) { print('Duplicate ID error: ' + error.code); }

  print('Document count: ' + await db.getCollection("hospital_events").countDocuments());
})().catch(error => { print(error.stack || String(error)); quit(1); });
