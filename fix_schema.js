const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'apps/api/prisma/schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// The defaults are like `@default(PENDING)` and need to be `@default("PENDING")`
// Wait, not ALL defaults, only ones that are all caps or uppercase enum values.
// Actually any `@default([A-Z_]+)` should become `@default("$1")`
schema = schema.replace(/@default\(([A-Z_]+)\)/g, '@default("$1")');

fs.writeFileSync(schemaPath, schema);
console.log('Fixed default values.');
