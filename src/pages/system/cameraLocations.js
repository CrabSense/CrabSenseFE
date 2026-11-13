// Group by stable IDs, never by display names. Catalog entries remain visible even if empty.
export function locationSummary(cameras, areas) {
  const assigned=cameras.filter(c=>Boolean(c.farmingAreaId)).length;
  return {areas:areas.length,assigned,unassigned:cameras.length-assigned};
}

export function buildLocationGroups(cameras, filtered, areas, area="all", row="all") {
  const visible=new Set(filtered.map(c=>c.id));
  const catalog=new Map(areas.map(a=>[a.id,a]));
  const allAreaIds=new Set([...catalog.keys(),...cameras.map(c=>c.farmingAreaId||"none"),"none"]);
  return [...allAreaIds].filter(id=>area==="all"||id===area).map(id=>{
    const entry=catalog.get(id);
    const all=cameras.filter(c=>(c.farmingAreaId||"none")===id);
    const rows=new Map((entry?.rows||[]).map(r=>[r.id,r]));
    const rowIds=new Set([...rows.keys(),...all.map(c=>c.farmingRowId||"none")]);
    // Unassigned row group appears only when there are devices in it.
    const groups=[...rowIds].filter(rid=>row==="all"||rid===row).map(rid=>{
      const r=rows.get(rid);
      const members=all.filter(c=>(c.farmingRowId||"none")===rid);
      return {id:rid,name:rid==="none"?"Chưa gán dãy":r?.name||r?.code||members[0]?.rowName||"Dãy chưa xác định",
        inactive:r?.isActive===false,canAssign:rid==="none"||r?.isActive===true,all:members,items:members.filter(c=>visible.has(c.id))};
    });
    return {id,name:id==="none"?"Camera chưa gán khu":entry?.name||entry?.code||all[0]?.areaName||"Khu chưa xác định",
      canAssign:entry?.isActive===true,all,rows:groups};
  }).filter(group=>row==="all"||group.rows.length);
}
