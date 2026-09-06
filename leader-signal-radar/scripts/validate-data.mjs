import fs from "node:fs";
import { validateResearch } from "../lib/validate-research.mjs";
const [file="public/data/daily.json",previousFile]=process.argv.slice(2);
const data=JSON.parse(fs.readFileSync(file,"utf8"));
const previous=previousFile?JSON.parse(fs.readFileSync(previousFile,"utf8")):null;
const errors=validateResearch(data,previous);
if(errors.length){console.error(errors.join("\n"));process.exit(1);}
console.log(`Valid: ${data.asOfDate} · ${data.currentSignalIds.length} decisive · ${data.currentObservationIds.length} observation · ${data.research.history.length} preserved revisions`);
