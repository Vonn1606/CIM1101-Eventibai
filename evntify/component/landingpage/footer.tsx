import Image from "next/image";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-inner">
                <div className="footer-brand">
                    <Image src="/eventifytext.svg" alt="Eventify" width={71} height={71} />
                    <p className="footer-copy">© 2026 Eventify Campus Inc. All rights reserved.</p>
                </div>
                <nav className="footer-links">
                    <Link href="/privacy">Privacy Policy</Link>
                    <Link href="/terms">Terms of Service</Link>
                </nav>
            </div>
        </footer>
    );
}
