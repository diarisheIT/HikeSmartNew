"use client";

import { useState, useEffect, useRef } from "react";

const PHRASES = [
  "easy coastal walks near Sai Kung",
  "challenging hikes with mountain views",
  "family-friendly trails on Hong Kong Island",
  "sunset hike with sea views",
  "short nature walk near MTR station",
];

export function useTypewriter() {
  const [text, setText] = useState("");
  const state = useRef({
    phraseIndex: 0,
    charIndex: 0,
    phase: "typing" as "typing" | "pause" | "deleting" | "gap",
  });

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    function tick() {
      const s = state.current;
      const phrase = PHRASES[s.phraseIndex];
      let delay = 0;

      switch (s.phase) {
        case "typing": {
          if (s.charIndex < phrase.length) {
            s.charIndex++;
            setText(phrase.slice(0, s.charIndex));
            delay = 45 + Math.random() * 35;
          } else {
            s.phase = "pause";
            delay = 2200;
          }
          break;
        }
        case "pause": {
          s.phase = "deleting";
          delay = 0;
          break;
        }
        case "deleting": {
          if (s.charIndex > 0) {
            s.charIndex--;
            setText(phrase.slice(0, s.charIndex));
            delay = 25;
          } else {
            s.phase = "gap";
            delay = 400;
          }
          break;
        }
        case "gap": {
          s.phraseIndex = (s.phraseIndex + 1) % PHRASES.length;
          s.charIndex = 0;
          s.phase = "typing";
          delay = 0;
          break;
        }
      }

      timer = setTimeout(tick, delay);
    }

    tick();
    return () => clearTimeout(timer);
  }, []);

  return text;
}
