"use client";

import { usePathname } from "next/navigation";
import { WA_GREETING, hasWhatsApp, waLink } from "@/lib/whatsapp";

/** Floating "ping us on WhatsApp" button, on every page once a number is set. */
export function WhatsAppButton() {
  const pathname = usePathname();
  if (!hasWhatsApp) return null;
  const text = pathname === "/quote" ? WA_GREETING : `${WA_GREETING} (from ${pathname})`;
  return (
    <a
      href={waLink(text)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Sri Divya Enterprises on WhatsApp"
      className="wa-fab"
    >
      <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true" fill="currentColor">
        <path d="M16.04 3C9.4 3 4 8.36 4 14.97c0 2.34.68 4.6 1.97 6.55L4 29l7.7-1.98a12.1 12.1 0 0 0 4.34.8C22.68 27.82 28 22.46 28 15.85 28 9.24 22.68 3 16.04 3Zm0 22.6c-1.4 0-2.77-.3-4.03-.86l-.29-.13-4.57 1.18 1.22-4.42-.19-.3a9.86 9.86 0 0 1-1.55-5.3c0-5.47 4.47-9.91 9.42-9.91 5.43 0 9.71 4.92 9.71 9.99 0 5.5-4.36 9.75-9.72 9.75Zm5.33-7.37c-.29-.15-1.73-.85-2-.95-.27-.1-.47-.15-.66.15-.2.29-.76.94-.93 1.13-.17.2-.34.22-.63.07-.29-.15-1.23-.45-2.34-1.44-.86-.77-1.45-1.72-1.62-2.01-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.5.15-.17.2-.29.29-.49.1-.2.05-.37-.02-.51-.08-.15-.66-1.58-.9-2.17-.24-.57-.48-.49-.66-.5h-.56c-.2 0-.51.07-.78.37-.27.29-1.02 1-1.02 2.43s1.05 2.82 1.2 3.01c.15.2 2.06 3.14 4.99 4.4.7.3 1.24.48 1.67.61.7.22 1.34.19 1.84.12.56-.08 1.73-.7 1.97-1.39.24-.68.24-1.27.17-1.39-.07-.12-.27-.2-.56-.34Z" />
      </svg>
      <span className="wa-fab__label">WhatsApp us</span>
    </a>
  );
}
