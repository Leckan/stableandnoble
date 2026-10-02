import Image from "next/image";
import type { PortableBlock } from "@/lib/cms";

function safeHref(href?: string) {
  if (!href) return null;
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  try {
    const url = new URL(href);
    return ["https:", "http:", "mailto:"].includes(url.protocol) ? href : null;
  } catch {
    return null;
  }
}

function renderChild(child: NonNullable<PortableBlock["children"]>[number], block: PortableBlock) {
  let content: React.ReactNode = child.text || "";
  for (const mark of child.marks || []) {
    if (mark === "strong") content = <strong>{content}</strong>;
    else if (mark === "em") content = <em>{content}</em>;
    else if (mark === "code") content = <code>{content}</code>;
    else {
      const definition = block.markDefs?.find(item => item._key === mark);
      const href = definition?._type === "link" ? safeHref(definition.href) : null;
      if (href) content = <a href={href}>{content}</a>;
    }
  }
  return <span key={child._key}>{content}</span>;
}

export function InsightContent({ blocks = [] }: { blocks?: PortableBlock[] }) {
  return <div className="insight-content">
    {blocks.map((block, index) => {
      const key = block._key || `${block._type}-${index}`;
      if (block._type === "image" && block.imageUrl) return <figure key={key} className="insight-inline-image"><Image src={block.imageUrl} alt={block.alt || ""} width={1400} height={900} sizes="(max-width: 900px) 100vw, 760px"/><figcaption>{block.alt}</figcaption></figure>;
      if (block._type !== "block") return null;
      const children = block.children?.map(child => renderChild(child, block));
      if (block.listItem === "bullet") return <ul key={key} className="insight-list"><li>{children}</li></ul>;
      if (block.listItem === "number") return <ol key={key} className="insight-list"><li>{children}</li></ol>;
      if (block.style === "h2") return <h2 key={key}>{children}</h2>;
      if (block.style === "h3") return <h3 key={key}>{children}</h3>;
      if (block.style === "blockquote") return <blockquote key={key}>{children}</blockquote>;
      return <p key={key}>{children}</p>;
    })}
  </div>;
}
