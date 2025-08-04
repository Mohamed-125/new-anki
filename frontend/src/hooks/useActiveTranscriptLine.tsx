import { CaptionType } from "@/pages/video/Video";
import { useState, useRef, useEffect } from "react";

function useActiveTranscriptLine(playerRef: any, lines: CaptionType[] = []) {
  const idxRef = useRef(-1);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    if (!playerRef || !lines.length) return;

    let rafId;
    const loop = () => {
      const t = playerRef.current?.getCurrentTime(); // :contentReference[oaicite:3]{index=3}
      const i = lines.findIndex((l, index) => t >= l.offset && t <= l.trueEnd);

      if (i !== idxRef.current) {
        idxRef.current = i;

        document
          .querySelectorAll(`.subtitle-item`)
          .forEach((subtitle) => subtitle?.classList.remove("subtitle-active"));

        document
          .querySelector(`#subtitle-${i}`)
          ?.classList.add("subtitle-active");
        setActive(i);
      }
      rafId = requestAnimationFrame(loop); // :contentReference[oaicite:4]{index=4}
    };

    rafId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(rafId);
  }, [lines, playerRef]);

  return active;
}

export default useActiveTranscriptLine;
