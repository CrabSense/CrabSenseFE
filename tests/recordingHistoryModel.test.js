import test from "node:test";
import assert from "node:assert/strict";
import {EMPTY_FILTERS,recordingQuery,recordingTime,durationLabel,modeLabel,csvCell} from "../src/pages/system/recordingHistoryModel.js";

test("Vietnam day filters use inclusive start and exclusive next-day end",()=>{
  const q=recordingQuery({...EMPTY_FILTERS,from:"2026-11-13",to:"2026-11-13",search:" CAM-01 "},2,25);
  assert.equal(q.from,"2026-11-13T00:00:00+07:00");
  assert.equal(q.to,"2026-11-14T00:00:00+07:00");
  assert.equal(q.search,"CAM-01");assert.equal(q.page,2);
  assert.equal(recordingQuery({...EMPTY_FILTERS,to:"2026-12-31"},1,25).to,"2027-01-01T00:00:00+07:00");
});
test("invalid date range rejected and absent bounds omitted",()=>{
  assert.throws(()=>recordingQuery({...EMPTY_FILTERS,from:"2026-11-14",to:"2026-11-13"},1,25));
  const q=recordingQuery(EMPTY_FILTERS,1,25);
  assert.equal(q.from,undefined);assert.equal(q.to,undefined);
});
test("unknown metadata stays unknown and durations are formatted",()=>{
  assert.equal(durationLabel(null),"Chưa xác định");
  assert.equal(durationLabel(0),"00:00:00");
  assert.equal(durationLabel(3661),"01:01:01");
  assert.equal(modeLabel(null),"Chưa xác định");
  assert.equal(modeLabel("AiEvent"),"Sự kiện AI");
  assert.equal(recordingTime(null),"Chưa xác định");
});
test("CSV escapes formula cells and quotes",()=>{
  assert.equal(csvCell("=1+1"),'"\'=1+1"');
  assert.equal(csvCell('a"b'),'"a""b"');
});
