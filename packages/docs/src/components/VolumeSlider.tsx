import { useRef } from "react";
import { useSlider } from "../../../sliders/src/";
import Speaker from "./Speaker";

/**
 * A horizontal volume slider that uses the `useSlider` hook.
 */
const VolumeSlider = () => {
  // The dragArea is an invisible rect placed over the slider giving us an "active"
  // area that the `useSlider` hook uses to determine if the user is dragging the
  // slider. The target is the slidey bit that the user can drag around.
  const dragAreaRef = useRef<SVGRectElement>(null);
  const targetRef = useRef<SVGPathElement>(null);

  const { value, isAdjusting, isOnDragArea, isOnTarget } = useSlider({
    dragAreaRef,
    targetRef,
    minValue: 0,
    maxValue: 1,
    initialValue: 0.4,
    isVertical: false,
  });

  return (
    <div>
      <p>Drag the slider to adjust the volume, or use the mouse wheel</p>
      <div className="w-full h-64 mt-0 flex items-center justify-center touch-none select-none">
        {/* show the loudspeaker icon. The `--sl-color-accent-*` variables are from the Astro
            Starlight theme that is used to generate this site */}
        <Speaker
          volume={value}
          color={isAdjusting || isOnDragArea ? "var(--sl-color-accent)" : "var(--sl-color-accent-high)"}
        />
        <svg
          width="256"
          height="32"
          viewBox="0 0 256 32"
          style={{ margin: 0, borderWidth: "1px", borderColor: "var(--sl-color-accent)" }}
          className="flex px-3 border-gray-800 border-solid rounded-2xl"
        >
          {/* This rect, placed directly over the slider, is the active drag area */}
          <rect x="8" y="0" width="240" height="32" fill="transparent" ref={dragAreaRef} />

          {/* the grey background line for the slider */}
          <path
            style={{
              stroke: "#666",
              strokeWidth: 10,
              strokeLinecap: "round",
            }}
            d="M 8,16 248,16"
          />

          {/* the slidey bit that the user can drag around */}
          <path
            ref={targetRef}
            style={{
              stroke: isAdjusting || isOnTarget ? "var(--sl-color-accent)" : "var(--sl-color-accent-high)",
              strokeWidth: isAdjusting || isOnTarget ? 18 : isOnDragArea ? 14 : 10,
              strokeLinecap: "round",
            }}
            d={`M 8,16 ${8 + value * 240},16`}
          />
        </svg>
      </div>
      <div className="text-center w-full" style={{ color: "var(--sl-color-accent)" }}>
        {(value * 100).toFixed(0)}%
      </div>
    </div>
  );
};

export default VolumeSlider;
