import { User } from "lucide-react";
import Image from "next/image";
import type { StaticImageData } from "next/image";

export const Icons = {
  user: User,
  logo: ({
    width = 24,
    height = 24,
    ...rest
  }: {
    width?: number;
    height?: number;
    src?: string | StaticImageData;
  } & Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src">) => (
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
