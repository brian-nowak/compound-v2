'use client';

import {
  BanknotesIcon,
  HomeIcon,
  ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

// Navigation links for the finance dashboard
const links = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  { name: 'Accounts', href: '/dashboard/accounts', icon: BanknotesIcon },
  { name: 'Transactions', href: '/dashboard/transactions', icon: ArrowsRightLeftIcon },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              "flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-muted p-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground md:flex-none md:justify-start md:p-2 md:px-3 transition-colors",
              {
                "bg-accent text-accent-foreground": pathname === link.href
              }
            )}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
