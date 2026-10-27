import assert from "node:assert/strict"

import { buildIotLookup, getStoreIot } from "./iot-status"

const lookup = buildIotLookup([
  { id: "1", code: "TI90", status: "live", deviceCount: 6, isRecording: true },
  { id: "2", code: "2jc2", status: "historical", deviceCount: 1 },
  { id: "iot-9", code: "", status: "live" },
  { id: "iot-10", status: "live" },
])

assert.deepEqual(getStoreIot(lookup, "ti90"), {
  status: "live",
  deviceCount: 6,
  isRecording: true,
})
assert.equal(getStoreIot(lookup, "2JC2")?.status, "historical")
assert.deepEqual(getStoreIot(lookup, "W441"), {
  status: "none",
  deviceCount: 0,
  isRecording: false,
})

const unavailable = buildIotLookup({ error: "down" })
assert.equal(unavailable.available, false)
assert.equal(getStoreIot(unavailable, "TI90"), null)

console.log("iot-status tests passed")
