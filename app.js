var curPrice=50,curSz='A4',curClr='흑백',curType='laser',curDisc='일반',curPaper='일반 용지',risoPaper='무광';
var selectedFile=null,orderCount=0,notifs=[],isAdmin=false;
var admFilter='wait', selectedRisoSlot=null, risoBookings={};

// ══════════ SUPABASE 설정 ══════════
// 아래 두 값을 Supabase 프로젝트에서 복사해서 넣어주세요
// https://supabase.com → 프로젝트 → Settings → API
var SUPABASE_URL = 'https://mgptjwqrhdvywrzsnxnj.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ncHRqd3FyaGR2eXdyenNueG5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMDc1MTUsImV4cCI6MjA4OTc4MzUxNX0.fWnTX3fON0_rec6b_jqW_tJRq2f7etaEx3z8aK-eY-o';

var SB_HEADERS = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
  'Content-Type': 'application/json'
};

function sbReady() {
  // 매번 호출 시 최신 값으로 헤더 갱신
  SB_HEADERS = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
    'Content-Type': 'application/json'
  };
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
}
// ══════════════════════════════════

var WORKERS=[{n:'김경민',p:'010-3848-1516'},{n:'방재연',p:'010-5407-9063'},{n:'이현정',p:'010-3366-8651'},{n:'윤유라',p:'010-7190-7812'},{n:'임수호',p:'010-2039-4578'},{n:'배금비',p:'010-6612-1459'},{n:'성수연',p:'010-4941-8502'}];
var SCHED={'월':[{t:'10:30~13:00',w:'이현정'},{t:'15:30~18:00',w:'이현정'}],'화':[{t:'10:30~15:30',w:'방재연'},{t:'15:30~18:00',w:'성수연'}],'수':[{t:'10:30~13:00',w:'윤유라'},{t:'13:00~15:30',w:'임수호'}],'목':[{t:'13:00~16:00',w:'윤유라'},{t:'15:30~18:00',w:'성수연'}],'금':[{t:'10:30~13:00',w:'배금비'},{t:'15:30~18:00',w:'김경민'}]};
var ALL_SLOTS=['10:30','10:45','11:00','11:15','11:30','11:45','12:00','12:15','12:30','12:45','13:00','13:15','13:30','13:45','14:00','14:15','14:30','14:45','15:00','15:15','15:30','15:45','16:00','16:15','16:30','16:45','17:00','17:15'];
var STATIC_TAKEN={'10:30':1,'10:45':1,'15:45':1,'16:00':1};

var myOrders=[{id:'A34',date:'3/17',type:'A1',color:'컬러',paper:'유광 코팅지',qty:1,copy:1,cost:7500,disc:'학생회 임원',dep:true,prt:false,pku:false,note:'맞춤인쇄!',adminNote:'파일 확인 완료, 출력 진행 중'}];

var adminOrders=[
  {id:'A35',date:'3/17 14:23',name:'박지율',sid:'20253149',phone:'010-6386-5340',type:'A4',color:'흑백',paper:'일반 용지',qty:5,copy:1,cost:250,disc:'',dep:false,prt:false,pku:false,note:'실제 사이즈로 부탁드립니다',adminNote:'',worker:'방재연',fileOk:true,errType:''},
  {id:'A34',date:'3/17 13:10',name:'김민지',sid:'20231572',phone:'010-2277-1694',type:'A1',color:'컬러',paper:'유광 코팅지',qty:1,copy:1,cost:7500,disc:'학생회 임원',dep:true,prt:false,pku:false,note:'맞춤인쇄!',adminNote:'출력 중',worker:'방재연',fileOk:true,errType:''},
  {id:'A33',date:'3/12 11:05',name:'오지원',sid:'20252811',type:'A3',color:'흑백',paper:'무광 코팅지',qty:1,copy:1,cost:100,disc:'과대',dep:true,prt:true,pku:false,note:'',adminNote:'',worker:'임수호',fileOk:true,errType:''},
  {id:'A32',date:'3/11 16:40',name:'최창현',sid:'20231591',type:'A2',color:'컬러',paper:'반광 코팅지',qty:2,copy:1,cost:10000,disc:'',dep:true,prt:false,pku:false,note:'',adminNote:'',worker:'윤유라',fileOk:false,errType:'파일 오류'},
  {id:'A31',date:'3/11 10:15',name:'원준희',sid:'20231584',type:'A4',color:'컬러',paper:'일반 용지',qty:1,copy:2,cost:200,disc:'',dep:true,prt:true,pku:true,note:'',adminNote:'',worker:'윤유라',fileOk:true,errType:''}
];

var historyData=[
  {id:'A10',date:'3/16',name:'정예진',sid:'20231595',spec:'리소',qty:70,pages:1,cost:2900,dep:false,prt:false,pku:false},
  {id:'A9',date:'3/16',name:'김민지',sid:'20231572',spec:'리소',qty:70,pages:3,cost:5900,dep:true,prt:false,pku:false},
  {id:'A8',date:'3/14',name:'원준희',sid:'20231584',spec:'리소',qty:70,pages:3,cost:5900,dep:true,prt:true,pku:false},
  {id:'A7',date:'3/13',name:'정예진',sid:'20231595',spec:'리소',qty:70,pages:3,cost:5900,dep:true,prt:true,pku:false},
  {id:'A6',date:'3/12',name:'오유진',sid:'20241573',spec:'리소',qty:70,pages:2,cost:4400,dep:true,prt:true,pku:true},
  {id:'A5',date:'3/11',name:'정연우',sid:'20210562',spec:'리소',qty:70,pages:2,cost:4400,dep:true,prt:true,pku:true},
  {id:'A4',date:'3/11',name:'원준희',sid:'20231584',spec:'리소',qty:70,pages:3,cost:5900,dep:true,prt:true,pku:true},
  {id:'A3',date:'3/10',name:'오유진',sid:'20241573',spec:'리소',qty:70,pages:3,cost:5900,dep:true,prt:true,pku:true},
  {id:'A2',date:'3/10',name:'에바 아나스테',sid:'20241590',spec:'리소',qty:65,pages:3,cost:5800,dep:true,prt:true,pku:true},
  {id:'A1',date:'3/10',name:'김유록',sid:'20241560',spec:'리소',qty:6,pages:1,cost:1620,dep:true,prt:true,pku:true},
  {id:'A0',date:'3/9',name:'홍길동',sid:'20220000',spec:'리소',qty:5,pages:0,cost:100,dep:true,prt:true,pku:true}
];

// ── MODE ──
function toggleMode(){
  isAdmin=!isAdmin;
  document.getElementById('stuPage').classList.toggle('on',!isAdmin);
  document.getElementById('adminPage').classList.toggle('on',isAdmin);
  document.getElementById('tbTitle').textContent=isAdmin?'관리자 대시보드':'출력실 신청 2026-1';
  document.getElementById('tbSub').textContent=isAdmin?'근무자 전용':'시각디자인학과 · 출력 서비스';
  document.getElementById('modeBtn').textContent=isAdmin?'학생 화면':'관리자';
  if(isAdmin) renderAdminOrders();
}

// ── STUDENT TABS ──
function showSTab(n){
  for(var i=0;i<=5;i++){var e=document.getElementById('st'+i);if(e)e.style.display=i===n?'block':'none';}
  document.querySelectorAll('#stuTabs .tab').forEach(function(t,i){t.classList.toggle('on',i===n);});
  if(n===3)renderMyOrders();
  if(n===4)fuInit();
}

// ── ADMIN TABS ──
function showAdmTab(n){
  ['at0','at1','at2','at3','at4'].forEach(function(id,i){var e=document.getElementById(id);if(e)e.style.display=i===n?'block':'none';});
  document.querySelectorAll('.adm-tab').forEach(function(t,i){t.classList.toggle('on',i===n);});
  if(n===1)renderHistory();
  if(n===3)admLoadFiles();
  if(n===4)renderSettlement();
}

// ── ADMIN FILTER ──
function setAdmFilter(f,el){
  admFilter=f;
  document.querySelectorAll('.adm-sum-item').forEach(function(e){e.classList.remove('active');});
  el.classList.add('active');
  renderAdminOrders();
}

function getFiltered(){
  var q=(document.getElementById('admSearch')?document.getElementById('admSearch').value:'').trim().toLowerCase();
  return adminOrders.filter(function(o){
    if(q){var s=(o.id+o.name+o.sid).toLowerCase();if(s.indexOf(q)<0)return false;}
    if(admFilter==='wait')return !o.dep;
    if(admFilter==='print')return o.dep&&!o.pku;
    if(admFilter==='done')return o.pku;
    return true;
  });
}

// ── ADMIN ORDERS ──
function renderAdminOrders(){
  if(!sbReady()){_renderAdminOrdersLocal();return;}
  var q=(document.getElementById('admSearch')?document.getElementById('admSearch').value:'').trim().toLowerCase();
  var statusFilter='';
  if(admFilter==='wait') statusFilter='&dep=eq.false';
  else if(admFilter==='print') statusFilter='&dep=eq.true&pku=eq.false';
  else if(admFilter==='done') statusFilter='&pku=eq.true';
  var search=q?'':'';
  fetch(SUPABASE_URL+'/rest/v1/orders?order=created_at.desc&limit=200'+statusFilter,{headers:SB_HEADERS})
  .then(function(r){return r.json();})
  .then(function(rows){
    if(!Array.isArray(rows))rows=[];
    // 검색 필터 클라이언트 사이드
    if(q) rows=rows.filter(function(o){return (o.order_id+o.name+o.sid).toLowerCase().indexOf(q)>=0;});
    adminOrders=rows.map(function(r){return {
      id:r.order_id,dbId:r.id,date:new Date(r.created_at).toLocaleString('ko-KR',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}),
      name:r.name,sid:r.sid,phone:r.phone||'',type:r.type,color:r.color,paper:r.paper,
      qty:r.qty,copy:r.copy,cost:r.cost,disc:r.disc||'',
      dep:r.dep,prt:r.prt,pku:r.pku,note:r.note||'',adminNote:r.admin_note||'',
      worker:r.worker||'미배정',fileOk:r.file_ok,errType:r.err_type||''
    };});
    document.getElementById('num-wait').textContent=rows.filter(function(o){return !o.dep;}).length;
    document.getElementById('num-print').textContent=rows.filter(function(o){return o.dep&&!o.pku;}).length;
    document.getElementById('num-done').textContent=rows.filter(function(o){return o.pku;}).length;
    document.getElementById('num-all').textContent=rows.length;
    _renderAdminOrdersLocal();
  })
  .catch(function(){_renderAdminOrdersLocal();});
}

function _renderAdminOrdersLocal(){
  var q=(document.getElementById('admSearch')?document.getElementById('admSearch').value:'').trim().toLowerCase();
  var filtered=adminOrders.filter(function(o){
    if(q){var s=(o.id+o.name+o.sid).toLowerCase();if(s.indexOf(q)<0)return false;}
    if(admFilter==='wait')return !o.dep;
    if(admFilter==='print')return o.dep&&!o.pku;
    if(admFilter==='done')return o.pku;
    return true;
  });
  document.getElementById('num-wait').textContent=adminOrders.filter(function(o){return !o.dep;}).length;
  document.getElementById('num-print').textContent=adminOrders.filter(function(o){return o.dep&&!o.pku;}).length;
  document.getElementById('num-done').textContent=adminOrders.filter(function(o){return o.pku;}).length;
  document.getElementById('num-all').textContent=adminOrders.length;
  var list=document.getElementById('admOrderList');
  if(!filtered.length){list.innerHTML='<div style="padding:32px;text-align:center;color:var(--tx3);font-size:14px">해당 신청이 없습니다</div>';return;}
  list.innerHTML=filtered.map(function(o){
    var i=adminOrders.indexOf(o);
    var cls=o.errType?'s-err':o.pku?'s-done':(o.dep&&!o.prt)?'s-print':'s-wait';
    var discTag=o.disc?'<span class="tag tg" style="margin-left:4px;font-size:10px">'+o.disc+'</span>':'';
    var noteHtml=o.note?'<div class="adm-note">'+o.note+'</div>':'';
    var paperChip=(o.paper&&o.paper!=='일반 용지')?'<div class="adm-paper">'+o.paper+'</div>':'';
    var errBadge=o.errType?'<span class="tag tr" style="font-size:10px">'+o.errType+'</span>':'';
    var safeNote=(o.adminNote||'').replace(/"/g,'&quot;');
    return '<div class="adm-card '+cls+'">'
      +'<div class="adm-left">'
        +'<div class="adm-oid">'+o.id+'</div>'
        +'<div class="adm-name">'+o.name+discTag+'</div>'
        +'<div class="adm-sid">'+o.sid+'</div>'
        +'<div class="adm-sid" style="margin-top:2px">'+(o.phone||'')+'</div>'
        +errBadge
      +'</div>'
      +'<div class="adm-mid">'
        +'<div class="adm-spec-row"><span class="adm-sz">'+o.type+'</span><span class="adm-sz adm-sz-clr"> '+o.color+'</span><span class="adm-sz adm-sz-qty"> '+o.qty+'장</span>'+(o.copy>1?' &times;'+o.copy+'부':'')+'</div>'
        +paperChip
        +'<div class="adm-cost">'+(o.cost||0).toLocaleString()+'원 &nbsp;<span class="'+(o.fileOk?'fc-ok fc-dl':'fc-no')+'" '+(o.fileOk?'onclick="admDownloadByOrderId(\''+o.id+'\')" title="클릭하면 파일 다운로드"':'')+'>'+(o.fileOk?'✓파일 ↓':'✗파일')+'</span></div>'
        +noteHtml
        +'<input class="adm-memo" value="'+safeNote+'" placeholder="전달사항 입력 → Enter 시 학생 알림..." id="memo-'+i+'" onkeydown="if(event.key===&quot;Enter&quot;){saveNote('+i+',this.value);this.blur();}" onchange="saveNote('+i+',this.value)">'
        +'<div class="adm-date">'+o.date+' · '+o.worker+'</div>'
      +'</div>'
      +'<div class="adm-right">'
        +'<button class="spill '+(o.dep?'dep':'')+'" data-act="dep" data-i="'+i+'">입금'+(o.dep?'✓':'')+'</button>'
        +'<button class="spill '+(o.prt?'prt':'')+'" data-act="prt" data-i="'+i+'">출력'+(o.prt?'✓':'')+'</button>'
        +'<button class="spill '+(o.pku?'pku':'')+'" data-act="pku" data-i="'+i+'">수령'+(o.pku?'✓':'')+'</button>'
        +(o.errType?'<button class="spill err" data-act="clearerr" data-i="'+i+'">오류해제</button>':'<button class="spill" data-act="cyclerr" data-i="'+i+'" style="font-size:10px;padding:4px 7px">⚠오류</button>')
      +'</div>'
    +'</div>';
  }).join('');
}

function togS(i,key){
  var o=adminOrders[i];
  o[key]=!o[key];
  // Supabase 업데이트
  if(sbReady()&&o.dbId){
    var patch={};
    patch[key==='dep'?'dep':key==='prt'?'prt':'pku']=o[key];
    fetch(SUPABASE_URL+'/rest/v1/orders?id=eq.'+o.dbId,{
      method:'PATCH',headers:Object.assign({},SB_HEADERS,{'Prefer':'return=minimal'}),
      body:JSON.stringify(patch)
    }).catch(function(e){console.warn('togS 저장 실패',e);});
  }
  if(key==='prt'&&o[key]){
    triggerNotif('🖨️','출력 완료!',o.name+' ('+o.id+') 출력 완료. 출력실로 방문해주세요.');
  }
  _renderAdminOrdersLocal();
}
function cycleErr(i){
  var o=adminOrders[i];
  o.errType='파일 오류';
  if(sbReady()&&o.dbId){
    fetch(SUPABASE_URL+'/rest/v1/orders?id=eq.'+o.dbId,{
      method:'PATCH',headers:Object.assign({},SB_HEADERS,{'Prefer':'return=minimal'}),
      body:JSON.stringify({err_type:o.errType})
    }).catch(function(e){console.warn(e);});
  }
  showToast('오류 플래그: '+o.errType);
  _renderAdminOrdersLocal();
}
function clearErr(i){
  var o=adminOrders[i];
  o.errType='';
  if(sbReady()&&o.dbId){
    fetch(SUPABASE_URL+'/rest/v1/orders?id=eq.'+o.dbId,{
      method:'PATCH',headers:Object.assign({},SB_HEADERS,{'Prefer':'return=minimal'}),
      body:JSON.stringify({err_type:''})
    }).catch(function(e){console.warn(e);});
  }
  _renderAdminOrdersLocal();
}
function saveNote(i,v){
  var o=adminOrders[i];
  o.adminNote=v;
  if(sbReady()&&o.dbId){
    fetch(SUPABASE_URL+'/rest/v1/orders?id=eq.'+o.dbId,{
      method:'PATCH',headers:Object.assign({},SB_HEADERS,{'Prefer':'return=minimal'}),
      body:JSON.stringify({admin_note:v})
    }).catch(function(e){console.warn(e);});
  }
  if(v.trim()){triggerNotif('💬','근무자 메시지','('+o.id+') '+v);}
}

// ── HISTORY ──
function renderHistory(){
  var body=document.getElementById('histBody');if(!body)return;
  body.innerHTML=historyData.map(function(o){
    var s=o.pku?'<span class="sd sd-done"></span>수령완료':o.prt?'<span class="sd sd-on"></span>출력완료':o.dep?'<span class="sd sd-on"></span>입금확인':'<span class="sd sd-wait"></span>입금대기';
    return '<tr><td><strong class="ht-id">'+o.id+'</strong></td><td style="font-size:12px">'+o.date+'</td><td style="font-weight:500">'+o.name+'</td><td style="font-size:12px;color:var(--tx2)">'+o.sid+'</td><td>'+o.spec+'</td><td style="text-align:center">'+o.qty+'장'+(o.pages?' · '+o.pages+'도':'')+'</td><td style="font-weight:600;text-align:right">'+(o.cost||0).toLocaleString()+'원</td><td style="font-size:12px;white-space:nowrap">'+s+'</td></tr>';
  }).join('');
}

// ── RISO ADMIN ──
function renderAdminRisoSlots(){
  var dateVal=document.getElementById('adminRisoDate').value;if(!dateVal)return;
  var d=new Date(dateVal),days=['일','월','화','수','목','금','토'];
  document.getElementById('adminRisoDayLabel').textContent='— '+(d.getMonth()+1)+'/'+d.getDate()+' ('+days[d.getDay()]+')';
  var db={};
  if(dateVal==='2026-03-16'){db={'10:30':{name:'원준희',qty:70,pages:3},'11:00':{name:'원준희',qty:70,pages:3},'11:30':{name:'원준희',qty:70,pages:3},'12:00':{name:'김민지',qty:70,pages:3},'12:15':{name:'김민지',qty:70,pages:3},'16:00':{name:'이현정',qty:70,pages:1}};}
  Object.keys(risoBookings).forEach(function(k){var p=k.split('_');if(p[0]===dateVal)db[p[1]]=risoBookings[k];});
  var booked=ALL_SLOTS.filter(function(s){return db[s];});
  var list=document.getElementById('adminRisoSlotList');
  if(!booked.length){list.innerHTML='<div style="color:var(--tx3);font-size:13px">이 날짜에 예약된 슬롯이 없습니다</div>';return;}
  list.innerHTML=booked.map(function(s){var b=db[s];return '<div class="riso-admin-row"><div class="rat">'+s+'</div><div class="rab">'+b.name+' · '+b.qty+'매 · '+b.pages+'도</div></div>';}).join('');
}

// ── SETTLEMENT ──
function renderSettlement(){
  var total=adminOrders.reduce(function(s,o){return s+(o.dep?o.cost||0:0);},0);
  var cnt=adminOrders.length,err=adminOrders.filter(function(o){return o.errType;}).length,pending=adminOrders.filter(function(o){return !o.dep;}).length;
  document.getElementById('settleGrid').innerHTML='<div class="sc"><div class="sc-v">'+total.toLocaleString()+'</div><div class="sc-l">총 입금액(원)</div></div><div class="sc"><div class="sc-v">'+cnt+'</div><div class="sc-l">총 신청</div></div><div class="sc"><div class="sc-v" style="color:var(--am)">'+pending+'</div><div class="sc-l">입금대기</div></div><div class="sc"><div class="sc-v" style="color:var(--rd)">'+err+'</div><div class="sc-l">오류</div></div>';
  var wMap={};adminOrders.forEach(function(o){if(!wMap[o.worker])wMap[o.worker]={cnt:0,done:0};wMap[o.worker].cnt++;if(o.pku)wMap[o.worker].done++;});
  document.getElementById('wsGrid').innerHTML=Object.keys(wMap).map(function(w){var v=wMap[w];return '<div class="ws"><div class="ws-n">'+w+'</div><div class="ws-v">'+v.done+'/'+v.cnt+'</div><div class="ws-s">완료/담당</div></div>';}).join('');
  var types=['A4','A3','A2','A1','A0+'];
  document.getElementById('settleTbl').innerHTML=types.map(function(t){var os=adminOrders.filter(function(o){return o.type===t;});var a=os.filter(function(o){return o.dep;}).reduce(function(s,o){return s+(o.cost||0);},0);return os.length?'<tr><td class="lbl">'+t+'</td><td>'+os.length+'건 · '+a.toLocaleString()+'원</td></tr>':'';}).join('')+'<tr class="total"><td>합계</td><td>'+cnt+'건 · '+total.toLocaleString()+'원</td></tr>';
  var days=[{d:'3/11',a:300},{d:'3/12',a:100},{d:'3/13',a:0},{d:'3/14',a:0},{d:'3/15',a:0},{d:'3/16',a:0},{d:'3/17',a:7750}];
  var mx=Math.max.apply(null,days.map(function(d){return d.a;}));
  document.getElementById('barChart').innerHTML=days.map(function(d){var h=Math.round((d.a/Math.max(mx,1))*70);return '<div class="bar-col"><div class="bar-amt">'+(d.a?d.a.toLocaleString():'')+' </div><div class="bar-fill '+(d.a?'':'e')+'" style="height:'+Math.max(h,2)+'px"></div><div class="bar-day">'+d.d+'</div></div>';}).join('');
}

// ── STEPS ──
function step1Next(){var n=document.getElementById('sName').value.trim(),s=document.getElementById('sSid').value.trim();if(!n||!s){showToast('이름과 학번을 입력해주세요');return;}goStep(2);}
function goStep(n){
  for(var i=1;i<=4;i++){var e=document.getElementById('fs'+i);if(e)e.style.display=i===n?'block':'none';}
  for(var i=0;i<=3;i++){var el=document.getElementById('sp'+i);if(!el)continue;el.classList.remove('done','cur');if(i<n-1)el.classList.add('done');if(i===n-1)el.classList.add('cur');}
  [['sl01',1],['sl12',2],['sl23',3]].forEach(function(p){var el=document.getElementById(p[0]);if(el)el.style.background=n>p[1]?'var(--kmu)':'#E0E0DC';});
  if(n===3)updateFnGuide();
  document.getElementById('st0').scrollTop=0;
}

// ── FORM ──
function selDisc(idx,v){for(var i=0;i<=3;i++){var e=document.getElementById('disc-'+i);if(e)e.classList.remove('on');}document.getElementById('disc-'+idx).classList.add('on');curDisc=v;}

// 용지 크기 그룹 선택
var SZ_PRICES = {
  'A4':  {bw:50,   clr:100},
  'A3':  {bw:100,  clr:200},
  'A2':  {bw:2500, clr:5000},
  'A1':  {bw:5000, clr:7500},
  'A0+': {bw:7500, clr:10000}
};
var LARGE_SIZES = ['A2','A1','A0+'];

function selSzGroup(sz){
  // highlight size button
  ['A4','A3','A2','A1','A0+'].forEach(function(s){
    var el=document.getElementById('szg-'+s.replace('+',''));
    if(el) el.classList.toggle('on', s===sz);
  });
  // special: A0+ button id is szg-A0
  curSz = sz;
  // show OHP option only for A3
  var ohp = document.getElementById('col-ohp');
  if(ohp) ohp.style.display = sz==='A3' ? 'block' : 'none';
  // if OHP was selected and we switch away from A3, reset to 흑백
  if(sz!=='A3' && curClr==='OHP'){ curClr='흑백'; selColor('흑백'); }
  // show/hide paper card only for large sizes (A2,A1,A0+)
  var pc = document.getElementById('paperCard');
  if(pc) pc.style.display = LARGE_SIZES.indexOf(sz)>=0 ? 'block' : 'none';
  // update color prices
  updateColorPrices();
  calcCost();
}

function selColor(clr){
  curClr = clr;
  document.getElementById('col-bw').classList.toggle('on', clr==='흑백');
  document.getElementById('col-clr').classList.toggle('on', clr==='컬러');
  var ohpEl = document.getElementById('col-ohp');
  if(ohpEl) ohpEl.classList.toggle('on', clr==='OHP');
  updateColorPrices();
  calcCost();
}

function updateColorPrices(){
  var p = SZ_PRICES[curSz] || SZ_PRICES['A4'];
  document.getElementById('col-bw-price').textContent = p.bw.toLocaleString()+'원/장';
  document.getElementById('col-clr-price').textContent = p.clr.toLocaleString()+'원/장';
  curPrice = (curClr==='컬러'||curClr==='OHP') ? p.clr : p.bw;
}

function selPaper(idx,v){for(var i=0;i<=2;i++){var e=document.getElementById('pp-'+i);if(e)e.classList.remove('on');}document.getElementById('pp-'+idx).classList.add('on');curPaper=v;}
function selRisoPaper(idx,v){for(var i=0;i<=2;i++){var e=document.getElementById('rpp-'+i);if(e)e.classList.remove('on');}document.getElementById('rpp-'+idx).classList.add('on');risoPaper=v;}
function calcCost(){var q=parseInt(document.getElementById('qCount').value)||1,c=parseInt(document.getElementById('qCopy').value)||1;document.getElementById('cu').textContent=curPrice.toLocaleString()+'원';document.getElementById('cq').textContent=q+' × '+c;document.getElementById('ct').textContent=(curPrice*q*c).toLocaleString()+'원';}
function calcRiso(){var q=parseInt(document.getElementById('rQty').value)||0,d=parseInt(document.getElementById('rDiv').value)||0;document.getElementById('rCost').textContent=(q*20+d*1500).toLocaleString()+'원';}
function updateFnGuide(){
  document.getElementById('fn-sz').textContent=curSz;
  document.getElementById('fn-clr').textContent=curClr;
  // paper only shown for large sizes
  var showPaper = ['A2','A1','A0+'].indexOf(curSz)>=0;
  var ps = showPaper ? curPaper : '일반';
  document.getElementById('fn-pp').textContent=ps;
  document.getElementById('fn-eg').textContent=curSz+'_'+curClr+(showPaper?'_'+ps:'')+'.pdf';
}

// ── FILE ──
function handleFile(input){var f=input.files[0];if(!f)return;if(f.type!=='application/pdf'){showToast('PDF만 가능합니다');input.value='';return;}if(f.size>25*1024*1024){showToast('25MB 이하만 가능');input.value='';return;}selectedFile=f;document.getElementById('uploadZone').querySelector('.uz-text').textContent='파일 선택 완료';document.getElementById('uploadZone').querySelector('.uz-sub').textContent=(f.size/1024/1024).toFixed(2)+'MB';document.getElementById('uzName').textContent='📎 '+f.name;}
function handleDrop(e){e.preventDefault();document.getElementById('uploadZone').classList.remove('drag');if(e.dataTransfer.files[0]){document.getElementById('fileInput').files=e.dataTransfer.files;handleFile(document.getElementById('fileInput'));}}

// ── CONFIRM ──
function showConfirm(){
  if(!selectedFile){showToast('PDF 파일을 업로드해주세요');return;}
  var name=document.getElementById('sName').value.trim()||'(미입력)',sid=document.getElementById('sSid').value.trim()||'(미입력)';
  var q=parseInt(document.getElementById('qCount').value)||1,c=parseInt(document.getElementById('qCopy').value)||1,note=document.getElementById('qNote').value.trim();
  var rows=[{l:'이름',v:name},{l:'학번',v:sid},{l:'할인',v:curDisc},{l:'사양',v:curSz+' '+curClr+' '+q+'장×'+c+'부'},{l:'용지',v:curPaper},{l:'파일명',v:selectedFile.name}];
  if(note)rows.push({l:'전달사항',v:note});
  document.getElementById('confirmRows').innerHTML=rows.map(function(r){return '<div class="crow"><span class="clbl">'+r.l+'</span><span class="cval">'+r.v+'</span></div>';}).join('');
  document.getElementById('confirmTotal').textContent=(curPrice*q*c).toLocaleString()+'원';
  document.getElementById('confirmModal').classList.add('on');
}
function closeConfirm(){document.getElementById('confirmModal').classList.remove('on');}

// ══════════ 구글 시트 연동 ══════════
var SHEET_ID = '14Rn7IShiiVGE5KBlPcXMsqyLWUXMx0Wuk9pui7EZvJM';
var SHEET_API_KEY = 'AIzaSyBcyuy6Mct-N-8XeMtdXs1rYV8VL-4JpsE';
var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwPxydEvwO41tjY8FESpStKZOlwgxwnQoDQugFkjWYYv62hX8ohVJq8dDVAUJZqur3x/exec';

function writeToSheet(orderData){
  fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: {'Content-Type': 'text/plain'},
    body: JSON.stringify(orderData)
  })
  .then(function(){
    showToast('✅ 구글 시트에 저장됐어요!');
  })
  .catch(function(e){ console.warn('시트 저장 실패:', e); });
}
// ══════════════════════════════════
function submitOrder(){
  var btn=document.getElementById('submitBtn');btn.innerHTML='<span class="spinner"></span>';btn.disabled=true;
  var name=document.getElementById('sName').value.trim(),sid=document.getElementById('sSid').value.trim();
  var phone=document.getElementById('sPhone').value.trim();
  var q=parseInt(document.getElementById('qCount').value)||1,c=parseInt(document.getElementById('qCopy').value)||1;
  var note=document.getElementById('qNote').value.trim(),cost=curPrice*q*c;
  orderCount++;
  var oid='A'+(Date.now()%100000); // 고유 신청번호

  var orderData={
    order_id:oid,name:name,sid:sid,phone:phone,
    type:curSz,color:curClr,paper:curPaper,
    qty:q,copy:c,cost:cost,
    disc:curDisc==='일반'?'':curDisc,
    note:note,admin_note:'',worker:'미배정',
    dep:false,prt:false,pku:false,
    file_ok:fs3Uploaded,err_type:''
  };

  function finish(){
    // 구글 시트에 저장
    writeToSheet(orderData);
    // 파일 업로드 신청번호 업데이트
    if(fs3Uploaded&&window._fs3RowId&&sbReady()){
      fetch(SUPABASE_URL+'/rest/v1/file_uploads?id=eq.'+window._fs3RowId,{
        method:'PATCH',headers:Object.assign({},SB_HEADERS,{'Prefer':'return=minimal'}),
        body:JSON.stringify({order_id:oid})
      }).catch(function(e){console.warn(e);});
    }
    closeConfirm();
    var qn=(adminOrders.filter(function(o){return !o.prt;}).length)+1;
    document.getElementById('resultNum').textContent=oid;
    document.getElementById('payAmt').textContent=cost.toLocaleString()+'원';
    document.getElementById('myQNum').textContent=qn;
    document.getElementById('myQTime').textContent='약 '+(qn*5)+'분';
    document.getElementById('myQBefore').textContent=(qn-1)+'건';
    document.getElementById('payDeadline').textContent=['A4','A3'].indexOf(curSz)>=0?'A4~A3: 오늘 마감 30분 전까지':'A2~A0+: 내일까지 입금 필요';
    goStep(4);
    btn.textContent='신청 완료';btn.disabled=false;
    if('Notification' in window&&Notification.permission==='default')Notification.requestPermission();
  }

  if(sbReady()){
    fetch(SUPABASE_URL+'/rest/v1/orders',{
      method:'POST',
      headers:Object.assign({},SB_HEADERS,{'Prefer':'return=minimal'}),
      body:JSON.stringify(orderData)
    })
    .then(function(r){
      if(!r.ok) return r.text().then(function(t){throw new Error(t);});
      // 로컬 배열에도 추가
      adminOrders.unshift(Object.assign({},orderData,{id:oid,date:'방금',dbId:null,adminNote:'',errType:'',fileOk:fs3Uploaded}));
      myOrders.unshift({id:oid,date:'오늘',type:curSz,color:curClr,paper:curPaper,qty:q,copy:c,cost:cost,disc:curDisc==='일반'?'':curDisc,dep:false,prt:false,pku:false,note:note,adminNote:''});
      finish();
    })
    .catch(function(err){
      showToast('저장 오류: '+err.message);
      btn.textContent='신청 완료';btn.disabled=false;
    });
  } else {
    // Supabase 없으면 로컬에만
    adminOrders.unshift(Object.assign({},orderData,{id:oid,date:'방금',dbId:null,adminNote:'',errType:'',fileOk:fs3Uploaded}));
    myOrders.unshift({id:oid,date:'오늘',type:curSz,color:curClr,paper:curPaper,qty:q,copy:c,cost:cost,disc:curDisc==='일반'?'':curDisc,dep:false,prt:false,pku:false,note:note,adminNote:''});
    setTimeout(finish,700);
  }
}
function resetOrder(){
  selectedFile=null;fs3Uploaded=false;window._fs3RowId=null;window._fs3StoragePath=null;
  document.getElementById('fileInput').value='';
  document.getElementById('uzName').textContent='';
  document.getElementById('uploadZone').querySelector('.uz-text').textContent='PDF 클릭 또는 드래그';
  document.getElementById('uploadZone').querySelector('.uz-sub').textContent='최대 25MB · PDF만 가능';
  document.getElementById('qNote').value='';
  document.getElementById('qCount').value=1;
  document.getElementById('qCopy').value=1;
  // 3단계 업로드 버튼 초기화
  var btn=document.getElementById('fs3UploadBtn');
  if(btn){btn.disabled=false;btn.style.background='';document.getElementById('fs3UploadBtnText').textContent='파일 업로드하기';}
  var res=document.getElementById('fs3UploadResult');
  if(res)res.style.display='none';
  goStep(1);
}
function submitRiso(){showToast('리소 신청 완료! 근무자에게 연락해주세요.');}

// ── MY ORDERS ──
function renderMyOrders(){
  var list=document.getElementById('myOrderList');if(!list)return;
  var sid=document.getElementById('sSid')?document.getElementById('sSid').value.trim():'';
  if(sbReady()&&sid){
    fetch(SUPABASE_URL+'/rest/v1/orders?sid=eq.'+sid+'&order=created_at.desc&limit=20',{headers:SB_HEADERS})
    .then(function(r){return r.json();})
    .then(function(rows){
      if(!Array.isArray(rows)||!rows.length){
        list.innerHTML='<div style="text-align:center;padding:40px 20px;color:var(--tx3)">신청 내역이 없습니다</div>';return;
      }
      myOrders=rows.map(function(r){return {id:r.order_id,date:new Date(r.created_at).toLocaleDateString('ko-KR',{month:'numeric',day:'numeric'}),type:r.type,color:r.color,paper:r.paper,qty:r.qty,copy:r.copy,cost:r.cost,disc:r.disc||'',dep:r.dep,prt:r.prt,pku:r.pku,note:r.note||'',adminNote:r.admin_note||''};});
      _renderMyOrdersLocal();
    })
    .catch(function(){_renderMyOrdersLocal();});
  } else {
    _renderMyOrdersLocal();
  }
}
function _renderMyOrdersLocal(){
  var list=document.getElementById('myOrderList');if(!list)return;
  if(!myOrders.length){list.innerHTML='<div style="text-align:center;padding:40px 20px;color:var(--tx3)">신청 내역이 없습니다</div>';return;}
  list.innerHTML=myOrders.map(function(o){
    var step=o.pku?3:o.prt?2:o.dep?1:0;
    var steps=['입금 대기','입금 확인','출력 완료','수령 완료'];
    var sh=steps.map(function(s,si){return '<div class="track-step '+(si<step?'done':si===step?'cur':'')+'" >'+s+'</div>';}).join('');
    var an=o.adminNote?'<div class="moc-anote"><strong style="font-size:10px;display:block;margin-bottom:2px">근무자 메시지</strong>'+o.adminNote+'</div>':'';
    var rb=!o.prt?'<button class="refund-btn" data-refund-id="'+o.id+'">환불 신청</button>':'';
    return '<div class="moc"><div class="moc-head"><span class="moc-id">'+o.id+'</span><span class="moc-date">'+o.date+'</span></div><div class="moc-spec">'+o.type+' '+o.color+' · '+o.paper+' · '+o.qty+'장 '+o.copy+'부 · <strong>'+(o.cost||0).toLocaleString()+'원</strong>'+(o.disc?' <span class="tag tg">'+o.disc+'</span>':'')+' </div><div class="track">'+sh+'</div>'+an+'<div style="display:flex;justify-content:flex-end;margin-top:4px">'+rb+'</div></div>';
  }).join('');
}

// ── RISO SLOTS ──
function renderSlots(){
  var grid=document.getElementById('slotGrid');if(!grid)return;
  var dateKey=document.getElementById('risoDate').value;
  grid.innerHTML=ALL_SLOTS.map(function(s){
    var booked=STATIC_TAKEN[s]||risoBookings[dateKey+'_'+s];
    var isMine=risoBookings[dateKey+'_'+s]&&risoBookings[dateKey+'_'+s].mine;
    var cls=booked?(isMine?'on':'taken'):'';
    var click=!booked?'data-slot="'+s+'"':'';
    return '<div class="slot '+cls+'" '+click+'>'+s+'</div>';
  }).join('');
  document.getElementById('bookCard').style.display='none';
}
function selSlot(el,slot){document.querySelectorAll('.slot:not(.taken)').forEach(function(s){s.classList.remove('on');});el.classList.add('on');selectedRisoSlot=slot;document.getElementById('selectedSlotInfo').textContent='선택된 시간: '+slot;document.getElementById('bookCard').style.display='block';document.getElementById('bookCard').scrollIntoView({behavior:'smooth'});}
function cancelRisoBook(){document.getElementById('bookCard').style.display='none';document.querySelectorAll('.slot').forEach(function(s){s.classList.remove('on');});selectedRisoSlot=null;}
function confirmRisoBook(){var name=document.getElementById('bName').value.trim(),sid=document.getElementById('bSid').value.trim();if(!name||!sid){showToast('이름과 학번을 입력해주세요');return;}if(!selectedRisoSlot)return;var dk=document.getElementById('risoDate').value;risoBookings[dk+'_'+selectedRisoSlot]={name:name,qty:document.getElementById('bQty').value,pages:document.getElementById('bDo').value,color:document.getElementById('bColor').value,mine:true};cancelRisoBook();renderSlots();showToast('RISO 예약 완료! 지각 시 본인 불이익');}

// ── DUTY ──
function detectDuty(){var days=['일','월','화','수','목','금','토'];var now=new Date();var day=days[now.getDay()];var h=now.getHours()*60+now.getMinutes();var slots=SCHED[day]||[];var found=null;var tm=function(s){var a=s.split(':');return parseInt(a[0])*60+parseInt(a[1]);};for(var i=0;i<slots.length;i++){var p=slots[i].t.split('~');if(h>=tm(p[0])&&h<tm(p[1])){found=slots[i];break;}}if(!found&&slots.length)found=slots[0];if(found){document.getElementById('dutyName').textContent=found.w;document.getElementById('dutyTime').textContent=day+' '+found.t;var qw=document.getElementById('qWorker');if(qw)qw.textContent=found.w;}}

// ── WORKERS ──
function renderWorkerList(){var days=['일','월','화','수','목','금','토'];var now=new Date();var today=days[now.getDay()];var h=now.getHours()*60+now.getMinutes();var tm=function(s){var a=s.split(':');return parseInt(a[0])*60+parseInt(a[1]);};var onDuty=(SCHED[today]||[]).filter(function(s){var p=s.t.split('~');return h>=tm(p[0])&&h<tm(p[1]);}).map(function(s){return s.w;});var el=document.getElementById('workerList');if(!el)return;el.innerHTML=WORKERS.map(function(w){return '<div class="worker-item"><div><span style="font-size:14px;font-weight:700">'+w.n+'</span><span class="wb '+(onDuty.indexOf(w.n)>=0?'wb-on':'wb-off')+'">'+(onDuty.indexOf(w.n)>=0?'근무 중':'오프')+'</span></div><a href="tel:'+w.p+'" style="font-size:13px;color:var(--tx2)">'+w.p+'</a></div>';}).join('');}

// ── NOTIF ──
function triggerNotif(icon,title,text){notifs.unshift({icon:icon,title:title,text:text,time:new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})});renderNotifList();document.getElementById('ndot').classList.add('on');document.getElementById('pnIcon').textContent=icon;document.getElementById('pnTitle').textContent=title;document.getElementById('pnText').textContent=text;var pn=document.getElementById('popupNotif');pn.classList.add('show');setTimeout(function(){pn.classList.remove('show');},5000);if('Notification' in window&&Notification.permission==='granted')new Notification('VCD 출력실 — '+title,{body:text});}
function renderNotifList(){var list=document.getElementById('notifList');if(!notifs.length){list.innerHTML='<div class="ni-empty">새 알림이 없습니다</div>';return;}list.innerHTML=notifs.slice(0,8).map(function(n){return '<div class="ni"><div class="ni-txt">'+n.icon+' <strong>'+n.title+'</strong><br>'+n.text+'</div><div class="ni-time">'+n.time+'</div></div>';}).join('');}
function toggleNotif(){document.getElementById('notifPanel').classList.toggle('on');document.getElementById('ndot').classList.remove('on');}
function clearNotifs(){notifs=[];renderNotifList();}
// notif close handled by delegation above

// ── REFUND ──
function openRefundModal(){document.getElementById('refundModal').classList.add('on');}
function closeRefundModal(){document.getElementById('refundModal').classList.remove('on');}
function submitRefund(){var id=document.getElementById('rfId').value,reason=document.getElementById('rfReason').value;if(!id||!reason){showToast('신청번호와 사유를 입력해주세요');return;}showToast('환불 신청 접수 완료');closeRefundModal();}

// ── UTILS ──
function copyAcct(btn){navigator.clipboard.writeText('3333367642528').then(function(){var o=btn.textContent;btn.textContent='✓ 복사 완료!';btn.style.background='rgba(255,255,255,.3)';setTimeout(function(){btn.textContent=o;btn.style.background='';},2000);}).catch(function(){alert('3333-367-642528');});}
var toastT;function showToast(msg){var t=document.getElementById('toast');t.textContent=msg;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(function(){t.classList.remove('on');},2800);}

// ── EVENT DELEGATION ──
document.addEventListener('click', function(e) {
  // Admin order buttons
  var btn = e.target.closest('[data-act]');
  if (btn) {
    var act = btn.getAttribute('data-act');
    var i = parseInt(btn.getAttribute('data-i'));
    if (act === 'dep') togS(i, 'dep');
    else if (act === 'prt') togS(i, 'prt');
    else if (act === 'pku') togS(i, 'pku');
    else if (act === 'clearerr') clearErr(i);
    else if (act === 'cyclerr') cycleErr(i);
    return;
  }
  // Slot buttons
  var slot = e.target.closest('[data-slot]');
  if (slot && !slot.classList.contains('taken')) {
    selSlot(slot, slot.getAttribute('data-slot'));
    return;
  }
  // Refund buttons
  var rfBtn = e.target.closest('[data-refund-id]');
  if (rfBtn) {
    document.getElementById('rfId').value = rfBtn.getAttribute('data-refund-id');
    openRefundModal();
    return;
  }
  // Admin memo save on Enter
  if (e.target.classList.contains('adm-memo')) return;
  // Close notif panel
  if (!e.target.closest('#notifPanel') && !e.target.closest('#notifBtn')) {
    document.getElementById('notifPanel').classList.remove('on');
  }
});

// ══════════ 3단계 파일 업로드 ══════════
var fs3Uploaded = false;

function fs3Upload() {
  if (!sbReady()) { showToast('Supabase 설정이 필요합니다'); return; }
  if (!selectedFile) { showToast('PDF 파일을 먼저 선택해주세요'); return; }

  var name = document.getElementById('sName').value.trim();
  var sid = document.getElementById('sSid').value.trim();
  if (!name || !sid) { showToast('이름과 학번을 먼저 입력해주세요'); return; }

  var btn = document.getElementById('fs3UploadBtn');
  var btnText = document.getElementById('fs3UploadBtnText');
  btn.disabled = true;
  btnText.textContent = '업로드 중...';

  // 임시 신청번호 (실제 신청번호는 submitOrder에서 확정)
  var tempOid = 'TMP_' + sid + '_' + Date.now();
  var storagePath = 'orders/' + sid + '_' + Date.now() + '.pdf';

  fetch(SUPABASE_URL + '/storage/v1/object/print-files/' + storagePath, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      'Content-Type': 'application/pdf',
      'x-upsert': 'true'
    },
    body: selectedFile
  })
  .then(function(r) {
    if (!r.ok) return r.text().then(function(t) { throw new Error(t); });
    return r.json();
  })
  .then(function() {
    var fileType = curSz + ' ' + curClr;
    return fetch(SUPABASE_URL + '/rest/v1/file_uploads', {
      method: 'POST',
      headers: Object.assign({}, SB_HEADERS, { 'Prefer': 'return=representation' }),
      body: JSON.stringify({
        order_id: tempOid,
        student_id: sid,
        student_name: name,
        file_type: fileType,
        memo: (document.getElementById('qNote').value || '').trim(),
        file_name: selectedFile.name,
        storage_path: storagePath,
        file_size: selectedFile.size,
        uploaded_at: new Date().toISOString()
      })
    });
  })
  .then(function(r) { return r.json(); })
  .then(function(rows) {
    fs3Uploaded = true;
    // DB row id 저장해뒀다가 신청번호 확정 후 업데이트
    window._fs3RowId = rows && rows[0] ? rows[0].id : null;
    window._fs3StoragePath = storagePath;
    btn.disabled = false;
    btnText.textContent = '✅ 업로드 완료!';
    btn.style.background = 'var(--gr)';
    document.getElementById('fs3UploadResult').style.display = 'block';
  })
  .catch(function(err) {
    btn.disabled = false;
    btnText.textContent = '파일 업로드하기';
    btn.style.background = '';
    showToast('업로드 오류: ' + err.message);
    console.error(err);
  });
}

// ══════════ 파일 업로드 (학생 탭) ══════════
var fuSelectedFile = null;

function fuInit() {
  var notice = document.getElementById('fuSetupNotice');
  if (notice) notice.style.display = sbReady() ? 'none' : 'block';
}

function fuCheckOrder() {
  var oid = (document.getElementById('fuOrderId').value || '').trim().toUpperCase();
  var sid = (document.getElementById('fuSid').value || '').trim();
  var name = (document.getElementById('fuName').value || '').trim();
  var info = document.getElementById('fuMatchInfo');
  if (!info) return;
  // adminOrders 안에서 매칭되는지 확인
  var match = adminOrders.find(function(o) {
    return o.id.toUpperCase() === oid && o.sid === sid;
  });
  if (match && oid && sid) {
    info.style.display = 'block';
    info.textContent = '✓ ' + match.name + ' (' + match.type + ' ' + match.color + ') 신청 확인됨';
    if (!name) document.getElementById('fuName').value = match.name;
  } else {
    info.style.display = 'none';
  }
}

function fuHandleFile(input) {
  var f = input.files[0];
  if (!f) return;
  if (f.type !== 'application/pdf') { showToast('PDF만 가능합니다'); input.value = ''; return; }
  if (f.size > 50 * 1024 * 1024) { showToast('50MB 이하만 가능'); input.value = ''; return; }
  fuSelectedFile = f;
  var zone = document.getElementById('fuZone');
  zone.querySelector('.uz-text').textContent = '파일 선택 완료';
  zone.querySelector('.uz-sub').textContent = (f.size / 1024 / 1024).toFixed(2) + 'MB';
  var fn = document.getElementById('fuFileName');
  fn.style.display = 'block';
  fn.textContent = '📎 ' + f.name;
}

function fuHandleDrop(e) {
  e.preventDefault();
  document.getElementById('fuZone').classList.remove('drag');
  if (e.dataTransfer.files[0]) {
    document.getElementById('fuInput').files = e.dataTransfer.files;
    fuHandleFile(document.getElementById('fuInput'));
  }
}

function fuSubmit() {
  if (!sbReady()) { showToast('Supabase 설정이 필요합니다'); return; }
  var oid = (document.getElementById('fuOrderId').value || '').trim().toUpperCase();
  var sid = (document.getElementById('fuSid').value || '').trim();
  var name = (document.getElementById('fuName').value || '').trim();
  var fileType = document.getElementById('fuFileType').value;
  var memo = (document.getElementById('fuMemo').value || '').trim();
  if (!oid) { showToast('신청번호를 입력해주세요'); return; }
  if (!sid || !name) { showToast('학번과 이름을 입력해주세요'); return; }
  if (!fileType) { showToast('파일 종류를 선택해주세요'); return; }
  if (!fuSelectedFile) { showToast('PDF 파일을 선택해주세요'); return; }

  var btn = document.getElementById('fuSubmitBtn');
  var btnText = document.getElementById('fuBtnText');
  btn.disabled = true;
  btnText.innerHTML = '<span class="spinner"></span> 업로드 중...';

  // 파일명: 신청번호_학번_원본파일명
  var storagePath = 'orders/' + sid + '_' + Date.now() + '.pdf';

  // 1단계: Storage에 파일 업로드
  fetch(SUPABASE_URL + '/storage/v1/object/print-files/' + storagePath, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      'Content-Type': 'application/pdf',
      'x-upsert': 'false'
    },
    body: fuSelectedFile
  })
  .then(function(r) {
    if (!r.ok) return r.text().then(function(t) { throw new Error('Storage 오류: ' + t); });
    return r.json();
  })
  .then(function() {
    // 2단계: DB에 메타데이터 저장
    return fetch(SUPABASE_URL + '/rest/v1/file_uploads', {
      method: 'POST',
      headers: Object.assign({}, SB_HEADERS, { 'Prefer': 'return=minimal' }),
      body: JSON.stringify({
        order_id: oid,
        student_id: sid,
        student_name: name,
        file_type: fileType,
        memo: memo,
        file_name: fuSelectedFile.name,
        storage_path: storagePath,
        file_size: fuSelectedFile.size,
        uploaded_at: new Date().toISOString()
      })
    });
  })
  .then(function(r) {
    if (!r.ok) return r.text().then(function(t) { throw new Error('DB 오류: ' + t); });
    // 성공
    btn.disabled = false;
    btnText.textContent = '파일 업로드';
    document.getElementById('fuSuccess').style.display = 'block';
    document.getElementById('fuSuccessMsg').textContent =
      oid + ' (' + name + ') — ' + fuSelectedFile.name + ' 업로드 완료';
    fuSelectedFile = null;
    document.getElementById('fuInput').value = '';
    var zone = document.getElementById('fuZone');
    zone.querySelector('.uz-text').textContent = 'PDF 클릭 또는 드래그';
    zone.querySelector('.uz-sub').textContent = '최대 50MB · PDF만 가능';
    document.getElementById('fuFileName').style.display = 'none';
  })
  .catch(function(err) {
    btn.disabled = false;
    btnText.textContent = '파일 업로드';
    showToast('오류: ' + err.message);
    console.error(err);
  });
}

// ══════════ 파일함 (관리자) ══════════
function admLoadFiles() {
  var list = document.getElementById('admFileList');
  if (!list) return;
  if (!sbReady()) {
    list.innerHTML = '<div style="padding:24px;text-align:center;color:var(--am);font-size:13px">Supabase 설정이 필요합니다</div>';
    return;
  }
  list.innerHTML = '<div style="text-align:center;padding:32px;color:var(--tx3);font-size:13px">불러오는 중...</div>';

  fetch(SUPABASE_URL + '/rest/v1/file_uploads?order=uploaded_at.desc&limit=100', {
    headers: SB_HEADERS
  })
  .then(function(r) { return r.json(); })
  .then(function(rows) {
    if (!rows || !rows.length) {
      list.innerHTML = '<div style="text-align:center;padding:40px;color:var(--tx3);font-size:13px">업로드된 파일이 없습니다</div>';
      return;
    }
    list.innerHTML = rows.map(function(row) {
      var sizeMb = row.file_size ? (row.file_size / 1024 / 1024).toFixed(2) + 'MB' : '';
      var dt = row.uploaded_at ? new Date(row.uploaded_at).toLocaleString('ko-KR', {month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}) : '';
      var dlTag = row.downloaded_at
        ? '<span style="font-size:10px;color:var(--gr);font-weight:600">✓ 다운로드 ' + new Date(row.downloaded_at).toLocaleString('ko-KR',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}) + '</span>'
        : '<span style="font-size:10px;color:var(--tx3)">미다운로드</span>';
      return '<div class="adm-file-row" id="frow-' + row.id + '">'
        + '<div class="adm-file-info">'
          + '<div class="adm-file-oid">' + (row.order_id || '') + '</div>'
          + '<div class="adm-file-name">' + (row.file_name || '') + '</div>'
          + '<div class="adm-file-meta">' + (row.student_name || '') + ' · ' + (row.student_id || '') + ' · ' + (row.file_type || '') + (row.memo ? ' · ' + row.memo : '') + '</div>'
          + '<div class="adm-file-meta2">' + dt + (sizeMb ? ' · ' + sizeMb : '') + ' · ' + dlTag + '</div>'
        + '</div>'
        + '<div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0">'
          + '<button class="btn" style="font-size:11px;padding:6px 12px;white-space:nowrap" onclick="admDownloadFile(\'' + row.id + '\',\'' + row.storage_path + '\',\'' + (row.file_name||'file.pdf').replace(/'/g,"\\'") + '\')">다운로드</button>'
          + '<button class="btn" style="font-size:11px;padding:6px 12px;white-space:nowrap;color:var(--rd);border-color:var(--rd)" onclick="admDeleteFile(\'' + row.id + '\',\'' + row.storage_path + '\')">삭제</button>'
        + '</div>'
      + '</div>';
    }).join('');
  })
  .catch(function(err) {
    list.innerHTML = '<div style="padding:24px;text-align:center;color:var(--rd);font-size:13px">오류: ' + err.message + '</div>';
  });
}

function admDeleteOldFiles() {
  if (!sbReady()) { showToast('Supabase 설정 필요'); return; }

  // 3일 이전 날짜 계산
  var cutoff = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

  // 3일 이상 된 파일 목록 조회
  fetch(SUPABASE_URL + '/rest/v1/file_uploads?uploaded_at=lt.' + cutoff + '&select=id,storage_path,file_name,order_id', {
    headers: SB_HEADERS
  })
  .then(function(r) { return r.json(); })
  .then(function(rows) {
    if (!rows || !rows.length) {
      showToast('3일 이상 된 파일이 없어요 👍');
      return;
    }
    if (!confirm('3일 이상 된 파일 ' + rows.length + '개를 삭제할까요?\n삭제 후 복구가 불가능해요.')) return;

    var done = 0;
    rows.forEach(function(row) {
      // Storage 삭제
      fetch(SUPABASE_URL + '/storage/v1/object/print-files/' + row.storage_path, {
        method: 'DELETE',
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY }
      }).catch(function(e) { console.warn('Storage 삭제 실패', row.storage_path, e); });

      // DB 삭제
      fetch(SUPABASE_URL + '/rest/v1/file_uploads?id=eq.' + row.id, {
        method: 'DELETE',
        headers: SB_HEADERS
      })
      .then(function() {
        done++;
        if (done === rows.length) {
          showToast('🗑️ ' + done + '개 파일 삭제 완료!');
          admLoadFiles();
        }
      })
      .catch(function(e) { console.warn('DB 삭제 실패', e); });
    });
  })
  .catch(function(err) { showToast('오류: ' + err.message); });
}

function admDeleteFile(rowId, storagePath) {
  if (!confirm('이 파일을 삭제할까요? 복구가 불가능해요.')) return;
  if (!sbReady()) { showToast('Supabase 설정 필요'); return; }

  // Storage에서 파일 삭제
  fetch(SUPABASE_URL + '/storage/v1/object/print-files/' + storagePath, {
    method: 'DELETE',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
    }
  }).catch(function(e) { console.warn('Storage 삭제 실패', e); });

  // DB에서 행 삭제
  fetch(SUPABASE_URL + '/rest/v1/file_uploads?id=eq.' + rowId, {
    method: 'DELETE',
    headers: SB_HEADERS
  })
  .then(function(r) {
    if (!r.ok) return r.text().then(function(t) { throw new Error(t); });
    // 카드 즉시 제거
    var el = document.getElementById('frow-' + rowId);
    if (el) el.remove();
    showToast('🗑️ 파일 삭제 완료');
  })
  .catch(function(err) { showToast('삭제 오류: ' + err.message); });
}

function admDownloadByOrderId(orderId) {
  if (!sbReady()) { showToast('Supabase 설정 필요'); return; }
  showToast('📥 파일 찾는 중...');
  fetch(SUPABASE_URL + '/rest/v1/file_uploads?order_id=eq.' + orderId + '&order=uploaded_at.desc&limit=1', {
    headers: SB_HEADERS
  })
  .then(function(r) { return r.json(); })
  .then(function(rows) {
    if (!rows || !rows.length) { showToast('업로드된 파일이 없어요'); return; }
    var row = rows[0];
    admDownloadFile(row.id, row.storage_path, row.file_name || 'file.pdf', orderId);
  })
  .catch(function(err) { showToast('오류: ' + err.message); });
}

function admDownloadFile(rowId, storagePath, fileName, orderId) {
  if (!sbReady()) { showToast('Supabase 설정 필요'); return; }

  // 다운로드 기록 저장
  fetch(SUPABASE_URL + '/rest/v1/file_uploads?id=eq.' + rowId, {
    method: 'PATCH',
    headers: Object.assign({}, SB_HEADERS, { 'Prefer': 'return=minimal' }),
    body: JSON.stringify({ downloaded_at: new Date().toISOString() })
  }).catch(function(e) { console.warn('기록 저장 실패', e); });

  showToast('📥 다운로드 준비 중...');

  fetch(SUPABASE_URL + '/storage/v1/object/print-files/' + storagePath, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
    }
  })
  .then(function(r) {
    if (!r.ok) return r.text().then(function(t) { throw new Error(t); });
    return r.blob();
  })
  .then(function(blob) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
    showToast('✅ 다운로드 완료!');
    // 카드의 ✓파일 ↓ 텍스트를 '다운로드 완료 HH:MM'으로 바꿈
    if (orderId) {
      var timeStr = new Date().toLocaleTimeString('ko-KR', {hour:'2-digit', minute:'2-digit'});
      document.querySelectorAll('.fc-dl').forEach(function(el) {
        if (el.getAttribute('onclick') && el.getAttribute('onclick').indexOf(orderId) >= 0) {
          el.textContent = '✓ 다운로드 완료 ' + timeStr;
          el.style.cursor = 'default';
          el.onclick = null;
          el.style.textDecoration = 'none';
          el.style.color = 'var(--gr)';
        }
      });
    }
    setTimeout(admLoadFiles, 800);
  })
  .catch(function(err) {
    showToast('다운로드 오류: ' + err.message);
    console.error(err);
  });
}

// ══════════ 온보딩 팝업 ══════════
function initOnboarding(){
  var steps=[
    {kicker:'기존엔 이랬는데...',big:'이제 <em>한 화면</em>에서\n다 끝나요',caption:'신청 → 파일전달 → 완료까지',
     body:'<div class="ob-compare"><div class="ob-col ob-before"><div class="ob-ch">😮‍💨 기존</div><div class="ob-cb"><div class="ob-row ob-bad">구글시트 따로</div><div class="ob-row ob-bad">파일 이메일 전송</div><div class="ob-row ob-bad">신청번호 없음</div><div class="ob-row ob-bad">대기 몇 명인지 모름</div></div></div><div class="ob-col ob-after"><div class="ob-ch">✨ 지금</div><div class="ob-cb"><div class="ob-row ob-good">한 화면에서 신청</div><div class="ob-row ob-good">파일 인앱 업로드</div><div class="ob-row ob-good">신청번호 자동발급</div><div class="ob-row ob-good">대기 순서 실시간</div></div></div></div>'},
    {kicker:'신청 완료하면',big:'내 순서가\n<em>숫자로 보여요</em>',caption:'새로고침 없이 실시간',
     body:'<div class="ob-hl"><div class="ob-hl-num">3번째</div><div class="ob-hl-txt"><div class="ob-hl-t">지금 내 대기 순서</div><div class="ob-hl-s">예상 대기 약 15분 · 근무자 김경민</div></div></div><div class="ob-compare"><div class="ob-col ob-before"><div class="ob-ch">😮‍💨 기존</div><div class="ob-cb"><div class="ob-row ob-bad">직접 물어봐야 함</div><div class="ob-row ob-bad">언제 되는지 몰라</div></div></div><div class="ob-col ob-after"><div class="ob-ch">✨ 지금</div><div class="ob-cb"><div class="ob-row ob-good">순서 실시간 표시</div><div class="ob-row ob-good">예상 시간까지</div></div></div></div>'},
    {kicker:'출력 완료되는 순간',big:'기다리다 놓쳤던\n<em>그 알림</em>',caption:'이제 딴짓해도 괜찮아요',
     body:'<div class="ob-notif"><div class="ob-nbar"><span class="ob-nbd" style="background:#E24B4A"></span><span class="ob-nbd" style="background:#F5C842"></span><span class="ob-nbd" style="background:#1D9E75"></span><span style="margin-left:6px;font-size:9px;color:#aaa">VCD 출력실</span></div><div class="ob-nbody"><span style="font-size:20px">🖨️</span><div><div class="ob-nt">출력 완료!</div><div class="ob-ns">A35 박지율 — 지금 수령하러 오세요</div></div></div></div><div class="ob-compare"><div class="ob-col ob-before"><div class="ob-ch">😮‍💨 기존</div><div class="ob-cb"><div class="ob-row ob-bad">직접 확인해야</div><div class="ob-row ob-bad">놓치기 일쑤</div></div></div><div class="ob-col ob-after"><div class="ob-ch">✨ 지금</div><div class="ob-cb"><div class="ob-row ob-good">팝업 즉시 알림</div><div class="ob-row ob-good">브라우저 푸시</div></div></div></div>'}
  ];
  var cur=0;
  var el=document.createElement('div');
  el.id='obBackdrop';
  el.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
  el.innerHTML='<style>.ob-modal{background:#fff;border-radius:20px;width:100%;max-width:460px;overflow:hidden}.ob-hero{background:#1B3A6B;padding:26px 24px 20px;text-align:center}.ob-kicker{font-size:12px;color:rgba(255,255,255,.5);margin-bottom:9px}.ob-big{font-size:27px;font-weight:500;color:#fff;line-height:1.3;margin-bottom:8px}.ob-big em{color:#F5C842;font-style:normal}.ob-caption{font-size:13px;color:rgba(255,255,255,.45)}.ob-body{padding:16px 18px 10px}.ob-compare{display:grid;grid-template-columns:1fr 1fr;gap:10px}.ob-col{border-radius:12px;overflow:hidden}.ob-ch{padding:9px 10px;font-size:12px;font-weight:500;text-align:center}.ob-before .ob-ch{background:#F2F2F0;color:#aaa}.ob-after .ob-ch{background:#1B3A6B;color:#fff}.ob-cb{padding:11px;background:#F8F8F6;display:flex;flex-direction:column;gap:8px}.ob-after .ob-cb{background:#EEF4FF}.ob-row{font-size:12px;padding-left:13px;position:relative;line-height:1.5}.ob-row::before{content:"";position:absolute;left:0;top:7px;width:5px;height:5px;border-radius:50%}.ob-bad{color:#ccc;text-decoration:line-through}.ob-bad::before{background:#E24B4A}.ob-good{color:#1B3A6B;font-weight:500}.ob-good::before{background:#1B3A6B}.ob-hl{background:#1B3A6B;border-radius:10px;padding:10px 12px;display:flex;align-items:center;gap:10px;margin-bottom:8px}.ob-hl-num{font-size:26px;font-weight:500;color:#F5C842;flex-shrink:0;line-height:1}.ob-hl-t{font-size:12px;font-weight:500;color:#fff}.ob-hl-s{font-size:10px;color:rgba(255,255,255,.6);margin-top:2px}.ob-notif{border-radius:10px;border:0.5px solid rgba(0,0,0,.1);overflow:hidden;margin-bottom:8px}.ob-nbar{background:#F2F2F0;padding:5px 10px;display:flex;align-items:center;gap:3px}.ob-nbd{width:6px;height:6px;border-radius:50%;display:inline-block}.ob-nbody{padding:8px 12px;display:flex;align-items:center;gap:8px}.ob-nt{font-size:12px;font-weight:500;color:#111}.ob-ns{font-size:10px;color:#888;margin-top:2px}.ob-foot{padding:12px 18px 20px}.ob-dots{display:flex;justify-content:center;gap:6px;margin-bottom:14px}.ob-dot{width:5px;height:5px;border-radius:50%;background:#D3D1C7;display:inline-block;cursor:pointer;transition:all .2s}.ob-dot.on{background:#1B3A6B;width:20px;border-radius:3px}.ob-brow{display:flex;gap:7px}.ob-bs{flex:1;padding:12px;font-size:13px;border:0.5px solid #ddd;border-radius:10px;background:transparent;color:#aaa;cursor:pointer}.ob-bn{flex:2;padding:12px;font-size:14px;font-weight:500;background:#1B3A6B;color:#fff;border:none;border-radius:10px;cursor:pointer}</style>'
    +'<div class="ob-modal"><div class="ob-hero" id="obHero"></div><div class="ob-body" id="obBody"></div><div class="ob-foot"><div class="ob-dots" id="obDots"></div><div class="ob-brow"><button class="ob-bs" onclick="obClose()">건너뛰기</button><button class="ob-bn" id="obNext" onclick="obNext()">다음 →</button></div></div></div>';
  document.body.appendChild(el);
  function obRender(){
    var s=steps[cur];
    document.getElementById('obHero').innerHTML='<div class="ob-kicker">'+s.kicker+'</div><div class="ob-big">'+s.big.replace('\n','<br>')+'</div><div class="ob-caption">'+s.caption+'</div>';
    document.getElementById('obBody').innerHTML=s.body;
    document.getElementById('obDots').innerHTML=steps.map(function(_,i){return '<span class="ob-dot'+(i===cur?' on':'')+'" onclick="obGo('+i+')"></span>';}).join('');
    document.getElementById('obNext').textContent=cur===steps.length-1?'시작하기 →':'다음 →';
  }
  window.obNext=function(){if(cur<steps.length-1){cur++;obRender();}else{obClose();}};
  window.obGo=function(i){cur=i;obRender();};
  window.obClose=function(){localStorage.setItem('vcd_onboarded','1');var bd=document.getElementById('obBackdrop');if(bd)bd.remove();};
  obRender();
}
// ══════════════════════════════════

// ── INIT ──
calcCost();calcRiso();
selDisc(0,'일반학생');
document.getElementById('pp-0').classList.add('on');
selSzGroup('A4');
selColor('흑백');
renderWorkerList();detectDuty();
var rd=document.getElementById('risoDate');if(rd){rd.value=new Date().toISOString().split('T')[0];renderSlots();}
var rdt=document.getElementById('rDate');if(rdt)rdt.value=new Date().toISOString().split('T')[0];
var ard=document.getElementById('adminRisoDate');if(ard)ard.value=new Date().toISOString().split('T')[0];
if('Notification' in window&&Notification.permission==='default')Notification.requestPermission();
initOnboarding();