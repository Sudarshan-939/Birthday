import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import type { Gift } from '../lib/types';
import { uploadGift, dataLink, liteLink, exportHtml } from '../lib/share';

const QR_MAX = 2300; // longest link that still makes a scannable QR

export default function SharePanel({ gift, onClose, onPlay, onShared }: { gift: Gift; onClose: () => void; onPlay: () => void; onShared?: (s: { id: string; key: string }) => void }) {
  const [link, setLink] = useState('');
  const [kind, setKind] = useState<'short' | 'data' | 'lite' | ''>('');
  const [busy, setBusy] = useState(true);
  const [qr, setQr] = useState('');
  const [copied, setCopied] = useState(false);
  const [dl, setDl] = useState(false);
  const [updated, setUpdated] = useState(false);

  const make = async () => {
    setBusy(true); setCopied(false);
    const short = await uploadGift(gift);
    if (short) { setLink(short.url); setKind('short'); setUpdated(short.updated); if (!short.updated) onShared?.(short.share); } else { setLink(dataLink(gift)); setKind('data'); }
    setBusy(false);
  };
  useEffect(() => { make(); }, []);
  useEffect(() => {
    if (!link || link.length > QR_MAX) { setQr(''); return; }
    QRCode.toDataURL(link, { margin: 1, width: 520, errorCorrectionLevel: 'L', color: { dark: '#2b1d1d', light: '#ffffff' } }).then(setQr).catch(() => setQr(''));
  }, [link]);

  const smaller = async () => { setBusy(true); setLink(await liteLink(gift)); setKind('lite'); setBusy(false); };
  const copy = async () => { try { await navigator.clipboard.writeText(link); } catch { const t = document.createElement('textarea'); t.value = link; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); } setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const msg = `I made something for you, ${gift.to} 💝`;
  const native = () => (navigator as any).share?.({ title: gift.title, text: msg, url: link }).catch(() => {});
  const download = async () => { setDl(true); try { await exportHtml(gift); } catch { alert('Could not build the file here. Try again from the published site.'); } setDl(false); };
  const qrDownload = () => { const a = document.createElement('a'); a.href = qr; a.download = `gift-for-${gift.to}-qr.png`.replace(/\s+/g, '-'); a.click(); };
  const kb = Math.round(link.length / 1024);
  const sealed = gift.lock?.until && new Date(gift.lock.until).getTime() > Date.now();

  return (
    <div className="modal-back" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal share-modal">
        <button className="x" onClick={onClose}>✕</button>
        <h2>Send it to {gift.to} 💌</h2>
        <p className="muted">Free. No sign-up. {sealed ? `It stays sealed until ${new Date(gift.lock!.until!).toLocaleString('en', { dateStyle: 'medium', timeStyle: 'short' })}.` : 'They can open it straight away.'}{gift.lock?.password ? ' They\'ll need your secret word.' : ''}</p>
        {busy ? <div className="center-msg small"><div className="spinner" />Making your link…</div> : <>
          <div className="link-box"><input readOnly value={link} onFocus={(e) => e.target.select()} /><button className="btn small" onClick={copy}>{copied ? '✓ Copied' : 'Copy'}</button></div>
          <small className="muted">{kind === 'short' ? (updated ? '✓ Same link as before, now showing your latest edits. Anyone who already has it will see the new version.' : 'Short link. Edit any time later from My gifts and press Share again. This same link updates for them.') : kind === 'lite' ? `Smaller link with lighter photos (${kb} KB).` : `The whole gift travels inside this link (${kb} KB), so it works without any account or server. Your current version is what they'll see.`}</small>
          {kind === 'data' && link.length > 6000 && <div className="warn">This link is long because of your photos{gift.music?.custom ? ' and song' : ''}. Some apps cut long links. <button className="link" onClick={smaller}>Make a smaller link</button> or download the gift as a file below.</div>}
          <div className="share-btns">
            <a className="sb wa" href={`https://wa.me/?text=${encodeURIComponent(msg + '\n' + link)}`} target="_blank" rel="noreferrer">WhatsApp</a>
            <a className="sb tg" href={`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(msg)}`} target="_blank" rel="noreferrer">Telegram</a>
            <a className="sb em" href={`mailto:?subject=${encodeURIComponent(gift.title)}&body=${encodeURIComponent(msg + '\n\n' + link)}`}>Email</a>
            <a className="sb sms" href={`sms:?&body=${encodeURIComponent(msg + ' ' + link)}`}>SMS</a>
            {'share' in navigator && <button className="sb more" onClick={native}>More…</button>}
          </div>
          <div className="share-grid">
            <div className="qr-box">
              <b>QR code <span className="free">free</span></b>
              {qr ? <><img src={qr} alt="QR code" /><button className="btn ghost small" onClick={qrDownload}>⬇ Download QR</button><small>Print it on a card, a cake topper or a photo frame.</small></> : <small>This link is too long for a QR code. {kind !== 'lite' && <button className="link" onClick={smaller}>Try a smaller link</button>}{kind === 'lite' && 'Use the file download instead, or deploy with storage for short links.'}</small>}
            </div>
            <div className="other-box">
              <b>Other ways</b>
              <button className="add-row" onClick={download}>{dl ? 'Building…' : '⬇ Download as a file (.html)'}</button>
              <small>One file with everything inside, photos and music too. It opens in any browser, even offline.</small>
              <button className="add-row" onClick={onPlay}>▶ Play it from the start</button>
              <a className="add-row" href={link} target="_blank" rel="noreferrer">↗ Open the link like they will</a>
              <button className="add-row" onClick={make}>↻ Make a fresh link</button>
            </div>
          </div>
        </>}
      </div>
    </div>
  );
}
