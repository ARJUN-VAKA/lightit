import { prisma } from './src/lib/prisma';
import { computeFounderMatches } from './src/services/matchingEngine';

async function test() {
  const founder = await prisma.founder.findFirst();
  if (!founder) {
    console.log("No founder found");
    process.exit(1);
  }
  
  console.log("Testing with founder:", founder.id);
  try {
    const matches = await computeFounderMatches(founder.id);
    console.log("Matches:", matches.length);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    process.exit(0);
  }
}

test();
