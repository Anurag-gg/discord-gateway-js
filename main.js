import WebSocket from "ws";
import { resumePayload, heartPayload, identifyPayload } from './payloads.js'
import data from './config.json'
const { token } = data

let sequence = 0
let session_id = ''
let heartRec = true


function connect() {
    const ws = new WebSocket("wss://gateway.discord.gg/?v=9&encoding=json")
    ws.on('open', function () {
        console.log("connected")
        ws.on('message', function incoming(message) {
            evaluate(JSON.parse(message), ws)
        });
    })
    ws.on('close', function (code, reason) {
        console.log(`disconnected with code:${code}\nReason: ${reason}`)
        heartRec = true
        reconnect(ws)
    })

}



function evaluate(message, ws) {
    const opcode = message.op
    switch (opcode) {
        case 10:
            console.log("hello payload received")
            const heartbeat_interval = message.d.heartbeat_interval
            heartbeat(heartbeat_interval, ws)
            if (session_id)
                resume(ws)
            else
                identify(ws)
            break
        case 11:
            console.log("heartbeat acknowledged")
            heartRec = true
            break
        case 0:
            let t = message.t
            sequence = message.s
            if (t === 'READY')
                session_id = message.d.session_id
            console.log(`event dispatched: ${t}`)
            break
        case 1:
            console.log('gateway requesting heartbeat')
            heartPayload.d = sequence
            ws.send(JSON.stringify(heartPayload))
            break
        default:
            console.log(message)
    }
}



function heartbeat(interval, ws) {
    const timer = setInterval(function () {
        if (heartRec) {
            heartPayload.d = sequence
            ws.send(JSON.stringify(heartPayload))
            console.log("heartbeat sent")
            heartRec = false
        }
        else {
            console.log("zombied connection , reconecting")
            heartRec = true
            clearInterval(timer)
            reconnect(ws)
        }

    }, interval)
}


function identify(ws) {
    identifyPayload.d.token = token
    ws.send(JSON.stringify(identifyPayload))
}

function resume(ws) {
    resumePayload.d.token = token
    resumePayload.d.session_id = session_id
    resumePayload.d.seq = sequence
    ws.send(JSON.stringify(resumePayload))
}

function reconnect(ws) {
    console.log("disconnecting...")
    ws.close()
    connect()
}


connect()