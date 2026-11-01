import Image from 'next/image';
import Link from 'next/link';
import { BRAND } from '@/lib/brand';
import { getSiteSettings } from '@/lib/cms/repositories/settings';
import { getRsNavigation } from './site-header';
export async function SiteFooter() {
  const [settings, navigation] = await Promise.all([getSiteSettings(), getRsNavigation()]);
  return (
    <footer className="rs-footer">
      <div className="rs-container">
        <div className="rs-footer-grid">
          <div className="rs-footer-intro">
            <Link href="/" aria-label="Agrico home">
              <Image
                src={BRAND.logo}
                alt="Agrico"
                width={204}
                height={40}
                className="rs-footer-logo"
              />
            </Link>
            <p>
              {settings.footerTagline || 'Explore university programmes. Understand your options. Take your next step with clarity.'}
            </p>
          </div>
          <div>
            <h2>Programmes</h2>
            <nav aria-label="Programmes">
              {navigation.programmes.slice(0, 3).map(item => <Link key={item.href} href={item.href} prefetch={false}>{item.label}</Link>)}
              <Link href="/programs">All programmes</Link>
              {navigation.student.map(item => <Link key={item.href} href={item.href} prefetch={false}>{item.label}</Link>)}
            </nav>
          </div>
          <div>
            <h2>Universities</h2>
            <nav aria-label="Universities">
              {navigation.universities.slice(0, 4).map(item => <Link key={item.href} href={item.href} prefetch={false}>{item.label}</Link>)}
              <Link href="/universities">All universities</Link>
              <Link href="/compare">Compare universities</Link>
            </nav>
          </div>
          <div>
            <h2>Resources</h2>
            <nav aria-label="Resources">
              <Link href="/news">News &amp; updates</Link>
              <Link href="/blogs">Blogs</Link>
              {navigation.resources.map(item => <Link key={item.href} href={item.href} prefetch={false}>{item.label}</Link>)}
            </nav>
          </div>
          <div>
            <h2>Contact</h2>
            <address>
              {settings.contactEmail ? (
                <a href={'mailto:' + settings.contactEmail}>
                  {settings.contactEmail}
                </a>
              ) : null}
              {settings.contactPhone ? (
                <a href={'tel:' + settings.contactPhone}>
                  {settings.contactPhone}
                </a>
              ) : null}
              <Link href="/contact-us">Contact us</Link>
              <Link href={navigation.counsellingHref}>Admission guidance</Link>
              <Link href="/about-us">About us</Link>
              <Link href="/login">Student login</Link>
            </address>
          </div>
        </div>
        <div className="rs-footer-bottom">
          <span>© {new Date().getFullYear()} Agrico.</span>
          <nav aria-label="Policies"><Link href="/privacy-policy">Privacy policy</Link><Link href="/terms-and-conditions">Terms of use</Link></nav>
        </div>
      </div>
    </footer>
  );
}
