import React, { useEffect, useRef, useState } from 'react';
import { PieceDef, F, Hint, Btn, Para, Img, demoPhotos, DEMO } from './core';
import { sfx } from '../lib/audio';
import { confetti, hearts } from '../lib/fx';
import { lines } from '../lib/util';

// ------------------------------------------------------------------ 3D Museum (three.js)
function Museum({ p }: { p: any }) {
  const host = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<{ src: string; caption?: string } | null>(null);
  const [letter, setLetter] = useState(false);
  const [ready, setReady] = useState(false);
  const [full, setFull] = useState(false);
  const [no3d, setNo3d] = useState(false);
  const ctl = useRef({ fwd: 0, turn: 0, tour: false });

  useEffect(() => {
    let disposed = false; let cleanup = () => {};
    import('three').then((THREE) => {
      if (disposed || !host.current) return;
      const el = host.current; const W = () => el.clientWidth, H = () => el.clientHeight;
      let renderer: any;
      try { renderer = new THREE.WebGLRenderer({ antialias: true }); if (!renderer.getContext()) throw new Error('no gl'); } catch { setNo3d(true); return; }
      renderer.setPixelRatio(Math.min(2, devicePixelRatio)); renderer.setSize(W(), H()); renderer.shadowMap.enabled = true;
      el.appendChild(renderer.domElement);
      const scene = new THREE.Scene(); scene.background = new THREE.Color('#1a1418'); scene.fog = new THREE.Fog('#1a1418', 10, 46);
      const cam = new THREE.PerspectiveCamera(65, W() / H(), 0.1, 100);
      const photos = (p.photos || []).length ? p.photos : demoPhotos(4);
      const spacing = 4.2, pairs = Math.ceil(photos.length / 2), L = Math.max(16, pairs * spacing + 10), Wd = 8, Hh = 5;
      const css = getComputedStyle(el);
      const wallCol = new THREE.Color(p.wall || '#efe4d6'), accent = new THREE.Color(css.getPropertyValue('--accent').trim() || '#d9506b');
      const mat = (c: any, r = 0.9) => new THREE.MeshStandardMaterial({ color: c, roughness: r });
      // floor (checker wood), walls, ceiling
      const fc = document.createElement('canvas'); fc.width = fc.height = 256; const fg = fc.getContext('2d')!;
      for (let i = 0; i < 8; i++) { fg.fillStyle = i % 2 ? '#7a5034' : '#8a5d3d'; fg.fillRect(0, i * 32, 256, 32); fg.fillStyle = '#00000022'; fg.fillRect(((i * 97) % 256), i * 32, 2, 32); }
      const ft = new THREE.CanvasTexture(fc); ft.wrapS = ft.wrapT = THREE.RepeatWrapping; ft.repeat.set(2, L / 4); ft.colorSpace = THREE.SRGBColorSpace;
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(Wd, L), new THREE.MeshStandardMaterial({ map: ft, roughness: 0.6 })); floor.rotation.x = -Math.PI / 2; floor.position.z = -L / 2 + 2; floor.receiveShadow = true; scene.add(floor);
      const ceil = new THREE.Mesh(new THREE.PlaneGeometry(Wd, L), mat('#f6f1ea')); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, Hh, -L / 2 + 2); scene.add(ceil);
      const wallG = new THREE.PlaneGeometry(L, Hh);
      const lw = new THREE.Mesh(wallG, mat(wallCol)); lw.rotation.y = Math.PI / 2; lw.position.set(-Wd / 2, Hh / 2, -L / 2 + 2); lw.receiveShadow = true; scene.add(lw);
      const rw = new THREE.Mesh(wallG, mat(wallCol)); rw.rotation.y = -Math.PI / 2; rw.position.set(Wd / 2, Hh / 2, -L / 2 + 2); rw.receiveShadow = true; scene.add(rw);
      const ew = new THREE.Mesh(new THREE.PlaneGeometry(Wd, Hh), mat(wallCol)); ew.position.set(0, Hh / 2, -L + 2); scene.add(ew);
      const bw = new THREE.Mesh(new THREE.PlaneGeometry(Wd, Hh), mat(wallCol)); bw.rotation.y = Math.PI; bw.position.set(0, Hh / 2, 2); scene.add(bw);
      // skirting + rope line
      [-1, 1].forEach((s) => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.25, L), mat('#5a3b2a')); b.position.set(s * (Wd / 2 - 0.03), 0.12, -L / 2 + 2); scene.add(b); });
      scene.add(new THREE.HemisphereLight('#fff6ea', '#4a3428', 0.75));
      // title on the entrance wall
      const textTex = (txt: string, sub: string, w = 1024, h = 512, color = '#3b2a2a') => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d')!; g.fillStyle = color; g.textAlign = 'center'; g.font = 'bold 84px Georgia, serif'; g.fillText(txt, w / 2, h / 2 - 10); g.font = 'italic 44px Georgia, serif'; g.fillText(sub, w / 2, h / 2 + 70); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
      const title = new THREE.Mesh(new THREE.PlaneGeometry(5, 2.5), new THREE.MeshBasicMaterial({ map: textTex(p.title || 'The Museum of Us', p.subtitle || 'est. the day we met'), transparent: true }));
      title.position.set(0, 3.1, -L + 2.02); // on far wall above letter
      scene.add(title);
      const clickables: any[] = [];
      const loader = new THREE.TextureLoader();
      photos.forEach((ph: any, i: number) => {
        const side = i % 2 ? 1 : -1; const z = -2 - Math.floor(i / 2) * spacing - (side > 0 ? spacing / 2 : 0);
        const g = new THREE.Group(); g.position.set(side * (Wd / 2 - 0.06), 2.2, z); g.rotation.y = -side * Math.PI / 2;
        const frame = new THREE.Mesh(new THREE.BoxGeometry(2.3, 2.8, 0.1), new THREE.MeshStandardMaterial({ color: '#b8893c', metalness: 0.6, roughness: 0.35 })); frame.castShadow = true; g.add(frame);
        const pic = new THREE.Mesh(new THREE.PlaneGeometry(2, 2.5), new THREE.MeshStandardMaterial({ color: '#ddd', roughness: 0.8 })); pic.position.z = 0.06; g.add(pic);
        loader.load(ph.src, (t) => { t.colorSpace = THREE.SRGBColorSpace; (pic.material as any).map = t; (pic.material as any).color.set('#ffffff'); (pic.material as any).needsUpdate = true;
          const ar = (t.image.width / t.image.height) || 0.8; const h = 2.5, w = Math.min(2.6, h * ar); pic.scale.set(w / 2, 1, 1); frame.scale.set((w + 0.3) / 2.3, 1, 1); });
        if (ph.caption) { const plq = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.35), new THREE.MeshBasicMaterial({ map: textTex(ph.caption.slice(0, 26), '', 1024, 256, '#2a1d1d'), transparent: true })); plq.position.set(0, -1.75, 0.02); const bg = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.42), mat('#f9f3e8')); bg.position.set(0, -1.75, 0.01); g.add(bg); g.add(plq); }
        const spot = new THREE.SpotLight('#fff1d6', 18, 7, 0.55, 0.6); spot.position.set(-side * 1.2, 2.6, 0.8); spot.target = pic; g.add(spot);
        pic.userData = { photo: ph }; clickables.push(pic);
        scene.add(g);
      });
      // letter pedestal at the end
      const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 1.1, 32), mat('#f4ece2', 0.5)); ped.position.set(0, 0.55, -L + 4); ped.castShadow = true; scene.add(ped);
      const env = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.05, 0.55), new THREE.MeshStandardMaterial({ color: '#fff', emissive: accent, emissiveIntensity: 0.25 })); env.position.set(0, 1.2, -L + 4); env.userData = { letter: true }; scene.add(env); clickables.push(env);
      const heartLight = new THREE.PointLight(accent, 6, 6); heartLight.position.set(0, 2, -L + 4); scene.add(heartLight);
      for (let z = 0; z > -L + 2; z -= 5) { const l = new THREE.PointLight('#ffe9c9', 4, 9); l.position.set(0, Hh - 0.3, z); scene.add(l); const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.08), new THREE.MeshBasicMaterial({ color: '#fff4d6' })); bulb.position.copy(l.position); scene.add(bulb); }
      // controls
      let yaw = 0, pitch = 0, pos = new THREE.Vector3(0, 1.65, 0.5);
      const keys: Record<string, boolean> = {};
      const kd = (e: KeyboardEvent) => { keys[e.key.toLowerCase()] = true; }, ku = (e: KeyboardEvent) => { keys[e.key.toLowerCase()] = false; };
      addEventListener('keydown', kd); addEventListener('keyup', ku);
      let drag: { x: number; y: number; moved: boolean } | null = null;
      const cv = renderer.domElement; cv.style.touchAction = 'none';
      cv.onpointerdown = (e) => { drag = { x: e.clientX, y: e.clientY, moved: false }; cv.setPointerCapture(e.pointerId); ctl.current.tour = false; };
      cv.onpointermove = (e) => { if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true; yaw -= dx * 0.005; pitch = Math.max(-0.6, Math.min(0.6, pitch - dy * 0.004)); drag.x = e.clientX; drag.y = e.clientY; };
      cv.onpointerup = (e) => {
        if (drag && !drag.moved) { const r = cv.getBoundingClientRect(); const ray = new THREE.Raycaster(); ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), cam);
          const hit = ray.intersectObjects(clickables)[0]; if (hit) { const u = hit.object.userData; sfx('open'); if (u.letter) { setLetter(true); hearts(); } else if (u.photo) setZoom(u.photo); } }
        drag = null; };
      let raf = 0, last = performance.now(), tourT = 0;
      const loop = (t: number) => {
        const dt = Math.min(0.05, (t - last) / 1000); last = t;
        let f = ctl.current.fwd + (keys['w'] || keys['arrowup'] ? 1 : 0) - (keys['s'] || keys['arrowdown'] ? 1 : 0);
        let tr = ctl.current.turn + (keys['a'] || keys['arrowleft'] ? 1 : 0) - (keys['d'] || keys['arrowright'] ? 1 : 0);
        if (ctl.current.tour) { tourT += dt; f = 0.55; tr = 0; yaw = Math.sin(tourT * 0.6) * 0.9; if (pos.z < -L + 6) { ctl.current.tour = false; yaw = 0; } }
        yaw += tr * dt * 1.6;
        pos.x += -Math.sin(yaw) * f * dt * 3; pos.z += -Math.cos(yaw) * f * dt * 3;
        pos.x = Math.max(-Wd / 2 + 0.6, Math.min(Wd / 2 - 0.6, pos.x)); pos.z = Math.max(-L + 5, Math.min(1.2, pos.z));
        cam.position.copy(pos); cam.position.y = 1.65 + (Math.abs(f) > 0 ? Math.sin(t / 140) * 0.03 : 0);
        cam.rotation.set(pitch, yaw, 0, 'YXZ');
        env.rotation.y += dt; env.position.y = 1.2 + Math.sin(t / 500) * 0.05;
        renderer.render(scene, cam); raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop); setReady(true);
      const ro = new ResizeObserver(() => { renderer.setSize(W(), H()); cam.aspect = W() / H(); cam.updateProjectionMatrix(); }); ro.observe(el);
      cleanup = () => { cancelAnimationFrame(raf); ro.disconnect(); removeEventListener('keydown', kd); removeEventListener('keyup', ku); renderer.dispose(); el.innerHTML = ''; };
    }).catch(() => setNo3d(true));
    return () => { disposed = true; cleanup(); };
  }, [JSON.stringify(p.photos?.map((x: any) => x.src + x.caption)), p.title, p.subtitle, p.wall]);

  if (no3d) {
    const photos = (p.photos || []).length ? p.photos : demoPhotos(4);
    return (
      <div className="pc-museum flat">
        <div className="flat-title"><b>{p.title}</b><small>{p.subtitle}</small></div>
        <div className="flat-hall">{photos.map((ph: any, i: number) => <figure key={i} onClick={() => { setZoom(ph); sfx('open'); }}><Img src={ph.src} />{ph.caption && <figcaption>{ph.caption}</figcaption>}</figure>)}<button className="flat-letter" onClick={() => { setLetter(true); hearts(); sfx('open'); }}>💌<small>the letter</small></button></div>
        <div className="tip">swipe along the wall · tap a photo · the letter waits at the end</div>
        {zoom && <div className="pc-lightbox" onClick={() => setZoom(null)}><img src={zoom.src} alt="" />{zoom.caption && <div className="lbcap">{zoom.caption}</div>}</div>}
        {letter && <div className="pc-lightbox" onClick={() => setLetter(false)}><div className="pc-letter paper-parchment" onClick={(e) => e.stopPropagation()}><div className="pc-letter-greet">{p.greeting}</div><div className="pc-letter-body"><Para text={p.letter} /></div><div className="pc-letter-sign"><div className="sig">{p.signature}</div></div><Btn ghost onClick={() => setLetter(false)}>Back to the museum</Btn></div></div>}
      </div>
    );
  }
  const hold = (k: 'fwd' | 'turn', v: number) => ({ onPointerDown: () => { ctl.current[k] = v; ctl.current.tour = false; }, onPointerUp: () => (ctl.current[k] = 0), onPointerLeave: () => (ctl.current[k] = 0) });
  return (
    <div className={`pc-museum ${full ? 'full' : ''}`}>
      <div className="stage" ref={host} />
      {!ready && <div className="loading">Opening the museum…</div>}
      <div className="hud-top"><button onClick={() => { ctl.current.tour = true; sfx('tap'); }}>▶ Walk me through</button><button onClick={() => setFull(!full)}>{full ? '✕' : '⛶'}</button></div>
      <div className="pad"><button {...hold('turn', 1)}>◀</button><div><button {...hold('fwd', 1)}>▲</button><button {...hold('fwd', -1)}>▼</button></div><button {...hold('turn', -1)}>▶</button></div>
      <div className="tip">drag to look · arrows / WASD to walk · tap a photo · find the letter at the end</div>
      {zoom && <div className="pc-lightbox" onClick={() => setZoom(null)}><img src={zoom.src} alt="" />{zoom.caption && <div className="lbcap">{zoom.caption}</div>}</div>}
      {letter && <div className="pc-lightbox" onClick={() => setLetter(false)}><div className="pc-letter paper-parchment" onClick={(e) => e.stopPropagation()}><div className="pc-letter-greet">{p.greeting}</div><div className="pc-letter-body"><Para text={p.letter} /></div><div className="pc-letter-sign"><div className="sig">{p.signature}</div></div><Btn ghost onClick={() => setLetter(false)}>Back to the museum</Btn></div></div>}
    </div>
  );
}
const Museum3D: PieceDef = {
  type: 'museum3d', label: '3D museum', icon: '🏛️', cat: 'xp', desc: 'A real 3D museum with your photos on the walls', bare: true,
  fields: [F.t('title', 'Museum name'), F.t('subtitle', 'Under the name'), F.phs('photos', 'Photos on the walls (caption = plaque)', 24), F.c('wall', 'Wall colour'), F.t('greeting', 'Letter greeting'), F.ta('letter', 'The letter at the end'), F.t('signature', 'Signed')],
  defaults: () => ({ title: 'The Museum of Us', subtitle: 'a permanent collection', photos: demoPhotos(4, ['Exhibit A: that laugh', 'Exhibit B: the party', 'Exhibit C: chai & rain', 'Exhibit D: golden hour']), wall: '#efe4d6', greeting: 'Dear {name},', letter: 'Every exhibit in here is a day I got to spend with you. The museum is still open, and I plan to keep adding to it for the rest of my life.', signature: '— curator {sender}' }),
  Render: ({ p }) => <Museum p={p} />,
};

// ------------------------------------------------------------------ 3D photo album
const Album3D: PieceDef = {
  type: 'album3d', label: '3D photo album', icon: '📚', cat: 'xp', desc: 'Turn the pages by hand; photos pop up in 3D', bare: true,
  fields: [F.t('title', 'Album title'), F.t('subtitle', 'On the cover'), F.sel('cover', 'Cover', [['leather', 'Leather'], ['linen', 'Linen'], ['velvet', 'Velvet'], ['kraft', 'Kraft']]), F.phs('photos', 'Photos (caption under each)', 20), F.t('greeting', 'Letter greeting'), F.ta('letter', 'Letter on the last page'), F.t('signature', 'Signed')],
  defaults: () => ({ title: 'Our Album', subtitle: '{name} & {sender}', cover: 'leather', photos: demoPhotos(4, ['the one where we laughed too loud', 'birthday chaos', 'rainy chai date', 'you, glowing']), greeting: 'Dear {name},', letter: 'These are just a few pages. I cannot wait to fill the rest with you.', signature: '{sender}' }),
  Render: ({ p }) => {
    const ps = p.photos || []; const leaves = [{ k: 'cover' }, ...ps.map((ph: any) => ({ k: 'photo', ph })), { k: 'letter' }];
    const [i, setI] = useState(0); const [tilt, setTilt] = useState({ x: 0, y: 0 });
    return (
      <div className={`pc-album cover-${p.cover || 'leather'}`} onPointerMove={(e) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); setTilt({ x: ((e.clientY - r.top) / r.height - 0.5) * -10, y: ((e.clientX - r.left) / r.width - 0.5) * 14 }); }}>
        <div className="book" style={{ transform: `rotateX(${12 + tilt.x}deg) rotateY(${tilt.y}deg)` }}>
          {leaves.map((lf: any, k: number) => (
            <div key={k} className={`leaf ${k < i ? 'turned' : ''} ${k === i ? 'cur' : ''}`} style={{ zIndex: k < i ? k : leaves.length - k }} onClick={() => { sfx('page'); setI(k < i ? k : Math.min(leaves.length - 1, k + 1)); if (k === leaves.length - 2) hearts(); }}>
              <div className="side front">
                {lf.k === 'cover' && <div className="cv"><small>✦</small><b>{p.title}</b><span>{p.subtitle}</span><small>tap to open</small></div>}
                {lf.k === 'photo' && <div className="pg"><div className="popimg"><Img src={lf.ph.src} /></div><div className="cap">{lf.ph.caption}</div><small className="n">{k}</small></div>}
                {lf.k === 'letter' && <div className="pg letter"><b>{p.greeting}</b><Para text={p.letter} /><div className="sig">{p.signature}</div></div>}
              </div>
              <div className="side back"><div className="pg inner">{k === 0 ? <span className="ex">this album belongs to<br /><b>{p.subtitle}</b></span> : <span className="ex">♡</span>}</div></div>
            </div>))}
        </div>
        <Hint>{i === 0 ? 'tap the cover to open' : <>page {i} / {leaves.length - 1} · <a onClick={() => setI(0)}>close the album</a></>}</Hint>
      </div>
    );
  },
};

// ------------------------------------------------------------------ Little World desktop
const Desktop: PieceDef = {
  type: 'desktop', label: 'Little desktop world', icon: '🖥️', cat: 'xp', desc: 'An interactive desktop: memories, a letter, a song, a quiz and a gift', bare: true,
  fields: [F.ph('wallpaper', 'Wallpaper'), F.t('user', 'Login name'), F.phs('photos', 'Memories folder', 12), F.ta('letter', 'letter.txt'), F.t('song', 'Song name'), F.au('audio', 'Song clip (optional)'), F.it('quiz', 'quiz.exe questions', [F.t('q', 'Question'), F.t('a', 'Answer')], 6), F.ta('gift', 'gift.zip message')],
  defaults: () => ({ wallpaper: DEMO(4).src, user: '{name}', photos: demoPhotos(4, ['rooftop', 'party', 'chai', 'beach']), letter: 'Hey you,\n\nI built you a whole little computer because a text felt too small. Click around. Every file is something I love about you.\n\n— {sender}', song: 'our_song.mp3', audio: '', quiz: [{ q: 'Who loves you the most?', a: '{sender}' }, { q: 'Best snack at 2am?', a: 'maggi' }], gift: 'Unzipped: one lifetime subscription to me. No cancellation possible ♡' }),
  Render: ({ p }) => {
    const [win, setWin] = useState<string[]>([]); const [top, setTop] = useState(''); const [qi, setQi] = useState(0); const [qa, setQa] = useState(''); const [giftOpen, setGiftOpen] = useState(false); const [clock, setClock] = useState(new Date()); const au = useRef<HTMLAudioElement | null>(null); const [playing, setPlaying] = useState(false);
    useEffect(() => { const t = setInterval(() => setClock(new Date()), 15000); return () => { clearInterval(t); au.current?.pause(); }; }, []);
    const open = (w: string) => { sfx('open'); setWin((W) => (W.includes(w) ? W : [...W, w])); setTop(w); };
    const close = (w: string) => { sfx('tap'); setWin((W) => W.filter((x) => x !== w)); if (w === 'song') { au.current?.pause(); setPlaying(false); } };
    const icons = [['photos', '🗂️', 'Memories'], ['letter', '📝', 'letter.txt'], ['song', '🎵', p.song || 'song.mp3'], ['quiz', '🧩', 'quiz.exe'], ['gift', '🎁', 'gift.zip']];
    const Q = p.quiz || [];
    const Win = ({ id, title, children }: any) => win.includes(id) ? <div className="win" style={{ zIndex: top === id ? 5 : 2, top: 30 + icons.findIndex((x) => x[0] === id) * 18 + 'px', left: 10 + icons.findIndex((x) => x[0] === id) * 12 + 'px' }} onPointerDown={() => setTop(id)}><div className="bar"><span>{title}</span><button onClick={() => close(id)}>✕</button></div><div className="body">{children}</div></div> : null;
    return (
      <div className="pc-desktop" style={{ backgroundImage: p.wallpaper ? `url(${p.wallpaper})` : undefined }}>
        <div className="icons">{icons.map(([id, ic, lb]) => <button key={id} onClick={() => open(id)}><span>{ic}</span><small>{lb}</small></button>)}</div>
        <Win id="photos" title="Memories"><div className="ph">{(p.photos || []).map((x: any, i: number) => <figure key={i}><Img src={x.src} /><figcaption>{x.caption}</figcaption></figure>)}</div></Win>
        <Win id="letter" title="letter.txt — Notepad"><div className="txt"><Para text={p.letter} /></div></Win>
        <Win id="song" title="Music Player"><div className="mp"><div className={`disc ${playing ? 'spin' : ''}`}>💿</div><b>{p.song}</b><button className="pc-btn" onClick={() => { if (p.audio) { if (!au.current) au.current = new Audio(p.audio); playing ? au.current.pause() : au.current.play(); } setPlaying(!playing); }}>{playing ? '❚❚ Pause' : '▶ Play'}</button></div></Win>
        <Win id="quiz" title="quiz.exe">{qi < Q.length ? <div className="qz"><b>{Q[qi].q}</b><input value={qa} onChange={(e) => setQa(e.target.value)} placeholder="type answer" onKeyDown={(e) => { if (e.key === 'Enter') { if (qa.trim().toLowerCase() === String(Q[qi].a).toLowerCase()) { setQi(qi + 1); setQa(''); sfx('win'); } else sfx('tap'); } }} /><small>press Enter · answer: {Q[qi].a.length} letters</small></div> : <div className="qz"><b>All correct! 🎉</b><small>You know me too well.</small></div>}</Win>
        <Win id="gift" title="gift.zip">{!giftOpen ? <div className="gz"><span>🎁</span><button className="pc-btn" onClick={(e) => { setGiftOpen(true); sfx('win'); confetti(e.currentTarget); }}>Extract all</button></div> : <div className="gz"><Para text={p.gift} /></div>}</Win>
        <div className="task"><span>♥ {p.user}</span><span>{clock.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}</span></div>
      </div>
    );
  },
};

// ------------------------------------------------------------------ Story book (Love Story Book reader)
const StoryBook: PieceDef = {
  type: 'storybook', label: 'Story book', icon: '📕', cat: 'xp', desc: 'A whole designed book about you two — read it or save as PDF', bare: true,
  fields: [F.t('title', 'Book title'), F.t('subtitle', 'Subtitle'), F.sel('design', 'Design', [['classic', 'Romantic classic'], ['blush', 'Dreamy blush'], ['midnight', 'Midnight stars'], ['vintage', 'Vintage journal']]), F.ph('coverPhoto', 'Cover photo'), F.it('chapters', 'Chapters', [F.t('title', 'Chapter title'), F.ta('text', 'Chapter text'), F.ph('photo', 'Photo (optional)')], 60), F.s('reasons', 'Reasons I love you (last chapter)', 100), F.ta('letter', 'Closing letter')],
  defaults: () => ({ title: 'The Story of {name} & {sender}', subtitle: 'a true story, mostly', design: 'classic', coverPhoto: DEMO(1).src, chapters: [
    { title: 'The first hello', text: 'It started like most great stories do: by accident. Nobody planned it, and yet it felt like it had been waiting for us.', photo: '' },
    { title: 'Falling, slowly', text: 'Then came the long talks, the bad jokes, the way time disappeared whenever we were together.', photo: DEMO(3).src },
    { title: 'Us, now', text: 'And now here we are. Still laughing, still choosing each other, still writing it one page at a time.', photo: DEMO(4).src }], reasons: ['your laugh', 'your kindness', 'how you hold my hand'], letter: 'Thank you for being my favourite story.\n\nLove, {sender}' }),
  Render: ({ p, ctx }) => {
    const pages: React.ReactNode[] = [];
    pages.push(<div className="sb-cover">{p.coverPhoto && <Img src={p.coverPhoto} />}<div className="t"><b>{p.title}</b><small>{p.subtitle}</small></div></div>);
    pages.push(<div className="sb-page center"><small>this book belongs to</small><b className="big">{ctx.name}</b><small>written with love</small></div>);
    (p.chapters || []).forEach((c: any, i: number) => {
      pages.push(<div className="sb-page"><small className="ch">Chapter {i + 1}</small><h4>{c.title}</h4>{c.photo && <Img src={c.photo} />}<Para text={c.text} /></div>);
    });
    if ((p.reasons || []).length) pages.push(<div className="sb-page"><small className="ch">The last chapter</small><h4>{p.reasons.length} reasons I love you</h4><ol className="sb-reasons">{p.reasons.map((r: string, i: number) => <li key={i}>{r}</li>)}</ol></div>);
    pages.push(<div className="sb-page letter"><Para text={p.letter} /><div className="fin">♡ The End ♡</div></div>);
    const [i, setI] = useState(0); const total = pages.length;
    return (
      <div className={`pc-storybook design-${p.design || 'classic'}`}>
        <div className="sb-view">{pages.map((pg, k) => <div key={k} className={`sb-leaf ${k < i ? 'gone' : k === i ? 'cur' : 'next'}`} onClick={() => { if (k === i && i < total - 1) { setI(i + 1); sfx('page'); } }}>{pg}<span className="pn">{k > 0 ? k : ''}</span></div>)}</div>
        <div className="sb-nav"><button onClick={() => { setI(Math.max(0, i - 1)); sfx('page'); }} disabled={i === 0}>‹ Back</button><span>{i + 1} / {total}</span><button onClick={() => { setI(Math.min(total - 1, i + 1)); sfx('page'); }} disabled={i >= total - 1}>Next ›</button></div>
        <div className="sb-tools"><button className="pc-btn ghost" onClick={() => { document.body.classList.add('print-book'); setTimeout(() => { window.print(); document.body.classList.remove('print-book'); }, 100); }}>⬇ Save as PDF / print</button></div>
        <div className="sb-print">{pages.map((pg, k) => <div key={k} className="sb-print-page">{pg}</div>)}</div>
      </div>
    );
  },
};

export const XP: PieceDef[] = [Museum3D, Album3D, Desktop, StoryBook];
