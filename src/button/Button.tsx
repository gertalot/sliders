import React, { MouseEventHandler } from "react";

export type ButtonProps = {
  text?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

const _foo = 0;

const Button: React.FC<ButtonProps> = ({ text, onClick, ...props }) => {
  return (
    <button onClick={onClick} {...props}>
      {text}
    </button>
  );
};

export default Button;
