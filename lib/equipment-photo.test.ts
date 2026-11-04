import assert from "node:assert/strict"

import { pickBrandPhoto } from "./equipment-photo"

const brands = [
  { name: "GEA", productPhotoUrl: null },
  { name: "Sanden SPM-1003", productPhotoUrl: "https://utfs.io/f/sanden" },
  { name: "Panasonic SRM-P2DBLMR", productPhotoUrl: "https://utfs.io/f/panasonic" },
]

// Chosen brand wins, matched without case or surrounding spaces.
assert.equal(pickBrandPhoto(brands, " panasonic srm-p2dblmr "), "https://utfs.io/f/panasonic")

// No brand chosen, unknown brand, or a brand without a photo: first photo as an example.
assert.equal(pickBrandPhoto(brands), "https://utfs.io/f/sanden")
assert.equal(pickBrandPhoto(brands, "Merek ketik bebas"), "https://utfs.io/f/sanden")
assert.equal(pickBrandPhoto(brands, "GEA"), "https://utfs.io/f/sanden")

// No photos at all: the caller shows the category icon.
assert.equal(pickBrandPhoto([{ name: "GEA", productPhotoUrl: null }], "GEA"), null)
assert.equal(pickBrandPhoto([]), null)
assert.equal(pickBrandPhoto(undefined, "GEA"), null)

console.log("equipment-photo tests passed")
