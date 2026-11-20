import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 flex h-[80px] w-full flex-row items-center justify-between self-stretch border-b border-[#E4DFE1] bg-white/80 px-[64px] py-[19px] backdrop-blur-md">
      {/* Brand */}
      <Link
        href="/"
        className="flex items-center gap-2.5 group focus:outline-none"
      >
        <Image
          src="/eventifytxt-cropped.svg"
          alt="Eventify"
          width={120}
          height={36}
          className="h-9  w-auto object-contain transition transform group-hover:scale-105"
        />
      </Link>
    </header>
  );
}
