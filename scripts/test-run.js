const fs = require('fs');
const path = require('path');

// Let's read dxf file and test
const dxfPath = path.join(__dirname, '../example_dwg_dxf/Layout Kalkulator Standar A Sales V2 revisi arsir.dxf');
const dxfContent = fs.readFileSync(dxfPath, 'utf8');

// We can compile/run test of dxf-parser logic
console.log("DXF File length:", dxfContent.length);
