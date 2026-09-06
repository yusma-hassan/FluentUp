'use client';

import { useState } from 'react';

interface CardItem {
  id: string;
  title: string;
  description: string;
  color: string;
  textColor?: string;
  icon: React.ReactNode;
}

interface CardFanProps {
  cards: CardItem[];
}

export function CardFan({ cards }: CardFanProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative h-80 w-full max-w-lg mx-auto select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {cards.map((card, index) => {
        const total = cards.length;
        const middle = (total - 1) / 2;
        const offset = index - middle;

        // Stacked position (slight offset so lower cards peek out)
        const stackedRotate = offset * 5;
        const stackedY = index * 14;
        const stackedX = offset * 10;

        // Fanned position (much wider)
        const fanRotate = offset * 18;
        const fanY = Math.abs(offset) * -28;
        const fanX = offset * 120;

        const transform = isHovered
          ? `translateX(${fanX}px) translateY(${fanY}px) rotate(${fanRotate}deg)`
          : `translateX(${stackedX}px) translateY(${stackedY}px) rotate(${stackedRotate}deg)`;

        return (
          <div
            key={card.id}
            className="absolute left-1/2 top-4 w-72 -translate-x-1/2 rounded-[var(--radius-md)] border-[2.5px] border-[var(--navy)] p-6 shadow-[var(--shadow)] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            style={{
              background: card.color,
              color: card.textColor || '#1A1A2E',
              transform,
              zIndex: isHovered ? 20 + index : index,
            }}
          >
            <div className="flex items-start gap-4">
              <div className="shrink-0 mt-0.5">{card.icon}</div>
              <div>
                <p className="font-bold text-lg leading-tight">{card.title}</p>
                <p className="text-sm mt-1.5 opacity-90 leading-snug">
                  {card.description}
                </p>
              </div>
            </div>
          </div>
        );
      })}

      <p className="absolute -bottom-2 left-0 right-0 text-center text-xs font-medium text-[var(--text-muted)]">
        {isHovered ? '' : 'Hover to explore'}
      </p>
    </div>
  );
}