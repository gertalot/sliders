import { FC } from "react";
import Button, { ButtonProps } from "../Button";

const Example: FC<ButtonProps> = ({ onClick = () => {}, text = "Button" }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%"
      }}
    >
      <Button text={text} onClick={onClick} />
    </div>
  );
};

export default Example;
