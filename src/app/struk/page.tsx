import type { Metadata } from "next";
import Script from "next/script";
import "./struk.css";

export const metadata: Metadata = {
  title: "Make a List! — SIDESTAGE // 2026",
  description: "Cetak struk konser SIDESTAGE — masukkan konser yang lu datangin, download PNG.",
};

const SCRIPT = String.raw`
(function(){
  "use strict";

  var W = 1080;
  var PAD_X = 90;
  var PAD_TOP = 150;
  var PAD_BOT = 100;
  /* Fixed output size: the canvas bitmap and the downloaded PNG are
     always exactly 544 x 1121 px. The layout is still drawn in the
     1080-wide design space and scaled onto the output canvas with a
     transform (S = 544/1080 ≈ 0.5037), so the design-space height is
     1121 / S ≈ 2225 design px — taller than the old 1980 minimum,
     the extra becomes blank paper under the items. */
  var OUT_W = 544;
  var OUT_H = 1121;
  var SCALE = OUT_W / W;
  var DESIGN_H = OUT_H / SCALE;
  var INK = "#161616";
  var PAPER = "#FBFBF8";
  var TITLE = "SIDESTAGE";

  var canvas = document.getElementById('receipt');
  var ctx = canvas.getContext('2d');

  /* ---------- paper texture (Len's crumpled-paper photo) ----------
     Same-origin asset, so the canvas stays untainted and toBlob
     keeps working. Drawn inside draw() on every redraw. */
  var TEXTURE_ALPHA = 1.0;
  var textureImg = new Image();
  var textureReady = false;
  textureImg.onload = function(){ textureReady = true; draw(); };
  textureImg.src = '/brand/paper-texture.png';

  /* ---------- masthead logo (Len's SIDESTAGE wordmark) ----------
     Black blackletter lettering on real transparency. Drawn with
     'multiply' so it lands as ink on the textured paper. Until it
     loads, draw() falls back to the old Space Mono text title so
     the receipt never renders blank-headed. */
  var logoImg = new Image();
  var logoReady = false;
  logoImg.onload = function(){ logoReady = true; draw(); };
  logoImg.src = '/brand/sidestage-logo.png';
  var LOGO_W = 648; // design px = 60% of paper width (Len's ask)
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

  /* ---------- generated card state (template values) ----------
     A "card" bundles the system-generated values: order number
     (# + 5 random digits + 3-digit sequence), creation date,
     auth code (6 random digits) and card last-4 (random).
     The sequence counter persists in localStorage so it survives
     reloads; typing in the form never consumes a sequence number.
     Only RESET mints a new card. */
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

  /* ---------- concert date formatting: "24 NOV 2026" (en-US Intl parts) ---------- */
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

  /* ---------- rows DOM ---------- */
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

  /* ---------- seeded PRNG ---------- */
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
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------- text helpers ---------- */
  function wrapWords(c, text, maxWidth){
    var words = String(text).split(/\s+/).filter(Boolean);
    if(words.length === 0) return [""];
    var lines = [];
    var cur = "";
    for(var i=0;i<words.length;i++){
      var w = words[i];
      // break a single word longer than the column
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

  /* ---------- layout + draw (single source of truth) ---------- */
  var FONT = '"Hypermarket", "Space Mono", "Courier New", monospace';

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

  // Column geometry
  var QTY_X = PAD_X;
  var ITEM_X = PAD_X + 118;
  var DATE_RIGHT = W - PAD_X;
  var ITEM_W = (DATE_RIGHT - 262) - ITEM_X;

  function measureHeight(c, model, itemSize, lineH, rowPad){
    var y = PAD_TOP;
    // title (auto-shrink)
    var tSize = 76;
    c.font = '700 ' + tSize + 'px ' + FONT;
    while(c.measureText(model.title).width > (W - PAD_X*2) && tSize > 34){
      tSize -= 4; c.font = '700 ' + tSize + 'px ' + FONT;
    }
    var ld = logoDims();
    y += ld ? ld.h : tSize;      // masthead: logo image, else text title
    y += 36 + 88;                // gap + 2 blank line-spaces (2 x 44) under the masthead
    y += 60;                     // order number line (left-aligned)
    y += 54;                     // creation date line (left-aligned)
    y += 44;                     // space to separator
    y += 26;                     // separator + gap
    y += 64;                     // header
    y += 26;                     // separator + gap
    // rows (item font metrics come from the fit-shrink pass)
    c.font = '400 ' + itemSize + 'px ' + FONT;
    model.rows.forEach(function(r){
      var itemText = r.name.trim() ? r.name.trim() : '—';
      var lines = wrapWords(c, itemText.toUpperCase(), ITEM_W);
      y += lines.length * lineH + rowPad;
    });
    y += 12;                     // separator zone
    y += 26;
    y += 70;                     // item count
    y += 56;                     // gap (min-height slack is added after this in draw)
    // card block (wrapped lines)
    c.font = '400 44px ' + FONT;
    var cl = cardLines(model);
    var cardLineCount = 0;
    cl.forEach(function(ln){ cardLineCount += wrapWords(c, ln, W - PAD_X*2).length; });
    y += cardLineCount * 64;
    y += 56;                     // gap
    y += 68;                     // thanks
    y += 36;                     // gap
    y += 120;                    // barcode
    y += 26;                     // gap
    y += 48;                     // footer line
    y += PAD_BOT;
    return Math.ceil(y);
  }

  /* Fit-shrink: the output height is fixed, so when the content is
     taller than the design height, step the item font size down
     (line height and row padding scale proportionally) and re-measure
     until everything fits — never overflow, never clip the tail.
     At full metrics (34px) the fixed blocks take ~1264 design px,
     leaving ~961 for rows at 68px per single-line row, so shrink
     first engages at 15 single-line rows. */
  function fitMetrics(c, model){
    c.setTransform(1, 0, 0, 1, 0, 0); // measureText must run untransformed
    var itemSize = 46;
    while(true){
      var lineH = Math.max(12, Math.round(76 * itemSize / 46));
      var rowPad = Math.max(0, Math.round(22 * itemSize / 46));
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

    // live stats in form
    statCount.textContent = model.count;

    // Fixed output: the canvas bitmap is always exactly 544 x 1121.
    // Content is measured in design space; the fit-shrink pass
    // guarantees it fits the fixed design height, and the leftover
    // slack becomes blank paper directly under the last item row
    // (the tail — separator, ITEM COUNT, card block — sits low as
    // one anchored group at the bottom of the receipt).
    var fit = fitMetrics(ctx, model);
    var H = DESIGN_H;
    var slack = Math.max(0, H - fit.contentH);
    canvas.width = OUT_W;
    canvas.height = OUT_H;

    var c = ctx;
    // draw everything in 1080-design coordinates, scaled to output
    c.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    // paper
    c.globalAlpha = 1;
    c.globalCompositeOperation = 'source-over';
    c.fillStyle = PAPER;
    c.fillRect(0, 0, W, H);

    // crumpled-paper photo texture: cover-fit over the whole paper,
    // multiplied into the white paper so it merges ("nyatu") instead
    // of sitting on top. Text/barcode are drawn after, fully opaque.
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

    /* 1 — MASTHEAD: Len's SIDESTAGE logo image, centred. Drawn with
       multiply so only the black lettering lands on the textured
       paper (no white box). Falls back to the old text title until
       the image has loaded. */
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
    /* two extra blank line-spaces (2 x 44) under the masthead so the
       logo breathes above the order block; comes out of the slack */
    y += 36 + 88;

    /* 2 — ORDER NUMBER + CREATION DATE (template, left-aligned) */
    c.fillStyle = INK; c.globalAlpha = 1; c.textAlign = 'left';
    c.font = '400 48px ' + FONT;
    c.fillText(model.orderText, PAD_X, y + 48);
    y += 60;
    c.font = '400 44px ' + FONT;
    c.fillText(model.createdText, PAD_X, y + 44);
    y += 54 + 44;

    /* 3 — TABLE HEADER */
    dashedLine(c, y); y += 26;
    c.font = '700 46px ' + FONT;
    c.fillStyle = INK; c.globalAlpha = 1;
    c.textAlign = 'left';  c.fillText('QTY', QTY_X, y + 48);
    c.textAlign = 'left';  c.fillText('ITEM', ITEM_X, y + 48);
    c.textAlign = 'right'; c.fillText('DATE', DATE_RIGHT, y + 48);
    y += 64;
    dashedLine(c, y); y += 26;

    /* 4 — CONCERT ROWS */
    c.font = '400 ' + fit.itemSize + 'px ' + FONT;
    var rowBase = Math.round(fit.itemSize * 48 / 46);
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

    /* blank paper: all the min-height slack sits directly under the
       last item row, so the separator + ITEM COUNT + card block form
       one anchored group at the bottom of the receipt */
    y += slack;

    /* separator above totals */
    y += 12;
    dashedLine(c, y); y += 26;

    /* 5 — ITEM COUNT */
    c.font = '400 46px ' + FONT;
    c.fillStyle = INK; c.globalAlpha = 1;
    c.textAlign = 'left';  c.fillText('ITEM COUNT:', QTY_X, y + 50);
    c.textAlign = 'right'; c.fillText(String(model.count), DATE_RIGHT, y + 50);
    y += 70 + 56;

    /* 6 — CARD BLOCK */
    c.font = '400 44px ' + FONT;
    c.textAlign = 'left';
    var cl = cardLines(model);
    cl.forEach(function(ln){
      var ls = wrapWords(c, ln, W - PAD_X*2);
      ls.forEach(function(sub){
        c.fillStyle = INK; c.globalAlpha = 1;
        c.fillText(sub, PAD_X, y + 44);
        y += 64;
      });
    });
    y += 56;

    /* 7 — THANK YOU */
    c.font = '700 50px ' + FONT;
    c.fillStyle = INK; c.globalAlpha = 1; c.textAlign = 'center';
    c.fillText('THANK YOU FOR VISITING!', cx, y + 50);
    y += 68 + 36;

    /* 8 — BARCODE (seeded from order number + auth code + username) */
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
      var barW = 2 + Math.floor(rnd() * 9);      // 2..10
      var gapW = 2 + Math.floor(rnd() * 6);      // 2..7
      if(bx + barW > bcX + bcW) barW = (bcX + bcW) - bx;
      c.fillStyle = INK; c.globalAlpha = 1;
      c.fillRect(bx, y, barW, bcH);
      bx += barW + gapW;
    }
    y += bcH + 26;

    /* 9 — footer: © + title again, small lowercase letterspaced */
    c.font = '400 34px ' + FONT;
    c.fillStyle = INK; c.globalAlpha = 1; c.textAlign = 'center';
    try{ c.letterSpacing = '6px'; }catch(e){}
    c.fillText('© sidestage', cx, y + 34);
    try{ c.letterSpacing = '0px'; }catch(e){}
  }

  /* ---------- events ---------- */
  var formPanel = document.querySelector('.panel');
  formPanel.addEventListener('input', draw);
  formPanel.addEventListener('change', draw);

  function whenAssetsReady(){
    var jobs = [];
    // Safari/iOS decode gambar async — paksa decode eksplisit biar drawImage
    // gak ngegambar tekstur kosong/half-decoded di canvas.
    function ensure(img, mark){
      if(!img.src) return;
      if(mark()) return;
      jobs.push(new Promise(function(res){
        var done = function(){ res(); };
        img.onload = function(){ (img.decode ? img.decode().catch(done).then(function(){ mark(); done(); }) : (mark(), done())); };
        img.onerror = done;
      }));
    }
    ensure(textureImg, function(){ return textureReady; });
    ensure(logoImg, function(){ return logoReady; });
    if(document.fonts && document.fonts.ready) jobs.push(document.fonts.ready);
    return Promise.all(jobs).then(function(){ textureReady = textureReady || (textureImg.naturalWidth > 0); logoReady = logoReady || (logoImg.naturalWidth > 0); });
  }
  function doDownload(){
    whenAssetsReady().then(function(){ draw(); savePNG(); });
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
    elUsername.value = '';
    setRows(DEFAULT_ROWS.map(function(d){ return {name:d.name, date:d.date}; }));
    draw();
  }
  /* sticky bottom bar on mobile: appears once the user starts scrolling,
     so it never covers the first form fields at the top of the page */
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

  /* ---------- first draw + fonts ---------- */
  draw();
  if(document.fonts && document.fonts.load){
    Promise.all([
      document.fonts.load('700 76px "Hypermarket"'),
      document.fonts.load('400 34px "Hypermarket"'),
      document.fonts.load('700 38px "Hypermarket"')
    ]).then(function(){ draw(); }).catch(function(){});
    if(document.fonts.ready){
      document.fonts.ready.then(function(){ draw(); });
    }
  }
})();
`;

export default function StrukPage() {
  return (
    <>
      <div className="struk-page" dangerouslySetInnerHTML={{ __html: MARKUP }} />
      <Script id="struk-generator" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: SCRIPT }} />
    </>
  );
}

const MARKUP = String.raw`<div class="wrap">
  <header class="top">
    <p class="kicker">SIDESTAGE // 2026</p>
    <h1>MAKE A <span class="outline">LIST!</span></h1>
    <p class="lede">Isi form di sebelah kiri, dan struk SIDESTAGE anda akan langsung terbentuk di sebelah kanan. Unduh sebagai PNG, gambar yang anda lihat pada pratinjau sama persis dengan file hasil unduhannya.</p>
  </header>

  <div class="layout">
    <!-- FORM -->
    <section class="panel" aria-label="Formulir struk">
      <div class="field">
        <label for="fUsername">Username</label>
        <input type="text" id="fUsername" value="" autocomplete="off" />
      </div>

      <div class="rows-head" aria-hidden="true"><span>Nama Konser</span><span>Tanggal Konser</span><span></span></div>
      <div id="rows"></div>
      <button type="button" class="add-btn" id="btnAdd">+ TAMBAH KONSER</button>

      <div class="live-stats">
        <span>ITEM COUNT&nbsp; <b id="statCount">5</b></span>
      </div>

      <div class="actions">
        <button type="button" class="btn-download" id="btnDownload">DOWNLOAD PNG</button>
        <button type="button" class="btn-reset btn-reset-icon" id="btnReset" aria-label="Reset ke contoh" title="Reset ke contoh"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg></button>
      </div>
    </section>

    <!-- PREVIEW -->
    <section class="preview-panel" aria-label="Preview struk">
      <div class="preview-head">
        <h2>Preview Struk</h2>
        <span>544 × 1121 &middot; PNG</span>
      </div>
      <div class="canvas-shell">
        <canvas id="receipt" width="544" height="1121"></canvas>
      </div>
    </section>
  </div>
</div>

<div class="sticky-bar" id="stickyBar">
  <button type="button" class="btn-download" id="btnDownloadMobile">DOWNLOAD PNG</button>
  <button type="button" class="btn-reset" id="btnResetMobile">RESET</button>
</div>

<script>
(function(){
  "use strict";

  var W = 1080;
  var PAD_X = 90;
  var PAD_TOP = 150;
  var PAD_BOT = 100;
  /* Fixed output size: the canvas bitmap and the downloaded PNG are
     always exactly 544 x 1121 px. The layout is still drawn in the
     1080-wide design space and scaled onto the output canvas with a
     transform (S = 544/1080 ≈ 0.5037), so the design-space height is
     1121 / S ≈ 2225 design px — taller than the old 1980 minimum,
     the extra becomes blank paper under the items. */
  var OUT_W = 544;
  var OUT_H = 1121;
  var SCALE = OUT_W / W;
  var DESIGN_H = OUT_H / SCALE;
  var INK = "#161616";
  var PAPER = "#FBFBF8";
  var TITLE = "SIDESTAGE";

  var canvas = document.getElementById('receipt');
  var ctx = canvas.getContext('2d');

  /* ---------- paper texture (Len's crumpled-paper photo) ----------
     Same-origin asset, so the canvas stays untainted and toBlob
     keeps working. Drawn inside draw() on every redraw. */
  var TEXTURE_ALPHA = 1.0;
  var textureImg = new Image();
  var textureReady = false;
  textureImg.onload = function(){ textureReady = true; draw(); };
  textureImg.src = '/brand/paper-texture.png';

  /* ---------- masthead logo (Len's SIDESTAGE wordmark) ----------
     Black blackletter lettering on real transparency. Drawn with
     'multiply' so it lands as ink on the textured paper. Until it
     loads, draw() falls back to the old Space Mono text title so
     the receipt never renders blank-headed. */
  var logoImg = new Image();
  var logoReady = false;
  logoImg.onload = function(){ logoReady = true; draw(); };
  logoImg.src = '/brand/sidestage-logo.png';
  var LOGO_W = 648; // design px = 60% of paper width (Len's ask)
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

  /* ---------- generated card state (template values) ----------
     A "card" bundles the system-generated values: order number
     (# + 5 random digits + 3-digit sequence), creation date,
     auth code (6 random digits) and card last-4 (random).
     The sequence counter persists in localStorage so it survives
     reloads; typing in the form never consumes a sequence number.
     Only RESET mints a new card. */
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

  /* ---------- concert date formatting: "24 NOV 2026" (en-US Intl parts) ---------- */
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

  /* ---------- rows DOM ---------- */
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

  /* ---------- seeded PRNG ---------- */
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
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------- text helpers ---------- */
  function wrapWords(c, text, maxWidth){
    var words = String(text).split(/\s+/).filter(Boolean);
    if(words.length === 0) return [""];
    var lines = [];
    var cur = "";
    for(var i=0;i<words.length;i++){
      var w = words[i];
      // break a single word longer than the column
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

  /* ---------- layout + draw (single source of truth) ---------- */
  var FONT = '"Hypermarket", "Space Mono", "Courier New", monospace';

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

  // Column geometry
  var QTY_X = PAD_X;
  var ITEM_X = PAD_X + 118;
  var DATE_RIGHT = W - PAD_X;
  var ITEM_W = (DATE_RIGHT - 262) - ITEM_X;

  function measureHeight(c, model, itemSize, lineH, rowPad){
    var y = PAD_TOP;
    // title (auto-shrink)
    var tSize = 76;
    c.font = '700 ' + tSize + 'px ' + FONT;
    while(c.measureText(model.title).width > (W - PAD_X*2) && tSize > 34){
      tSize -= 4; c.font = '700 ' + tSize + 'px ' + FONT;
    }
    var ld = logoDims();
    y += ld ? ld.h : tSize;      // masthead: logo image, else text title
    y += 36 + 88;                // gap + 2 blank line-spaces (2 x 44) under the masthead
    y += 60;                     // order number line (left-aligned)
    y += 54;                     // creation date line (left-aligned)
    y += 44;                     // space to separator
    y += 26;                     // separator + gap
    y += 64;                     // header
    y += 26;                     // separator + gap
    // rows (item font metrics come from the fit-shrink pass)
    c.font = '400 ' + itemSize + 'px ' + FONT;
    model.rows.forEach(function(r){
      var itemText = r.name.trim() ? r.name.trim() : '—';
      var lines = wrapWords(c, itemText.toUpperCase(), ITEM_W);
      y += lines.length * lineH + rowPad;
    });
    y += 12;                     // separator zone
    y += 26;
    y += 70;                     // item count
    y += 56;                     // gap (min-height slack is added after this in draw)
    // card block (wrapped lines)
    c.font = '400 44px ' + FONT;
    var cl = cardLines(model);
    var cardLineCount = 0;
    cl.forEach(function(ln){ cardLineCount += wrapWords(c, ln, W - PAD_X*2).length; });
    y += cardLineCount * 64;
    y += 56;                     // gap
    y += 68;                     // thanks
    y += 36;                     // gap
    y += 120;                    // barcode
    y += 26;                     // gap
    y += 48;                     // footer line
    y += PAD_BOT;
    return Math.ceil(y);
  }

  /* Fit-shrink: the output height is fixed, so when the content is
     taller than the design height, step the item font size down
     (line height and row padding scale proportionally) and re-measure
     until everything fits — never overflow, never clip the tail.
     At full metrics (34px) the fixed blocks take ~1264 design px,
     leaving ~961 for rows at 68px per single-line row, so shrink
     first engages at 15 single-line rows. */
  function fitMetrics(c, model){
    c.setTransform(1, 0, 0, 1, 0, 0); // measureText must run untransformed
    var itemSize = 46;
    while(true){
      var lineH = Math.max(12, Math.round(76 * itemSize / 46));
      var rowPad = Math.max(0, Math.round(22 * itemSize / 46));
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

    // live stats in form
    statCount.textContent = model.count;

    // Fixed output: the canvas bitmap is always exactly 544 x 1121.
    // Content is measured in design space; the fit-shrink pass
    // guarantees it fits the fixed design height, and the leftover
    // slack becomes blank paper directly under the last item row
    // (the tail — separator, ITEM COUNT, card block — sits low as
    // one anchored group at the bottom of the receipt).
    var fit = fitMetrics(ctx, model);
    var H = DESIGN_H;
    var slack = Math.max(0, H - fit.contentH);
    canvas.width = OUT_W;
    canvas.height = OUT_H;

    var c = ctx;
    // draw everything in 1080-design coordinates, scaled to output
    c.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    // paper
    c.globalAlpha = 1;
    c.globalCompositeOperation = 'source-over';
    c.fillStyle = PAPER;
    c.fillRect(0, 0, W, H);

    // crumpled-paper photo texture: cover-fit over the whole paper,
    // multiplied into the white paper so it merges ("nyatu") instead
    // of sitting on top. Text/barcode are drawn after, fully opaque.
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

    /* 1 — MASTHEAD: Len's SIDESTAGE logo image, centred. Drawn with
       multiply so only the black lettering lands on the textured
       paper (no white box). Falls back to the old text title until
       the image has loaded. */
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
    /* two extra blank line-spaces (2 x 44) under the masthead so the
       logo breathes above the order block; comes out of the slack */
    y += 36 + 88;

    /* 2 — ORDER NUMBER + CREATION DATE (template, left-aligned) */
    c.fillStyle = INK; c.globalAlpha = 1; c.textAlign = 'left';
    c.font = '400 48px ' + FONT;
    c.fillText(model.orderText, PAD_X, y + 48);
    y += 60;
    c.font = '400 44px ' + FONT;
    c.fillText(model.createdText, PAD_X, y + 44);
    y += 54 + 44;

    /* 3 — TABLE HEADER */
    dashedLine(c, y); y += 26;
    c.font = '700 46px ' + FONT;
    c.fillStyle = INK; c.globalAlpha = 1;
    c.textAlign = 'left';  c.fillText('QTY', QTY_X, y + 48);
    c.textAlign = 'left';  c.fillText('ITEM', ITEM_X, y + 48);
    c.textAlign = 'right'; c.fillText('DATE', DATE_RIGHT, y + 48);
    y += 64;
    dashedLine(c, y); y += 26;

    /* 4 — CONCERT ROWS */
    c.font = '400 ' + fit.itemSize + 'px ' + FONT;
    var rowBase = Math.round(fit.itemSize * 48 / 46);
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

    /* blank paper: all the min-height slack sits directly under the
       last item row, so the separator + ITEM COUNT + card block form
       one anchored group at the bottom of the receipt */
    y += slack;

    /* separator above totals */
    y += 12;
    dashedLine(c, y); y += 26;

    /* 5 — ITEM COUNT */
    c.font = '400 46px ' + FONT;
    c.fillStyle = INK; c.globalAlpha = 1;
    c.textAlign = 'left';  c.fillText('ITEM COUNT:', QTY_X, y + 50);
    c.textAlign = 'right'; c.fillText(String(model.count), DATE_RIGHT, y + 50);
    y += 70 + 56;

    /* 6 — CARD BLOCK */
    c.font = '400 44px ' + FONT;
    c.textAlign = 'left';
    var cl = cardLines(model);
    cl.forEach(function(ln){
      var ls = wrapWords(c, ln, W - PAD_X*2);
      ls.forEach(function(sub){
        c.fillStyle = INK; c.globalAlpha = 1;
        c.fillText(sub, PAD_X, y + 44);
        y += 64;
      });
    });
    y += 56;

    /* 7 — THANK YOU */
    c.font = '700 50px ' + FONT;
    c.fillStyle = INK; c.globalAlpha = 1; c.textAlign = 'center';
    c.fillText('THANK YOU FOR VISITING!', cx, y + 50);
    y += 68 + 36;

    /* 8 — BARCODE (seeded from order number + auth code + username) */
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
      var barW = 2 + Math.floor(rnd() * 9);      // 2..10
      var gapW = 2 + Math.floor(rnd() * 6);      // 2..7
      if(bx + barW > bcX + bcW) barW = (bcX + bcW) - bx;
      c.fillStyle = INK; c.globalAlpha = 1;
      c.fillRect(bx, y, barW, bcH);
      bx += barW + gapW;
    }
    y += bcH + 26;

    /* 9 — footer: © + title again, small lowercase letterspaced */
    c.font = '400 34px ' + FONT;
    c.fillStyle = INK; c.globalAlpha = 1; c.textAlign = 'center';
    try{ c.letterSpacing = '6px'; }catch(e){}
    c.fillText('© sidestage', cx, y + 34);
    try{ c.letterSpacing = '0px'; }catch(e){}
  }

  /* ---------- events ---------- */
  var formPanel = document.querySelector('.panel');
  formPanel.addEventListener('input', draw);
  formPanel.addEventListener('change', draw);

  function doDownload(){
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
    elUsername.value = '';
    setRows(DEFAULT_ROWS.map(function(d){ return {name:d.name, date:d.date}; }));
    draw();
  }
  /* sticky bottom bar on mobile: appears once the user starts scrolling,
     so it never covers the first form fields at the top of the page */
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

  /* ---------- first draw + fonts ---------- */
  draw();
  if(document.fonts && document.fonts.load){
    Promise.all([
      document.fonts.load('700 76px "Hypermarket"'),
      document.fonts.load('400 34px "Hypermarket"'),
      document.fonts.load('700 38px "Hypermarket"')
    ]).then(function(){ draw(); }).catch(function(){});
    if(document.fonts.ready){
      document.fonts.ready.then(function(){ draw(); });
    }
  }
})();
</script>`;
