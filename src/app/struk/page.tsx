import type { Metadata } from "next";
import Script from "next/script";
import "./struk.css";

export const metadata: Metadata = {
  title: "Make a List",
  description: "Cetak struk konser SIDESTAGE — masukkan konser yang lu datangin, download PNG.",
};


export default function StrukPage() {
  return (
    <div className="struk-page bg-[#E7E7E4]">
      <div className="wrap">
        <header className="top">
          <h1>Form Struk</h1>
          <p>Isi form di kiri, struk SIDESTAGE langsung jadi di kanan. Download sebagai PNG — gambar yang kamu lihat di preview persis sama dengan file hasil download-nya.</p>
        </header>

        <div className="layout">
          <section className="panel" aria-label="Form struk">
            <h2>Isi Struk</h2>

            <div className="field">
              <label htmlFor="fUsername">Username</label>
              <input type="text" id="fUsername" defaultValue="LEN" autoComplete="off" />
            </div>

            <div className="rows-head" aria-hidden="true"><span>Nama Konser</span><span>Tanggal Konser</span><span></span></div>
            <div id="rows"></div>
            <button type="button" className="add-btn" id="btnAdd">+ TAMBAH KONSER</button>

            <div className="live-stats">
              <span>ITEM COUNT&nbsp; <b id="statCount">5</b></span>
            </div>

            <button type="button" className="btn-generate" id="btnGenerate">GENERATE CARD BARU</button>

            <div className="actions">
              <button type="button" className="btn-download" id="btnDownload">DOWNLOAD PNG</button>
              <button type="button" className="btn-reset" id="btnReset">RESET KE CONTOH</button>
            </div>
          </section>

          <section className="preview-panel" aria-label="Preview struk">
            <div className="preview-head">
              <h2>Preview Struk</h2>
              <span>544 × 1121 &middot; PNG</span>
            </div>
            <div className="canvas-shell">
              <canvas id="receipt" width="544" height="1121"></canvas>
            </div>
          </section>
        </div>
      </div>

      <div className="sticky-bar" id="stickyBar">
        <button type="button" className="btn-download" id="btnDownloadMobile">DOWNLOAD PNG</button>
        <button type="button" className="btn-reset" id="btnResetMobile">RESET</button>
      </div>

      <Script id="struk-generator" strategy="afterInteractive">{`
(function(){
  "use strict";

  var W = 1080;
  var PAD_X = 90;
  var PAD_TOP = 150;
  var PAD_BOT = 100;
  var OUT_W = 544;
  var OUT_H = 1121;
  var SCALE = OUT_W / W;
  var DESIGN_H = OUT_H / SCALE;
  var INK = "#161616";
  var PAPER = "#FBFBF8";
  var TITLE = "SIDESTAGE";

  var canvas = document.getElementById('receipt');
  var ctx = canvas.getContext('2d');

  var TEXTURE_ALPHA = 1.0;
  var textureImg = new Image();
  var textureReady = false;
  textureImg.onload = function(){ textureReady = true; draw(); };
  textureImg.src = '/brand/paper-texture.png';

  var logoImg = new Image();
  var logoReady = false;
  logoImg.onload = function(){ logoReady = true; draw(); };
  logoImg.src = '/brand/sidestage-logo.png';
  var LOGO_W = 648;
  function logoDims(){
    if(logoReady && logoImg.naturalWidth > 0 && logoImg.naturalHeight > 0){
      return { w: LOGO_W, h: Math.round(LOGO_W * logoImg.naturalHeight / logoImg.naturalWidth) };
    }
    return null;
  }

  var elUsername = document.getElementById('fUsername');
  var rowsEl = document.getElementById('rows');
  var btnAdd = document.getElementById('btnAdd');
  var statCount = document.getElementById('statCount');

  var DEFAULT_ROWS = [
    { name: "PESTAPORA", date: "2026-09-24" },
    { name: "SOUNDRENALINE", date: "2026-12-05" },
    { name: "FLOWERCITY FEST", date: "2026-12-12" },
    { name: "JOYLAND SESSIONS", date: "2026-11-28" },
    { name: "DJAKARTA WAREHOUSE PROJECT", date: "2026-12-11" }
  ];

  var SEQ_KEY = 'sidestage_card_seq';
  var STATE_KEY = 'sidestage_card_state';
  var cardState = null;

  function lsGet(k){
    try{ return window.localStorage.getItem(k); }catch(e){ return null; }
  }
  function lsSet(k, v){
    try{ window.localStorage.setItem(k, v); }catch(e){}
  }
  function randDigits(n){
    var s = '';
    for(var i=0;i<n;i++) s += Math.floor(Math.random() * 10);
    return s;
  }
  function todayISO(){
    var d = new Date();
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }
  function mintCard(seq){
    return {
      seq: seq,
      orderText: '#' + randDigits(5) + String(seq).padStart(3, '0'),
      createdISO: todayISO(),
      auth: randDigits(6),
      card4: randDigits(4)
    };
  }
  function generateCard(){
    var prev = 0;
    var stored = parseInt(lsGet(SEQ_KEY), 10);
    if(!isNaN(stored)) prev = stored;
    if(cardState && cardState.seq > prev) prev = cardState.seq;
    cardState = mintCard(prev + 1);
    lsSet(SEQ_KEY, String(cardState.seq));
    lsSet(STATE_KEY, JSON.stringify(cardState));
  }
  function restoreCard(){
    var raw = lsGet(STATE_KEY);
    if(!raw) return false;
    try{
      var s = JSON.parse(raw);
      if(s && s.orderText && s.createdISO && s.auth && s.card4 && s.seq){
        cardState = s;
        return true;
      }
    }catch(e){}
    return false;
  }
  if(!restoreCard()) generateCard();

  var dateFmt = null;
  try{
    dateFmt = new Intl.DateTimeFormat('en-US', { day:'2-digit', month:'short', year:'numeric' });
  }catch(e){ dateFmt = null; }
  var MONTHS_EN = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  function formatConcertDate(iso){
    if(!iso) return "-";
    var parts = String(iso).split('-');
    if(parts.length !== 3) return "-";
    var y = parseInt(parts[0], 10);
    var m = parseInt(parts[1], 10);
    var d = parseInt(parts[2], 10);
    if(isNaN(y) || isNaN(m) || isNaN(d) || m < 1 || m > 12 || d < 1 || d > 31) return "-";
    var dt = new Date(y, m - 1, d);
    if(isNaN(dt.getTime())) return "-";
    if(dateFmt){
      try{
        var fp = dateFmt.formatToParts(dt);
        var day = "", mon = "", yr = "";
        fp.forEach(function(p){
          if(p.type === 'day') day = p.value;
          else if(p.type === 'month') mon = p.value;
          else if(p.type === 'year') yr = p.value;
        });
        if(day && mon && yr) return (day + " " + mon + " " + yr).toUpperCase();
      }catch(e){}
    }
    return String(d).padStart(2, '0') + " " + MONTHS_EN[m - 1] + " " + y;
  }

  function createRow(data){
    var row = document.createElement('div');
    row.className = 'item-row';

    var inName = document.createElement('input');
    inName.type = 'text'; inName.className = 'f-name'; inName.placeholder = 'Nama konser';
    inName.value = data ? data.name : ''; inName.setAttribute('aria-label','Nama konser');

    var inDate = document.createElement('input');
    inDate.type = 'date'; inDate.className = 'f-date';
    inDate.value = data ? data.date : ''; inDate.setAttribute('aria-label','Tanggal konser');

    var del = document.createElement('button');
    del.type = 'button'; del.className = 'del-btn'; del.textContent = '×';
    del.setAttribute('aria-label','Hapus konser');
    del.addEventListener('click', function(){
      if(rowsEl.children.length <= 1) return;
      row.remove();
      syncDeleteButtons();
      draw();
    });

    row.appendChild(inName);
    row.appendChild(inDate);
    row.appendChild(del);
    return row;
  }
  function syncDeleteButtons(){
    var n = rowsEl.children.length;
    for(var i=0;i<rowsEl.children.length;i++){
      var b = rowsEl.children[i].querySelector('.del-btn');
      if(b) b.disabled = (n <= 1);
    }
    btnAdd.disabled = (n >= 50);
  }
  function getRowsData(){
    var out = [];
    for(var i=0;i<rowsEl.children.length;i++){
      var r = rowsEl.children[i];
      var name = r.querySelector('.f-name').value || '';
      var iso = r.querySelector('.f-date').value || '';
      out.push({ name:name, dateText: formatConcertDate(iso) });
    }
    return out;
  }
  function setRows(list){
    rowsEl.innerHTML = '';
    list.forEach(function(d){ rowsEl.appendChild(createRow(d)); });
    syncDeleteButtons();
  }
  setRows(DEFAULT_ROWS);

  btnAdd.addEventListener('click', function(){
    if(rowsEl.children.length >= 50) return;
    rowsEl.appendChild(createRow({name:'', date:''}));
    syncDeleteButtons();
    draw();
    var inputs = rowsEl.lastChild.querySelectorAll('input');
    if(inputs[0]) inputs[0].focus();
  });

  function hashString(str){
    var h = 2166136261;
    for(var i=0;i<str.length;i++){
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function mulberry32(seed){
    var a = seed >>> 0;
    return function(){
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + (t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function wrapWords(c, text, maxWidth){
    var words = String(text).split(/\\s+/).filter(Boolean);
    if(words.length === 0) return [""];
    var lines = [];
    var cur = "";
    for(var i=0;i<words.length;i++){
      var w = words[i];
      while(c.measureText(w).width > maxWidth && w.length > 1){
        var cut = w.length;
        while(cut > 1 && c.measureText(w.slice(0,cut)).width > maxWidth) cut--;
        if(cur){ lines.push(cur); cur = ""; }
        lines.push(w.slice(0,cut));
        w = w.slice(cut);
      }
      var test = cur ? cur + " " + w : w;
      if(c.measureText(test).width <= maxWidth || cur === ""){
        cur = test;
      } else {
        lines.push(cur);
        cur = w;
      }
    }
    if(cur) lines.push(cur);
    return lines.length ? lines : [""];
  }

  var FONT = '"Space Mono", "Courier New", monospace';

  function buildModel(){
    var username = (elUsername.value || '').trim() || '—';
    var rows = getRowsData();
    return {
      title: TITLE,
      orderText: cardState.orderText,
      createdText: formatConcertDate(cardState.createdISO),
      auth: cardState.auth,
      card4: cardState.card4,
      username: username.toUpperCase(),
      rows: rows,
      count: rows.length
    };
  }

  function cardLines(model){
    return [
      'CARD #: **** **** **** ' + model.card4,
      'AUTH CODE: ' + model.auth,
      'CARDHOLDER: ' + model.username,
      '',
      'https://sidestage.com'
    ];
  }

  var QTY_X = PAD_X;
  var ITEM_X = PAD_X + 118;
  var DATE_RIGHT = W - PAD_X;
  var ITEM_W = (DATE_RIGHT - 262) - ITEM_X;

  function measureHeight(c, model, itemSize, lineH, rowPad){
    var y = PAD_TOP;
    var tSize = 76;
    c.font = '700 ' + tSize + 'px ' + FONT;
    while(c.measureText(model.title).width > (W - PAD_X*2) && tSize > 34){
      tSize -= 4; c.font = '700 ' + tSize + 'px ' + FONT;
    }
    var ld = logoDims();
    y += ld ? ld.h : tSize;
    y += 36 + 88;
    y += 44;
    y += 40;
    y += 44;
    y += 26;
    y += 48;
    y += 26;
    c.font = '400 ' + itemSize + 'px ' + FONT;
    model.rows.forEach(function(r){
      var itemText = r.name.trim() ? r.name.trim() : '—';
      var lines = wrapWords(c, itemText.toUpperCase(), ITEM_W);
      y += lines.length * lineH + rowPad;
    });
    y += 12;
    y += 26;
    y += 54;
    y += 56;
    c.font = '400 32px ' + FONT;
    var cl = cardLines(model);
    var cardLineCount = 0;
    cl.forEach(function(ln){ cardLineCount += wrapWords(c, ln, W - PAD_X*2).length; });
    y += cardLineCount * 48;
    y += 56;
    y += 52;
    y += 36;
    y += 120;
    y += 26;
    y += 36;
    y += PAD_BOT;
    return Math.ceil(y);
  }

  function fitMetrics(c, model){
    c.setTransform(1, 0, 0, 1, 0, 0);
    var itemSize = 34;
    while(true){
      var lineH = Math.max(12, Math.round(52 * itemSize / 34));
      var rowPad = Math.max(0, Math.round(16 * itemSize / 34));
      var h = measureHeight(c, model, itemSize, lineH, rowPad);
      if(h <= DESIGN_H || itemSize <= 9){
        return { itemSize:itemSize, lineH:lineH, rowPad:rowPad, contentH:h };
      }
      itemSize -= 2;
    }
  }

  function dashedLine(c, y){
    c.save();
    c.strokeStyle = INK; c.globalAlpha = 1; c.lineWidth = 2;
    c.setLineDash([10, 8]);
    c.beginPath(); c.moveTo(PAD_X, y); c.lineTo(W - PAD_X, y); c.stroke();
    c.restore();
  }

  function draw(){
    var model = buildModel();
    statCount.textContent = model.count;
    var fit = fitMetrics(ctx, model);
    var H = DESIGN_H;
    var slack = Math.max(0, H - fit.contentH);
    canvas.width = OUT_W;
    canvas.height = OUT_H;

    var c = ctx;
    c.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    c.globalAlpha = 1;
    c.globalCompositeOperation = 'source-over';
    c.fillStyle = PAPER;
    c.fillRect(0, 0, W, H);

    if(textureReady && textureImg.naturalWidth > 0 && textureImg.naturalHeight > 0){
      var scale = Math.max(W / textureImg.naturalWidth, H / textureImg.naturalHeight);
      var dw = textureImg.naturalWidth * scale;
      var dh = textureImg.naturalHeight * scale;
      var dx = (W - dw) / 2;
      var dy = (H - dh) / 2;
      c.save();
      c.globalCompositeOperation = 'multiply';
      c.globalAlpha = TEXTURE_ALPHA;
      c.drawImage(textureImg, dx, dy, dw, dh);
      c.restore();
      c.globalCompositeOperation = 'source-over';
      c.globalAlpha = 1;
      c.fillStyle = INK;
    }

    var y = PAD_TOP;
    var cx = W / 2;

    var ld = logoDims();
    if(ld){
      c.save();
      c.globalCompositeOperation = 'multiply';
      c.globalAlpha = 1;
      c.drawImage(logoImg, Math.round(cx - ld.w / 2), Math.round(y), ld.w, ld.h);
      c.restore();
      c.globalCompositeOperation = 'source-over';
      c.globalAlpha = 1;
      c.fillStyle = INK;
      y += ld.h;
    } else {
      var tSize = 76;
      c.font = '700 ' + tSize + 'px ' + FONT;
      while(c.measureText(model.title).width > (W - PAD_X*2) && tSize > 34){
        tSize -= 4; c.font = '700 ' + tSize + 'px ' + FONT;
      }
      c.fillStyle = INK; c.globalAlpha = 1; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
      c.fillText(model.title, cx, y + tSize * 0.82);
      y += tSize;
    }
    y += 36 + 88;

    c.fillStyle = INK; c.globalAlpha = 1; c.textAlign = 'left';
    c.font = '400 36px ' + FONT;
    c.fillText(model.orderText, PAD_X, y + 36);
    y += 44;
    c.font = '400 32px ' + FONT;
    c.fillText(model.createdText, PAD_X, y + 32);
    y += 40 + 44;

    dashedLine(c, y); y += 26;
    c.font = '700 34px ' + FONT;
    c.fillStyle = INK; c.globalAlpha = 1;
    c.textAlign = 'left';  c.fillText('QTY', QTY_X, y + 36);
    c.textAlign = 'left';  c.fillText('ITEM', ITEM_X, y + 36);
    c.textAlign = 'right'; c.fillText('DATE', DATE_RIGHT, y + 36);
    y += 48;
    dashedLine(c, y); y += 26;

    c.font = '400 ' + fit.itemSize + 'px ' + FONT;
    var rowBase = Math.round(fit.itemSize * 36 / 34);
    model.rows.forEach(function(r, idx){
      var itemText = r.name.trim() ? r.name.trim() : '—';
      var lines = wrapWords(c, itemText.toUpperCase(), ITEM_W);
      var qty = String(idx + 1).padStart(2, '0');
      lines.forEach(function(ln, li){
        var baseline = y + rowBase + li * fit.lineH;
        c.fillStyle = INK; c.globalAlpha = 1;
        if(li === 0){
          c.textAlign = 'left';  c.fillText(qty, QTY_X, baseline);
          c.textAlign = 'right'; c.fillText(r.dateText, DATE_RIGHT, baseline);
        }
        c.textAlign = 'left'; c.fillText(ln, ITEM_X, baseline);
      });
      y += lines.length * fit.lineH + fit.rowPad;
    });

    y += slack;

    y += 12;
    dashedLine(c, y); y += 26;

    c.font = '400 34px ' + FONT;
    c.fillStyle = INK; c.globalAlpha = 1;
    c.textAlign = 'left';  c.fillText('ITEM COUNT:', QTY_X, y + 38);
    c.textAlign = 'right'; c.fillText(String(model.count), DATE_RIGHT, y + 38);
    y += 54 + 56;

    c.font = '400 32px ' + FONT;
    c.textAlign = 'left';
    var cl = cardLines(model);
    cl.forEach(function(ln){
      var ls = wrapWords(c, ln, W - PAD_X*2);
      ls.forEach(function(sub){
        c.fillStyle = INK; c.globalAlpha = 1;
        c.fillText(sub, PAD_X, y + 32);
        y += 48;
      });
    });
    y += 56;

    c.font = '700 38px ' + FONT;
    c.fillStyle = INK; c.globalAlpha = 1; c.textAlign = 'center';
    c.fillText('THANK YOU FOR VISITING!', cx, y + 38);
    y += 52 + 36;

    var seedStr = 'ORDER' + model.orderText + '-' + model.auth + '-' + model.username;
    var rnd = mulberry32(hashString(seedStr));
    var bcW = Math.round(W * 0.55);
    var bcH = 120;
    var bcX = Math.round((W - bcW) / 2);
    c.fillStyle = INK; c.globalAlpha = 1;
    var bx = bcX;
    var guard = 0;
    while(bx < bcX + bcW && guard < 400){
      guard++;
      var barW = 2 + Math.floor(rnd() * 9);
      var gapW = 2 + Math.floor(rnd() * 6);
      if(bx + barW > bcX + bcW) barW = (bcX + bcW) - bx;
      c.fillStyle = INK; c.globalAlpha = 1;
      c.fillRect(bx, y, barW, bcH);
      bx += barW + gapW;
    }
    y += bcH + 26;

    c.font = '400 26px ' + FONT;
    c.fillStyle = INK; c.globalAlpha = 1; c.textAlign = 'center';
    try{ c.letterSpacing = '6px'; }catch(e){}
    c.fillText('© sidestage', cx, y + 26);
    try{ c.letterSpacing = '0px'; }catch(e){}
  }

  var formPanel = document.querySelector('.panel');
  formPanel.addEventListener('input', draw);
  formPanel.addEventListener('change', draw);

  function whenAssetsReady(){
    var jobs = [];
    if(!textureReady && textureImg.src) jobs.push(new Promise(function(res){ textureImg.onload = function(){ textureReady = true; res(); }; textureImg.onerror = res; }));
    if(!logoReady && logoImg.src) jobs.push(new Promise(function(res){ logoImg.onload = function(){ logoReady = true; res(); }; logoImg.onerror = res; }));
    if(document.fonts && document.fonts.ready) jobs.push(document.fonts.ready);
    return Promise.all(jobs);
  }
  function doDownload(){
    whenAssetsReady().then(function(){
      draw();
      savePNG();
    });
  }
  function savePNG(){
    draw();
    if(canvas.toBlob){
      canvas.toBlob(function(blob){
        if(!blob) return;
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url; a.download = 'struk.png';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function(){ URL.revokeObjectURL(url); }, 4000);
      }, 'image/png');
    } else {
      var a2 = document.createElement('a');
      a2.href = canvas.toDataURL('image/png'); a2.download = 'struk.png';
      document.body.appendChild(a2); a2.click(); a2.remove();
    }
  }
  function doReset(){
    generateCard();
    elUsername.value = 'LEN';
    setRows(DEFAULT_ROWS.map(function(d){ return {name:d.name, date:d.date}; }));
    draw();
  }
  document.getElementById('btnGenerate').addEventListener('click', function(){
    generateCard();
    draw();
  });
  var stickyBar = document.getElementById('stickyBar');
  function syncStickyBar(){
    if(window.scrollY > 140){ stickyBar.classList.add('show'); }
    else{ stickyBar.classList.remove('show'); }
  }
  window.addEventListener('scroll', syncStickyBar, { passive:true });
  syncStickyBar();

  document.getElementById('btnDownload').addEventListener('click', doDownload);
  document.getElementById('btnDownloadMobile').addEventListener('click', doDownload);
  document.getElementById('btnReset').addEventListener('click', doReset);
  document.getElementById('btnResetMobile').addEventListener('click', doReset);

  draw();
  if(document.fonts && document.fonts.load){
    Promise.all([
      document.fonts.load('700 76px "Space Mono"'),
      document.fonts.load('400 34px "Space Mono"'),
      document.fonts.load('700 38px "Space Mono"')
    ]).then(function(){ draw(); }).catch(function(){});
    if(document.fonts.ready){
      document.fonts.ready.then(function(){ draw(); });
    }
  }
})();
`}</Script>
    </div>
  );
}
