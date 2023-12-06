"use client";

import { usePathname } from "next/navigation";
import React from "react";
import { IoCarSportOutline } from "react-icons/io5";
import { LuMailPlus } from "react-icons/lu";
import { MdOutlinePrivacyTip } from "react-icons/md";
import { PiCertificate } from "react-icons/pi";
import { SlPresent } from "react-icons/sl";
import { MenuItem } from "./MenuItem";

export const FooterMenu: React.FC = () => {
  const items = [
    { icon: <PiCertificate />, label: "証明書", href: "/creds" },
    {
      icon: <MdOutlinePrivacyTip />,
      label: "発行",
      href: "/issue",
    },
    { icon: <SlPresent />, label: "証明", href: "/proof" },
    { icon: <LuMailPlus />, label: "検証", href: "/verify" },
  ];
  const pathname = usePathname();

  return (
    <div className="flex justify-around pt-4 pb-8 bg-white bg-opacity-70">
      {items.map((item) => (
        <MenuItem
          key={item.href}
          {...item}
          isActive={pathname.startsWith(item.href)}
        />
      ))}
    </div>
  );
};
