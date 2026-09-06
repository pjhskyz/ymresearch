const axes = { action:30, change:25, impact:20, verification:15, source:10 };
const lens = ["Stanley Druckenmiller","Peter Thiel","Howard Marks","Ray Dalio","Marc Andreessen","Tyler Cowen","Balaji Srinivasan"];
export const rosterNames = ["Elon Musk","Jensen Huang","Sam Altman","Dario Amodei","Demis Hassabis","Satya Nadella","Mark Zuckerberg","Lisa Su","C.C. Wei","Masayoshi Son","Robin Zeng","Scott Strazik","Alex Karp","Noubar Afeyan","Brian Chesky",...lens];
const array = v => Array.isArray(v) ? v : [];
const unique = v => new Set(v).size === v.length;
const text = v => typeof v === "string" && v.trim().length > 0;
const url = v => { try { const u = new URL(v); return u.protocol === "https:" && !!u.hostname; } catch { return false; } };
const day = v => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0,10) === v;
const stamp = v => typeof v === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?\+09:00$/.test(v) && !Number.isNaN(Date.parse(v));
const dated = v => day(v) || stamp(v);
const id = v => typeof v === "string" && /^[a-z0-9][a-z0-9-]*$/.test(v);
export function validateResearch(data, previous = null) {
  const errors = [];
  const check = (ok, message) => { if (!ok) errors.push(message); };
  try {
    check(data?.schemaVersion === 2, "schemaVersion must remain 2 for deployment compatibility");
    check(day(data.asOfDate?.replaceAll(".","-")), "invalid asOfDate");
    check(stamp(data.updatedAt), "updatedAt must include +09:00");
    check(stamp(data.researchWindow?.start) && stamp(data.researchWindow?.end) && data.researchWindow.start <= data.researchWindow.end, "invalid researchWindow");
    check(data.lastSuccessfulRun === null || stamp(data.lastSuccessfulRun), "invalid lastSuccessfulRun");
    check(["signals","observations","no_signal","partial"].includes(data.status), "invalid run status");
    for(const key of ["statusMessage","dailyThesis"])check(text(data[key]), `missing ${key}`);
    for(const key of ["signals","observations","currentSignalIds","currentObservationIds","themes","checkpoints"])check(Array.isArray(data[key]), `missing array ${key}`);
    const cards = [...array(data.signals),...array(data.observations)];
    const cardIds = cards.map(s=>s.id);
    check(unique(cardIds), "duplicate card IDs across tiers");
    const r = data.research;
    check(r?.version === 1, "research extension version must be 1");
    for(const k of ["evidence","history","hypotheses","coverage","checkpointArchive"])check(Array.isArray(r?.[k]),`missing research.${k}`);
    const evidence = new Map(array(r?.evidence).map(e=>[e.id,e]));
    check(evidence.size===r.evidence.length, "duplicate evidence IDs");
    for(const e of r.evidence){ check(id(e.id)&&url(e.url)&&text(e.label)&&text(e.claim),`invalid evidence ${e.id}`);check(["A","B"].includes(e.grade)&&dated(e.publishedAt)&&stamp(e.verifiedAt),`invalid evidence provenance ${e.id}`); }
    const refs = (ids, label, nonempty=false) => check(Array.isArray(ids)&&(!nonempty||ids.length>0)&&unique(ids)&&ids.every(i=>evidence.has(i)),`${label}: unresolved/empty evidence refs`);
    const hypotheses=new Set(r.hypotheses.map(h=>h.id));
    check(hypotheses.size===r.hypotheses.length,"duplicate hypothesis IDs");
    for(const s of cards){
      check(id(s.id)&&id(s.eventId)&&hypotheses.has(s.hypothesisId),`invalid event/hypothesis ${s.id}`);
      check(rosterNames.some(n=>s.leader?.includes(`(${n})`)),`invalid leader ${s.id}`);
      for(const k of ["role","initials","theme","headline","takeaway","before","now","action","impact","counter","next","sourceLabel"])check(text(s[k]),`${s.id}: missing ${k}`);
      check(["신규","강화","약화","반전","실행"].includes(s.kind),`invalid kind ${s.id}`);
      check(day(s.date?.replaceAll(".","-"))&&day(s.reportDate?.replaceAll(".","-")),`invalid card dates ${s.id}`);
      check(Number.isInteger(s.score)&&s.score>=0&&s.score<=100,`invalid score ${s.id}`);
      check(url(s.source)&&["A","B"].includes(s.sourceGrade),`invalid card source ${s.id}`);
      check(Array.isArray(s.facts)&&s.facts.length>=2&&s.facts.length<=4&&s.facts.every(text),`invalid facts ${s.id}`);
      check(Array.isArray(s.impactPath)&&s.impactPath.length>=2&&s.impactPath.length<=4&&s.impactPath.every(text),`invalid impactPath ${s.id}`);
      const a=s.assessment;check(["reviewed","legacy_unreviewed"].includes(a?.status),`missing assessment ${s.id}`);
      if(a?.status==="reviewed"){
        check(stamp(a.assessedAt)&&a.rubricVersion===1,`invalid assessment date/version ${s.id}`);
        check(["statement","commitment","execution","outcome"].includes(a.stage),`invalid stage ${s.id}`);
        check(["positive","negative","mixed"].includes(a.impactDirection),`invalid direction ${s.id}`);
        check(["leader_direct","company_action","company_statement","third_party"].includes(a.attribution),`invalid attribution ${s.id}`);
        let sum=0;for(const [key,max] of Object.entries(axes)){const b=a.breakdown?.[key];check(Number.isInteger(b?.score)&&b.score>=0&&b.score<=max&&text(b.reason),`invalid ${key} breakdown ${s.id}`);sum+=b?.score||0;}
        check(sum===s.score,`score sum mismatch ${s.id}`);
        check(day(a.baseline?.date)&&text(a.baseline?.statement),`baseline missing ${s.id}`);refs(a.baseline?.evidenceIds,`baseline ${s.id}`,true);refs(a.evidenceIds,s.id,true);
        if(s.score>=75&&!lens.some(n=>s.leader.includes(`(${n})`)))check(["execution","outcome"].includes(a.stage)&&a.breakdown.action.score>=18,`executive decisive signal lacks execution ${s.id}`);
        check(dated(s.timing?.publishedAt)&&stamp(s.timing?.verifiedAt)&&stamp(s.timing?.firstSeenAt),`timing missing ${s.id}`);
      } else check(a?.breakdown===null&&a?.assessedAt===null,`legacy scores must not be reverse engineered ${s.id}`);
      check(Array.isArray(s.industryLinks),`missing industryLinks ${s.id}`);
      for(const link of array(s.industryLinks)){check(["confirmed","indirect","hypothesis"].includes(link.relationship)&&text(link.sector)&&text(link.text),`invalid industry link ${s.id}`);refs(link.evidenceIds,`industry ${s.id}`,link.relationship==="confirmed");}
    }
    check(unique(cards.map(s=>s.eventId)),"same event cannot appear twice in active cards");
    for(const [tier,current,min,max] of [["signals","currentSignalIds",75,100],["observations","currentObservationIds",60,74]]){
      const list=array(data[tier]);const ids=new Set(list.map(s=>s.id));check(list.every(s=>s.score>=min&&s.score<=max),`score outside ${tier}`);check(unique(array(data[current]))&&array(data[current]).every(i=>ids.has(i)),`invalid refs ${current}`);
      check(array(data[current]).every(i=>list.find(s=>s.id===i)?.assessment.status==="reviewed"),`current ${tier} requires reviewed assessment`);
      check(array(data[current]).every(i=>list.find(s=>s.id===i)?.reportDate===data.asOfDate),`current ${tier} must match report date`);
    }
    check(data.status!=="signals"||data.currentSignalIds.length>0,"signals needs current IDs");
    check(data.status!=="observations"||!data.currentSignalIds.length&&data.currentObservationIds.length>0,"observations status mismatch");
    check(data.status!=="no_signal"||!data.currentSignalIds.length&&!data.currentObservationIds.length,"no_signal status mismatch");
    check(r.coverage.length===22&&unique(r.coverage.map(c=>c.leader))&&rosterNames.every(n=>r.coverage.some(c=>c.leader.endsWith(`(${n})`))),"coverage must preserve 22 leaders");
    for(const c of r.coverage){check(["checked","blocked","legacy"].includes(c.status)&&text(c.note),`invalid coverage ${c.leader}`);if(c.status==="checked")check(stamp(c.checkedAt)&&c.urls.length>0&&c.urls.every(url),`checked leader needs source ledger ${c.leader}`);}
    const revisions=new Map(r.history.map(h=>[h.id,h]));check(revisions.size===r.history.length,"duplicate revision IDs");
    const eventIds=new Set(r.history.map(h=>h.eventId));
    for(const h of r.history){check(id(h.id)&&id(h.eventId)&&hypotheses.has(h.hypothesisId)&&stamp(h.recordedAt)&&url(h.source)&&h.snapshot&&h.score===h.snapshot.score,`invalid history ${h.id}`);refs(h.evidenceIds,`history ${h.id}`,h.status==="reviewed");if(h.previousRevisionId){const p=revisions.get(h.previousRevisionId);check(p&&p.eventId===h.eventId&&p.recordedAt<=h.recordedAt&&p.id!==h.id,`invalid previous revision ${h.id}`);}}
    for(const s of cards)check(r.history.some(h=>h.signalId===s.id&&h.eventId===s.eventId&&h.score===s.score&&h.headline===s.headline),`card has no matching history ${s.id}`);
    const checkpoints=[...array(data.checkpoints),...r.checkpointArchive];check(data.checkpoints.length<=6&&unique(checkpoints.map(c=>c.id)),"invalid checkpoint size or IDs");
    for(const c of checkpoints){check(id(c.id)&&text(c.test)&&text(c.title)&&hypotheses.has(c.hypothesisId)&&day(c.nextReviewDate)&&(c.dueDate===null||day(c.dueDate)),`invalid checkpoint ${c.id}`);check(["unverified","confirmed","refuted","delayed"].includes(c.status),`invalid checkpoint status ${c.id}`);refs(c.evidenceIds,`checkpoint ${c.id}`,c.status!=="unverified");if(c.status!=="unverified")check(stamp(c.reviewedAt)&&text(c.result),`checkpoint result missing ${c.id}`);check(Array.isArray(c.history),`checkpoint history missing ${c.id}`);}
    for(const t of data.themes){check(t.research&&Array.isArray(t.research.supporting)&&Array.isArray(t.research.opposing),`theme research missing ${t.name}`);for(const e of [...t.research.supporting,...t.research.opposing]){check(eventIds.has(e.eventId)&&["legacy","verified"].includes(e.status),`invalid theme event ${t.name}`);refs(e.evidenceIds,`theme ${t.name}`,e.status==="verified");}const groups=t.research.independentEventGroups;const grouped=groups.flatMap(g=>g.eventIds);check(unique(grouped)&&grouped.every(i=>eventIds.has(i)),`overlapping theme groups ${t.name}`);}
    if(previous?.research){
      check(data.lastSuccessfulRun>=previous.lastSuccessfulRun,"lastSuccessfulRun moved backwards");
      if(data.status==="partial")check(data.lastSuccessfulRun===previous.lastSuccessfulRun,"partial advanced success watermark");
      if(data.lastSuccessfulRun!==previous.lastSuccessfulRun){check(r.coverage.every(c=>c.status==="checked")&&data.runSummary.leadersChecked===22,"success requires 22 source ledgers");check(data.lastSuccessfulRun===data.researchWindow.end,"success must match research end");}
      for(const old of previous.research.history){const h=revisions.get(old.id);check(h&&JSON.stringify(h)===JSON.stringify(old),`immutable history changed ${old.id}`);}
      for(const old of previous.research.evidence){check(evidence.has(old.id)&&JSON.stringify(evidence.get(old.id))===JSON.stringify(old),`immutable evidence changed ${old.id}`);}
      const oldCheckpoints=[...previous.checkpoints,...previous.research.checkpointArchive];
      for(const old of oldCheckpoints){const c=checkpoints.find(n=>n.id===old.id);check(!!c,`checkpoint history disappeared ${old.id}`);if(c){check(old.history.every(h=>c.history.some(n=>JSON.stringify(n)===JSON.stringify(h))),`checkpoint history changed ${old.id}`);if(c.status!==old.status)check(c.history.some(h=>h.status===old.status&&h.result===old.result),`checkpoint transition needs previous result ${old.id}`);}}
      for(const s of cards.filter(s=>s.assessment.status==="legacy_unreviewed")){const old=[...previous.signals,...previous.observations].find(o=>o.id===s.id);check(old&&JSON.stringify(old)===JSON.stringify(s),`legacy record edited without reassessment ${s.id}`);}
    }
  } catch(error) { errors.push(`Malformed research data: ${error.message}`); }
  return errors;
}
