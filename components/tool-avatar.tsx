import Image from "next/image";

export function ToolAvatar({ src, size = 20 }: { src: string | null; size?: number }) {
  const box = "shrink-0 rounded-[5px] outline outline-1 -outline-offset-1 outline-image-outline";
  if (!src) return <span aria-hidden="true" className={`${box} bg-surface`} style={{ width: size, height: size }} />;
  return (
    <Image
      src={`${src}&s=${size * 2}`}
      alt=""
      width={size}
      height={size}
      unoptimized
      className={box}
    />
  );
}
