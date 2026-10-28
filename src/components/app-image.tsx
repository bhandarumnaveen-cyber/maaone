/* Screens of the Maa One app, built into public/images by scripts/build-images.mjs. */


const images = {
  "laptop-crm": {
    widths: [480, 640, 960, 1440],
    ratio: 1440 / 953,
    alt: "Maa One dashboard on a laptop: leads this month, average reply time, conversion rate, revenue won, leads by day and by source, and the sales pipeline",
  },
  "phone-ai-draft": {
    widths: [320, 480, 640],
    ratio: 640 / 1209,
    alt: "A WhatsApp enquiry in Maa One with an AI reply drafted in Hinglish, ready to send or edit",
  },
  "phone-home": {
    widths: [320, 480, 640],
    ratio: 640 / 1203,
    alt: "Maa One home screen: leads today, unanswered messages, hot leads waiting and follow-ups due",
  },
  "phone-inbox": {
    widths: [320, 480, 640],
    ratio: 640 / 1220,
    alt: "Maa One inbox with WhatsApp and website leads marked hot, warm or cold",
  },
  "phone-invoice": {
    widths: [320, 480, 640],
    ratio: 640 / 1223,
    alt: "A GST invoice in Maa One with buttons to send it on WhatsApp or share a UPI payment link",
  },
  "phone-technician": {
    widths: [320, 480, 640],
    ratio: 640 / 1301,
    alt: "Maa One technician app: today's jobs with checklist, job photos and customer signature",
  },
} as const;

export type AppImageName = keyof typeof images;

/**
 * Responsive app screenshot. `sizes` should match the rendered width so the browser
 * picks the smallest file; `priority` loads it eagerly (above the fold).
 */
export function AppImage({
  name,
  sizes,
  className,
  priority,
  alt,
}: {
  name: AppImageName;
  sizes: string;
  className?: string;
  priority?: boolean;
  alt?: string;
}) {
  const img = images[name];
  const largest = img.widths[img.widths.length - 1];
  const srcSet = img.widths.map((w) => `/images/${name}-${w}.webp ${w}w`).join(", ");
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/images/${name}-${img.widths[1]}.webp`}
      srcSet={srcSet}
      sizes={sizes}
      width={largest}
      height={Math.round(largest / img.ratio)}
      alt={alt ?? img.alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={className}
    />
  );
}
