// import { useEffect, useRef, useState } from "react";
import { Sandpack } from "@codesandbox/sandpack-react";

// a bit of magic here: loading the raw sliders code from the dist folder
// so we can use it in the live demo
import gertalotSlidersRaw from "!!raw-loader!../../../../sliders/dist/index.umd";

const UseWheelToAdjustDemo = () => {
  const AppCode = `
import React from 'react';
import UseWheelToAdjustDemo from './UseWheelToAdjustDemo';

export default function App() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-700">
      <UseWheelToAdjustDemo />
    </div>
  );
}
  `;
  const ComponentCode = `import { useEffect, useRef, useState } from "react";
import { useWheelToAdjust } from "@gertalot/sliders";

const UseWheelToAdjustDemo = () => {
  // points to the DOM element of our slider
  const containerRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(0);

  // our custom hook
  const { wheelDelta, isScrolling } = useWheelToAdjust({
    containerRef,
    sensitivity: 2
  });

  useEffect(() => {
    if (isScrolling) {
      setValue((prev) => prev + wheelDelta);
    }
  }, [wheelDelta, isScrolling]);

  return (
    <div
      className="w-96 h-72 flex items-center justify-center font-mono text-white bg-gray-900 p-0 border-white border-solid border-2 touch-none select-none"
      ref={containerRef}
    >
      <div className="flex flex-col items-center space-y-2">
        <h2 className="text-xl">Use the mouse wheel!</h2>
        <p className="text-center text-sm">Scroll faster for coarse adjustments, and slower for fine adjustments</p>
        <h1 className="text-2xl font-bold">{value.toFixed(1)}</h1>
      </div>
    </div>
  );
}

export default UseWheelToAdjustDemo;
`;

  return (
    <Sandpack
      theme={"dark"}
      template="react-ts"
      files={{
        "/UseWheelToAdjustDemo.tsx": {
          active: true,
          code: ComponentCode,
        },
        "/App.tsx": {
          code: AppCode,
        },
        "/node_modules/@gertalot/sliders/package.json": {
          hidden: true,
          code: JSON.stringify({
            name: "@gertalot/sliders",
            main: "./index.es.js",
          }),
        },
        "/node_modules/@gertalot/sliders/index.es.js": {
          hidden: true,
          code: gertalotSlidersRaw,
        },
      }}
      options={{
        externalResources: ["https://cdn.tailwindcss.com"],
        showLineNumbers: true,
        showInlineErrors: true,
        editorHeight: 500,
        editorWidthPercentage: 59,
      }}
    />
  );
};

export default UseWheelToAdjustDemo;
