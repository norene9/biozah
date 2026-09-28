
import { getStoreSettings } from "@/lib/store";
import "./about.css";

export default async function AboutPage() {
  const settings = await getStoreSettings();

  const hasContact = settings.contactEmail || settings.contactPhone;
  const hasSocial = settings.instagramUrl || settings.facebookUrl || settings.tiktokUrl;

  return (
    <main className="about-page">
      <section className="about-hero">
        <p className="eyebrow">About</p>
        <h1>{settings.businessName || "About us"}</h1>
        {settings.tagline && <p className="about-tagline">{settings.tagline}</p>}
      </section>

      <section className="about-grid">
        {settings.address && (
          <div className="about-block">
            <h2>Visit us</h2>
            <p className="about-address">{settings.address}</p>
          </div>
        )}

        {hasContact && (
          <div className="about-block">
            <h2>Get in touch</h2>
            {settings.contactEmail && (
              <a className="about-contact-link" href={`mailto:${settings.contactEmail}`}>
                {settings.contactEmail}
              </a>
            )}
            {settings.contactPhone && (
              <a className="about-contact-link" href={`tel:${settings.contactPhone.replace(/\s+/g, "")}`}>
                {settings.contactPhone}
              </a>
            )}
          </div>
        )}

        {hasSocial && (
          <div className="about-block">
            <h2>Follow along</h2>
            <div className="about-social">
              {settings.instagramUrl && (
                <a href={settings.instagramUrl} target="_blank" rel="noreferrer">
                  Instagram
                </a>
              )}
              {settings.facebookUrl && (
                <a href={settings.facebookUrl} target="_blank" rel="noreferrer">
                  Facebook
                </a>
              )}
              {settings.tiktokUrl && (
                <a href={settings.tiktokUrl} target="_blank" rel="noreferrer">
                  TikTok
                </a>
              )}
            </div>
          </div>
        )}
      </section>

      {settings.copyrightText && <p className="about-copyright">{settings.copyrightText}</p>}
    </main>
  );
}