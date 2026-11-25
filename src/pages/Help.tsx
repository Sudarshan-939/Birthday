import React from 'react';
import { Header, Footer } from './common';

const QA: [string, string][] = [
  ['Is it really free?', 'Yes. Every template, every piece, every sticker, the songs, the seal-until-a-date lock, secret words, your own song, the QR code and editing later are all free. There are no ads, no popups and no watermark.'],
  ['Do I need an account?', 'No. Your gifts save in this browser as you work. Open "My gifts" to edit any of them later. If you switch devices, use "Backup all" and restore the file on the new device.'],
  ['How do I send it?', 'Press Share in the editor. You get a link to paste into WhatsApp, Instagram, SMS or email, and a QR code to print or put on a card. If the site has storage set up, the link is short. If not, the whole gift travels inside the link itself, so it still works without a server.'],
  ['Can I send it as a file?', 'Yes. "Download as a file" saves one HTML file that has the whole gift inside, photos and music included. It opens in any browser, even offline. Send it on WhatsApp or put it on a pen drive.'],
  ['Can I lock it until their birthday?', 'Yes. In the editor go to Settings, then Seal. Pick a date and time. Until then they see a countdown with your note. You can also add a secret word with a hint.'],
  ['Can I use my own song?', 'Yes. Upload any audio file under Music. There are also 9 original tracks generated in the browser, and you can record a voice note on any voice-note piece.'],
  ['I shared it and then changed something', 'Open it from My gifts, make your change, and press Share again. Short links update in place, so the link they already have shows the new version (only from the device you made it on, which holds the private edit key). Links that carry the gift inside them always show the version from when you copied them.'],
  ['What about privacy?', 'Nothing leaves your browser until you press Share. Then only the gift itself is stored so the link works. There is no tracking and no analytics.'],
  ['My link is very long', 'Gifts with lots of photos make long links when there is no server storage. Use "Download as a file", or use the "smaller link" option, which shrinks the photos.'],
];

export default function Help() {
  return (
    <div className="site">
      <Header />
      <section className="block narrow">
        <div className="block-head"><span className="pill">Help</span><h1>Questions, <em>answered</em></h1></div>
        <div className="faq">{QA.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
      </section>
      <Footer />
    </div>
  );
}
