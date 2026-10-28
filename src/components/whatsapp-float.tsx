import { WhatsAppIcon } from "./icons";

/** Floating "Chat on WhatsApp" button for every marketing page. */
export function WhatsAppFloat({ href }: { href: string }) {
  const link = `${href}?text=${encodeURIComponent("Namaste! I'd like to know more about Maa One.")}`;
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Maa One on WhatsApp"
      className="group fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-full bg-[#0E7A3E] p-3.5 text-white shadow-xl shadow-emerald-900/30 transition-transform hover:-translate-y-0.5 hover:bg-[#0B6532] sm:right-6 sm:bottom-6 sm:px-5"
    >
      <WhatsAppIcon className="h-6 w-6" />
      <span className="hidden text-sm font-semibold sm:inline">Chat with us</span>
    </a>
  );
}
