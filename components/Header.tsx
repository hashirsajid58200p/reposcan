import Link from "next/link";
import Image from "next/image";

export default function Header() {
    return (
        <header className="absolute top-0 left-0 w-full z-50 flex items-center justify-between px-6 md:px-[80px] h-24 bg-transparent">
            {/* Wordmark Logo */}
            <div className="flex items-center">
                <Image
                    src="/logo.png"
                    alt="RepoScan"
                    width={150}
                    height={60}
                    priority
                    className="object-contain"
                />
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