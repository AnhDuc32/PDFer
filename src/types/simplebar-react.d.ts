declare module "simplebar-react" {
  import * as React from "react";

  export interface SimpleBarProps {
    children?: React.ReactNode;
    style?: React.CSSProperties;
    className?: string;
    [key: string]: any; // Fallback for unknown props
  }

  export default class SimpleBar extends React.Component<SimpleBarProps> {}
}
