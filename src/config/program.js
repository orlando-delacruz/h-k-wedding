// Public wedding programme content (Section 7, 11, 14-16).
// All of this renders openly on the page. Nothing here is access-controlled:
// anything shipped to the browser is public by definition.
// Map links, story text, and photos are placeholders until the owner supplies
// the real assets (see docs/07-assets-todo.md). Never invent replacements.

export const PROGRAM = {
  // The couple's story. Replaced when they supply their own text (docs/07).
  story: `Two souls, two paths, one promise. From quiet mornings to loud laughter with friends, every small moment led here. Through distance and doubt, kindness won. Now, before family and God, we choose each other — today, tomorrow, always.`,

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
    // The couple's timeline image goes here (docs/07); the block is hidden until
    // a URL exists, so the page never shows an empty placeholder.
    timeline: null,

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
