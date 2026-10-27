import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { ComponentProps } from "react";

const components = {
  a: ({ href = "", ...props }: ComponentProps<"a">) =>
    href.startsWith("/") ? (
      <Link href={href} {...props} />
    ) : (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props} />
    ),
};

/** Renders trusted MDX from the content/ folder with the site's typography. */
export function Mdx({ source }: { source: string }) {
  return (
    <div className="prose-content">
      <MDXRemote source={source} components={components} />
    </div>
  );
}
