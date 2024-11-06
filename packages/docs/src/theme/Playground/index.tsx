/* eslint-disable react/prop-types */
import { Sandpack } from "@codesandbox/sandpack-react";

// a bit of magic here: loading the raw sliders code from the dist folder
// so we can use it in the live demo
import gertalotSlidersRaw from "!!raw-loader!../../../../sliders/dist/index.umd";

function stringToDictionary(inputString) {
  const result = {};
  const items = inputString.split(" ");

  for (const item of items) {
    if (item.includes("=")) {
      const [key, value] = item.split("=");
      result[key] = value;
    } else {
      result[item] = true;
    }
  }

  return result;
}

export default function Playground({ children, transformCode, ...props }): JSX.Element {
  const metaProps = stringToDictionary(props.metastring);

  const componentName = metaProps["component"];
  const componentCode = children?.replace(/\n$/, "");

  const appCode = `import React from 'react';
import ${componentName} from './${componentName}';

export default function App() {
  return (
    <div className="flex items-start justify-center pt-4 h-screen bg-gray-700  text-white">
      <div className="w-96 h-96 bg-gray-900 p-0 touch-none select-none">
        <${componentName} />
      </div>
    </div>
  );
}
  `;

  const componentProps = {};
  componentProps[`${componentName}.tsx`] = {
    active: true,
    code: componentCode,
  };

  return (
    <Sandpack
      theme={"dark"}
      template={"react-ts"}
      files={{
        ...componentProps,
        "/App.tsx": {
          code: appCode,
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
        editorWidthPercentage: 60,
      }}
    />
  );
}
