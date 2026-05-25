import Link from "next/link";
import Image from "next/image";

export default function Header() {
    return (
        <header className="absolute top-0 left-0 w-full z-50 flex items-center justify-between px-6 md:px-[80px] h-16 bg-black/90 border-b border-border-default">
            {/* Wordmark Logo */}
            <Link
                href="/"
                onClick={(e) => {
                    e.preventDefault();
                    window.location.href = "/";
                }}
                className="flex items-center hover:opacity-80 transition-opacity cursor-pointer"
            >
                <Image
                    src="/logo.png?v=2"
                    alt="RepoScan"
                    width={100}
                    height={40}
                    priority
                    className="object-contain"
                />
            </Link>

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