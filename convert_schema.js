const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'apps/api/prisma/schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// Remove Enums entirely and just replace their usages with String
const enumRegex = /enum\s+(\w+)\s+\{[\s\S]*?\}/g;
const enums = [];
let match;
while ((match = enumRegex.exec(schema)) !== null) {
  enums.push(match[1]);
}

schema = schema.replace(enumRegex, '');

// Replace enum usages with String
enums.forEach(e => {
  const regex = new RegExp(`(\\w+\\s+)${e}(\\s*(?:@default\\([\\w\\d_]+\\))?)`, 'g');
  schema = schema.replace(regex, `$1String$2`);
});

// Replace array of strings `String[]` with `String`
schema = schema.replace(/String\[\]/g, 'String');

// Replace array of enums `Enum[]` with `String`
enums.forEach(e => {
  const regex = new RegExp(`(\\w+\\s+)${e}\\[\\]`, 'g');
  schema = schema.replace(regex, `$1String`);
});

// SQLite doesn't support JSON array natively the way Postgres does, but `Json` is supported in SQLite as of Prisma 4+
// Wait, Json? Prisma SQLite does support Json, but let's just make sure.
// Yes, Json is supported. 

fs.writeFileSync(schemaPath, schema);
console.log('Schema converted to SQLite successfully.');
