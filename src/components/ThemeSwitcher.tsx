import { useState } from "react";
import { Button, Popover } from "open-glass-ui";
import { Check, Palette } from "lucide-react";
import { PRESETS, useThemePreset } from "../theme";

export function PresetSwatches({
  colors,
  size = 12,
}: {
  colors: [string, string, string];
  size?: number;
}) {
  return (
    <span className="flex shrink-0 items-center">
      {colors.map((color, index) => (
        <span
          key={color}
          className="swatch"
          style={{
            background: color,
            width: size,
            height: size,
            marginLeft: index === 0 ? 0 : -size / 3,
            zIndex: 3 - index,
          }}
        />
      ))}
    </span>
  );
}

export default function ThemeSwitcher() {
  const { preset, setPreset } = useThemePreset();
  const [open, setOpen] = useState(false);

  return (
    <Popover
      label="Theme palette"
      placement="end"
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button variant="quiet" size="small" aria-label="Theme palette" className="gap-0">
          <span className="inline-flex items-center gap-2 whitespace-nowrap">
            <Palette size={15} strokeWidth={1.9} />
            <PresetSwatches colors={preset.colors} size={11} />
          </span>
        </Button>
      }
    >
      <div className="w-[268px] p-1">
        <div className="flex items-baseline justify-between px-2 pb-2">
          <span className="eyebrow">Palette</span>
          <span className="rail-label">{PRESETS.length} presets</span>
        </div>
        <div className="flex flex-col gap-0.5">
          {PRESETS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="theme-row"
              data-active={item.id === preset.id}
              onClick={() => {
                setPreset(item.id);
                setOpen(false);
              }}
            >
              <PresetSwatches colors={item.colors} size={13} />
              <span className="flex-1 text-left text-[12.5px] font-medium text-[rgb(var(--ink-rgb)/0.90)]">
                {item.name}
              </span>
              {item.id === preset.id && (
                <Check size={13} className="text-[rgb(var(--ink-rgb)/0.70)]" strokeWidth={2.4} />
              )}
            </button>
          ))}
        </div>
        <div className="mt-2 border-t border-[rgb(var(--ink-rgb)/0.08)] px-2 pt-2">
          <p className="text-[11px] leading-relaxed text-[rgb(var(--ink-rgb)/0.40)]">
            85% neutral glass · accents reserved for actions, data and status.
          </p>
        </div>
      </div>
    </Popover>
  );
}
