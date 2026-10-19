// Public wedding programme content (Section 7, 11, 14-16).
// All of this renders openly on the page. Nothing here is access-controlled:
// anything shipped to the browser is public by definition.
// Map links, story text, and photos are placeholders until the owner supplies
// the real assets (see docs/07-assets-todo.md). Never invent replacements.

export const PROGRAM = {
  // The couple's own story, as they wrote it (docs/03). Their words, their
  // order, their details — never paraphrased into something else.
  story: `Nagkakilala kami sa isang Leadership Training. Pareho kaming graduating students by that time. Napansin ko sya because he was the host back then and I find him interesting in a way, but the catch here is he followed my social media accounts without me knowing na siya yun.

We started talking sa Instagram — he replied to my "note" regarding sa event na nangyari, and nag tuloy-tuloy na yun, and we started na magkita. Our first meet was in the school's library, and after that lagi na kaming magkasama sa school, personal na lakad, and everything in between.

Fast forward — we are currently 2 years and 11 months in, before we finally tie the knot.`,

  // Public invitation already names the venues; full addresses and map links
  // live here. Map URLs are provisional until the owner supplies official links.
  venues: [
    {
      id: 'ceremony',
      title: 'Wedding Ceremony Venue',
      name: 'Girasoles Farm Candelaria',
      address: 'Girasoles Farm, Candelaria, Quezon, Philippines',
      mapLink: 'https://www.google.com/maps?q=Girasoles+Farm+Candelaria+Quezon+Philippines',
      mapEmbed: 'https://www.google.com/maps?q=Girasoles+Farm+Candelaria+Quezon+Philippines&output=embed',
    },
    {
      id: 'reception',
      title: 'Reception Venue',
      name: "Bride's Residence Sittio Bibingkahan Concepcion Uno Sariaya Quezon",
      address: "Bride's Residence, Sitio Bibingkahan, Concepcion Uno, Sariaya, Quezon, Philippines",
      mapLink: 'https://www.google.com/maps?q=Sitio+Bibingkahan+Concepcion+Uno+Sariaya+Quezon+Philippines',
      mapEmbed: 'https://www.google.com/maps?q=Sitio+Bibingkahan+Concepcion+Uno+Sariaya+Quezon+Philippines&output=embed',
    },
  ],

  // Programme outline. Only the ceremony time is confirmed; everything else stays
  // deliberately vague until the couple supplies the final timeline image.
  stages: [
    { time: '6:30 AM', title: 'Ceremony', detail: 'Girasoles Farm, Candelaria, Quezon' },
    { time: 'To follow', title: 'Reception', detail: "Bride's Residence, Sitio Bibingkahan, Concepcion Uno, Sariaya, Quezon" },
  ],

  // Photos remain placeholder URLs; the couple supplies the real set later.
  photos: {
    // The couple's pre-wedding photoshoot, used twice: the film strip in Our
    // Story and the closing slideshow. Same files, same order — portraits first,
    // then the landscape frames (the slideshow and strip are 4:5 frames, so the
    // portraits sit in them best). Web-sized copies; originals in
    // `assets-originals/photoshoot/` (docs/07).
    strip: [
      '/images/photoshoot/0A4A7953.jpg',
      '/images/photoshoot/0A4A7685.jpg',
      '/images/photoshoot/0A4A7691.jpg',
      '/images/photoshoot/0A4A8120.jpg',
      '/images/photoshoot/0A4A8940.jpg',
      '/images/photoshoot/0A4A8578.jpg',
      '/images/photoshoot/0A4A8953.jpg',
    ],
    slideshow: [
      '/images/photoshoot/0A4A7953.jpg',
      '/images/photoshoot/0A4A7685.jpg',
      '/images/photoshoot/0A4A7691.jpg',
      '/images/photoshoot/0A4A8120.jpg',
      '/images/photoshoot/0A4A8940.jpg',
      '/images/photoshoot/0A4A8578.jpg',
      '/images/photoshoot/0A4A8953.jpg',
    ],
    // The couple's attire guide sheet (docs/07): eight looks in one image, so
    // it is shown whole — the frame must never crop it.
    attireGuide: '/images/attire/attire.jpg',
    // The couple's timeline image (docs/07): one wide strip, 2048×683 (3:1).
    // Shown whole — the frame must never crop it.
    timeline: '/images/wedding-timeline.jpg',

    // The photo that closes the Programme section (the couple's own shot,
    // docs/07). Empty until they supply it — swap the URL only. No stock
    // substitute is shown in its place, so a guest never sees a photo that is
    // not theirs; the gold frame and its sweep appear the moment a URL exists.
    programme: '',

    // The couple's gift QR codes under the Gift Guide copy: GCash first, then
    // the two bank accounts. Local files in `public/images/gift-qr/`, served as
    // `/images/gift-qr/...` — swap a path (or add an entry) without code
    // changes. The label is printed under each code, so a guest knows which is
    // which before scanning. Every code is shown whole and uncropped, with the
    // frame's light sweep kept off the modules, so it stays scannable.
    giftQr: [
      { label: 'GCash', src: '/images/gift-qr/gcash.jpg' },
      { label: 'China Bank', src: '/images/gift-qr/chinabank.jpg' },
      { label: 'Mari Bank', src: '/images/gift-qr/maribank.jpg' },
    ],
  },

  hashtag: '#NaKHATitiyakNaKayHARTH',
}

// Soft copies and printed cards the couple can hand to guests (docs/07).
// Files live in public/images/ and are served as-is: swap a path, not a name.
export const DOWNLOADS = {
  // The two program leaves (ceremony + reception).
  programs: [
    { label: 'Wedding Ceremony Program', file: 'wedding-ceremony', src: '/images/program/wedding-ceremony.jpg' },
    { label: 'Wedding Reception Program', file: 'wedding-reception', src: '/images/program/wedding-reception.jpg' },
  ],
  // The printed invitation set, in order: cover, invitation, entourage,
  // sponsors, details, guest attire + timeline, gift guide + reminder, QR back.
  invitations: [
    { label: 'Invitation — Cover', file: 'invitation-1-cover', src: '/images/invitation/image-1.jpg' },
    { label: 'Invitation — Main Card', file: 'invitation-2-main', src: '/images/invitation/image-2.jpg' },
    { label: 'Invitation — Entourage & Principal Sponsors', file: 'invitation-3-entourage', src: '/images/invitation/image-3.jpg' },
    { label: 'Invitation — Secondary Sponsors & Bearers', file: 'invitation-4-sponsors', src: '/images/invitation/image-4.jpg' },
    { label: 'Invitation — Entourage Attire', file: 'invitation-5-entourage-attire', src: '/images/invitation/image-5.jpg' },
    { label: 'Invitation — Guest Attire & Timeline', file: 'invitation-6-guest-attire', src: '/images/invitation/image-6.jpg' },
    { label: 'Invitation — Gift Guide & Reminder', file: 'invitation-7-gift-reminder', src: '/images/invitation/image-7.jpg' },
    { label: 'Invitation — Venue Map (QR)', file: 'invitation-8-map', src: '/images/invitation/image-8.jpg' },
  ],
}
