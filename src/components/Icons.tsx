import { User } from "lucide-react";
import Image from "next/image";

export const Icons = {
  user: User,
  logo: ({
    width = 24,
    height = 24,
    ...rest
  }: {
    width?: number;
    height?: number;
  } & React.ImgHTMLAttributes<HTMLImageElement>) => (
    <Image
      src="/images/p.png"
      alt="Logo"
      width={width}
      height={height}
      style={{ display: "inline-block", verticalAlign: "middle" }}
      {...rest}
    />
  ),
};
