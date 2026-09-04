import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import type { SiteCopy } from "@/data/types";
import { SITE_CONFIG } from "@/utils/consts";

interface SiteFooterProps {
  locale: Locale;
  content: SiteCopy;
}

export function SiteFooter({ locale, content }: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <div className="page-container footer-grid">
        <div>
          <div className="logo" style={{ color: "#ffb3ba", marginBottom: "0.75rem" }}>
            {SITE_CONFIG.name}
          </div>
          <p className="footer-muted">{content.footer.blurb}</p>
        </div>

        <div>
          <strong>{content.footer.contacts}</strong>
          <ul style={{ listStyle: "none", padding: 0, margin: "0.75rem 0 0" }}>
            {content.nav.map((item) => (
              <li key={item.href} style={{ marginBottom: "0.4rem" }}>
                <Link href={localePath(locale, item.href)}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p>
            <a href={`tel:${SITE_CONFIG.phone}`}>{SITE_CONFIG.phoneDisplay}</a>
          </p>
          <p className="footer-muted">
            {SITE_CONFIG.email || content.ui.placeholderEmail}
          </p>
          <p className="footer-muted">
            {SITE_CONFIG.telegramUrl ? (
              <a href={SITE_CONFIG.telegramUrl} target="_blank" rel="noreferrer">
                Telegram
              </a>
            ) : (
              content.ui.placeholderTelegram
            )}
          </p>
          <p className="footer-muted">
            {SITE_CONFIG.hours || content.ui.placeholderHours}
          </p>
          <p className="footer-muted">{SITE_CONFIG.address.line}</p>
        </div>
      </div>

      <div
        className="page-container"
        style={{
          marginTop: "2rem",
          paddingTop: "1.25rem",
          borderTop: "1px solid #333",
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          justifyContent: "space-between",
        }}
      >
        <p className="footer-muted" style={{ margin: 0 }}>
          {content.footer.legal}
        </p>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link href={localePath(locale, "/privacy/")}>
            {content.footer.privacy}
          </Link>
          <Link href={localePath(locale, "/terms/")}>
            {content.footer.terms}
          </Link>
        </div>
      </div>
    </footer>
  );
}
