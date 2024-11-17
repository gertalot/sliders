/**
 * A simple component that renders a loud speaker icon as an SVG. The number of
 * bars is determined by the `volume` prop.
 */
const Speaker = ({
  volume,
  width = 32,
  height = 32,
  color = "white",
}: {
  volume: number;
  width?: number;
  height?: number;
  color?: string;
}) => {
  return (
    <svg className="px-1" width={width} height={height} viewBox="0 0 512 512">
      {/* Draw the speaker cone */}
      <rect style={{ fill: color, stroke: "none" }} width="48" height="128" x="48" y="192" />
      <path style={{ fill: color, stroke: "none" }} d="m 112,192 96,-64 v 272 l -96,-80 z" />

      {/* Draw the volume bars */}
      {volume == 0.0 && (
        <path
          style={{ fill: "none", stroke: color, strokeWidth: 32, strokeLinecap: "round" }}
          d="M 288,192 416,320 M 416,192 288,320"
        />
      )}
      {volume > 0.0 && (
        <path
          style={{ fill: "none", stroke: color, strokeWidth: 32, strokeLinecap: "round" }}
          d="m 256,200 a 64,64 0 0 1 32,55 64,64 0 0 1 -32,55"
        />
      )}
      {volume > 0.25 && (
        <path
          style={{ fill: "none", stroke: color, strokeWidth: 32, strokeLinecap: "round" }}
          d="m 289,145 a 128,128 0 0 1 64,110 128,128 0 0 1 -64,110"
        />
      )}
      {volume > 0.5 && (
        <path
          style={{ fill: "none", stroke: color, strokeWidth: 32, strokeLinecap: "round" }}
          d="m 320,90 A 192,192 0 0 1 416,256 192,192 0 0 1 320,422"
        />
      )}
      {volume > 0.75 && (
        <path
          style={{ fill: "none", stroke: color, strokeWidth: 32, strokeLinecap: "round" }}
          d="m 356,34 A 256,256 0 0 1 484,256 256,256 0 0 1 356,478"
        />
      )}
    </svg>
  );
};

export default Speaker;
