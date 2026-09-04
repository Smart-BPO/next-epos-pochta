"use client";

import Image from "next/image";
import { useState } from "react";

export function FaqList({
  items,
}: {
  items: Array<{ question: string; answer: string }>;
}) {
  const [open, setOpen] = useState(0);

  return (
    <div className="flex w-full flex-col gap-4 md:gap-6">
      {items.map((item, index) => {
        const isOpen = open === index;
        return (
          <button
            key={item.question}
            type="button"
            className="flex w-full items-start gap-3 rounded-2xl text-left sm:gap-4 md:gap-8"
            onClick={() => setOpen(isOpen ? -1 : index)}
            aria-expanded={isOpen}
          >
            <div className="min-w-0 flex-1">
              <p className="m-0 text-lg font-medium text-black sm:text-xl md:text-2xl">
                {item.question}
              </p>
              {isOpen ? (
                <p className="mt-3 text-base text-black/60 sm:mt-4 sm:text-lg md:text-xl">
                  {item.answer}
                </p>
              ) : null}
            </div>
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-black/10 sm:size-14">
              <Image
                src={isOpen ? "/images/home/faq-close.svg" : "/images/home/faq-open.svg"}
                alt=""
                width={24}
                height={24}
                unoptimized
              />
            </span>
          </button>
        );
      })}
    </div>
  );
}
