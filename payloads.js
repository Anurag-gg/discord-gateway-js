export const identifyPayload = {
    "op": 2,
    "d": {
        "token": "token",
        "intents": 16383,
        "properties": {
            "$os": "linux",
            "$browser": "my_library",
            "$device": "my_library"
        }
    }
}

export const heartPayload = {
    "op": 1,
    "d": "sequence"
}

export const resumePayload = {
    "op": 6,
    "d": {
        "token": "token",
        "session_id": "session_id",
        "seq": "sequence"
    }
}