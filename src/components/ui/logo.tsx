"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  href?: string;
  showText?: boolean;
  subtitle?: string;
  className?: string;
  isDarkTheme?: boolean;
  imageOnly?: boolean;
}

export function Logo({
  size = "md",
  href,
  showText = true,
  subtitle,
  className = "",
  isDarkTheme = false,
  imageOnly = false,
}: LogoProps) {
  // Dimension definitions for logo badge
  const sizeMap = {
    xs: { box: "h-7 w-7 p-0.5 rounded-lg", imgWidth: 26, imgHeight: 21, text: "text-sm", sub: "text-[9px]" },
    sm: { box: "h-9 w-9 p-1 rounded-xl", imgWidth: 34, imgHeight: 28, text: "text-base", sub: "text-[10px]" },
    md: { box: "h-10 w-10 p-1 rounded-xl", imgWidth: 38, imgHeight: 31, text: "text-lg", sub: "text-[10px]" },
    lg: { box: "h-13 w-13 p-1.5 rounded-2xl", imgWidth: 48, imgHeight: 39, text: "text-2xl", sub: "text-xs" },
    xl: { box: "h-16 w-16 p-2 rounded-2xl", imgWidth: 60, imgHeight: 49, text: "text-3xl", sub: "text-xs" },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const content = (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Crisp container for the logo image */}
      <div
        className={`${currentSize.box} flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${
          isDarkTheme
            ? "bg-white shadow-md shadow-black/20 ring-1 ring-white/20"
            : "bg-white shadow-xs border border-slate-200/90 hover:border-brand-200 ring-2 ring-slate-100"
        }`}
      >
        <Image
          src="/logo.png"
          alt="Bannari Amman Institute of Technology"
          width={currentSize.imgWidth}
          height={currentSize.imgHeight}
          className="object-contain max-h-full max-w-full"
          priority
        />
      </div>

      {/* Brand Text */}
      {showText && !imageOnly && (
        <div className="leading-tight text-left min-w-0">
          <span
            className={`font-black tracking-tight block ${currentSize.text} ${
              isDarkTheme ? "text-white" : "text-navy-950"
            }`}
          >
            Hostel<span className={isDarkTheme ? "text-brand-400" : "text-brand-600"}>Hub</span>
          </span>
          {subtitle && (
            <span
              className={`block font-bold uppercase tracking-wider truncate max-w-[140px] sm:max-w-none ${currentSize.sub} ${
                isDarkTheme ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group inline-flex items-center focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}

export default Logo;
