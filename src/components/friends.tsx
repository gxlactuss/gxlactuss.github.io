import Image from "next/image";
import { friends } from "@/lib/config";

export function Friends() {
  return (
    <ul className="flex flex-wrap gap-5">
      {friends.map((friend) => (
        <li key={friend.name}>
          <a
            href={friend.href}
            rel="noopener"
            className="group flex w-20 flex-col items-center gap-2"
          >
            <span className="relative block rounded-full p-0.5 ring-1 ring-border transition-all group-hover:ring-2 group-hover:ring-accent">
              <Image
                src={friend.avatar}
                alt=""
                width={56}
                height={56}
                className="size-14 rounded-full object-cover transition-transform group-hover:scale-105"
              />
            </span>
            <span className="truncate text-center font-mono text-xs text-fg-muted group-hover:text-accent">
              {friend.name}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
