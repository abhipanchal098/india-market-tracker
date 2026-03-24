"use client";

import { useEffect, useRef, useState } from "react";

interface FlipNumberProps {
  value: string;
  className?: string;
}

/**
 * Animates each character with a vertical slide when it changes.
 * Increase (new value > old) → slides from bottom to top (new enters from below)
 * Decrease (new value < old) → slides from top to bottom (new enters from above)
 */
export function FlipNumber({ value, className = "" }: FlipNumberProps) {
  const prevValueRef = useRef(value);
  const [chars, setChars] = useState<CharState[]>(() =>
    value.split("").map((ch) => ({ char: ch, direction: "none" as Direction, key: 0 }))
  );
  const keyRef = useRef(0);

  useEffect(() => {
    const prev = prevValueRef.current;
    if (prev === value) return;

    // Determine direction by comparing numeric parts
    const prevNum = parseFloat(prev.replace(/[^0-9.\-]/g, ""));
    const newNum = parseFloat(value.replace(/[^0-9.\-]/g, ""));
    const direction: Direction =
      isNaN(prevNum) || isNaN(newNum) || newNum === prevNum
        ? "none"
        : newNum > prevNum
        ? "up"
        : "down";

    keyRef.current += 1;
    const newChars = value.split("").map((ch, i) => {
      const prevChar = prev[i];
      const changed = prevChar !== ch;
      return {
        char: ch,
        direction: changed ? direction : ("none" as Direction),
        key: changed ? keyRef.current : chars[i]?.key ?? 0,
      };
    });

    setChars(newChars);
    prevValueRef.current = value;
  }, [value, chars]);

  return (
    <span className={`inline-flex overflow-hidden ${className}`}>
      {chars.map((c, i) => (
        <FlipChar key={`${i}-${c.key}`} char={c.char} direction={c.direction} />
      ))}
    </span>
  );
}

type Direction = "up" | "down" | "none";

interface CharState {
  char: string;
  direction: Direction;
  key: number;
}

function FlipChar({ char, direction }: { char: string; direction: Direction }) {
  const isDigit = /[0-9.]/.test(char);

  if (!isDigit || direction === "none") {
    return <span className="inline-block">{char}</span>;
  }

  const animClass =
    direction === "up" ? "animate-flip-up" : "animate-flip-down";

  return (
    <span className={`inline-block ${animClass}`}>
      {char}
    </span>
  );
}
