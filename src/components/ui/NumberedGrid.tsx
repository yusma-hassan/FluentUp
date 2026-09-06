'use client';

export interface NumberedGridProps {
  count: number;
  onSelect: (slot: number) => void;
  selectedSlot: number | null;
  revealedLabel: string | null;
  disabled: boolean;
}

export function NumberedGrid({ count, onSelect, selectedSlot, disabled }: NumberedGridProps) {
  const isLocked = disabled || selectedSlot !== null;

  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${count > 6 ? '4.5rem' : '5.5rem'}, 1fr))` }}
      role="group"
    >
      {Array.from({ length: count }, (_, i) => {
        const slot = i + 1;
        const isSelected = selectedSlot === slot;
        const isOther = selectedSlot !== null && !isSelected;

        return (
          <button
            key={slot}
            type="button"
            onClick={() => !isLocked && onSelect(slot)}
            disabled={isLocked && !isSelected}
            className={`fu-slot ${isSelected ? 'selected' : ''} ${isOther ? 'opacity-40' : ''}`}
          >
            {slot}
          </button>
        );
      })}
    </div>
  );
}