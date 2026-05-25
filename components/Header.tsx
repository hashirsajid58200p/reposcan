import Link from "next/link";

export default function Header() {
    return (
        <header className="absolute top-0 left-0 w-full z-50 flex items-center justify-between px-6 md:px-[80px] h-24 bg-transparent">
            {/* Wordmark Logo */}
            <div className="font-grotesk font-bold text-[18px] tracking-tight text-text-primary uppercase flex items-center">
                REPO<span className="text-accent">SCAN</span>
            </div>

            {/* API Link */}
            <Link
                href="https://docs.github.com/en/rest"
                target="_blank"
                rel="noopener noreferrer"
                className="font-inter text-[13px] text-text-secondary hover:text-text-primary transition-colors duration-150 flex items-center"
            >
                GitHub API <span className="ml-1 text-[10px]">↗</span>
            </Link>
        </header>
    );
}