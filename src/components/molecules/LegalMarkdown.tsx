import { Fragment, type ReactNode } from "react";

type Props = {
  markdown: string;
};

/**
 * Minimal markdown for legal pages: h2, p, ul/ol, tables, bold.
 * Not a full MD engine — matches the published legal document shape.
 */
export function LegalMarkdown({ markdown }: Props) {
  const blocks = splitBlocks(markdown.trim());
  return (
    <div className="legal-md flex flex-col gap-4">
      {blocks.map((block, i) => (
        <Fragment key={i}>{renderBlock(block)}</Fragment>
      ))}
    </div>
  );
}

function splitBlocks(src: string): string[] {
  const lines = src.split("\n");
  const blocks: string[] = [];
  let buf: string[] = [];
  let mode: "plain" | "ul" | "ol" | "table" = "plain";

  const flush = () => {
    const t = buf.join("\n").trim();
    if (t) blocks.push(t);
    buf = [];
  };

  for (const line of lines) {
    const isUl = /^[-*] /.test(line);
    const isOl = /^\d+\. /.test(line);
    const isTable = /^\|/.test(line);
    const isBlank = line.trim() === "";

    if (isBlank) {
      flush();
      mode = "plain";
      continue;
    }

    if (line.startsWith("## ")) {
      flush();
      blocks.push(line);
      mode = "plain";
      continue;
    }

    if (isTable) {
      if (mode !== "table") {
        flush();
        mode = "table";
      }
      buf.push(line);
      continue;
    }

    if (isUl) {
      if (mode !== "ul") {
        flush();
        mode = "ul";
      }
      buf.push(line);
      continue;
    }

    if (isOl) {
      if (mode !== "ol") {
        flush();
        mode = "ol";
      }
      buf.push(line);
      continue;
    }

    if (mode === "ul" || mode === "ol" || mode === "table") {
      flush();
      mode = "plain";
    }
    buf.push(line);
  }
  flush();
  return blocks;
}

function renderBlock(block: string) {
  if (block.startsWith("## ")) {
    return <h2>{inline(block.slice(3).trim())}</h2>;
  }
  if (block.startsWith("|")) {
    return renderTable(block);
  }
  if (/^[-*] /m.test(block) && block.split("\n").every((l) => /^[-*] /.test(l))) {
    return (
      <ul className="m-0 list-disc space-y-2 pl-5">
        {block.split("\n").map((line, i) => (
          <li key={i}>{inline(line.replace(/^[-*] /, ""))}</li>
        ))}
      </ul>
    );
  }
  if (/^\d+\. /m.test(block) && block.split("\n").every((l) => /^\d+\. /.test(l))) {
    return (
      <ol className="m-0 list-decimal space-y-2 pl-5">
        {block.split("\n").map((line, i) => (
          <li key={i}>{inline(line.replace(/^\d+\. /, ""))}</li>
        ))}
      </ol>
    );
  }
  if (/^\*\*.+\*\*$/.test(block) && !block.includes("\n")) {
    return <p className="m-0 font-medium text-black/70">{inline(block)}</p>;
  }
  return <p className="m-0">{inline(block.replace(/\n/g, " "))}</p>;
}

function renderTable(block: string) {
  const rows = block
    .split("\n")
    .filter((l) => /^\|/.test(l) && !/^\|\s*-+/.test(l))
    .map((l) =>
      l
        .replace(/^\||\|$/g, "")
        .split("|")
        .map((c) => c.trim()),
    );
  if (rows.length === 0) return null;
  const [header, ...body] = rows;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[28rem] border-collapse text-left text-sm text-black/65">
        <thead>
          <tr className="border-b border-black/15">
            {header.map((cell, i) => (
              <th key={i} className="px-3 py-2 font-semibold text-black/80">
                {inline(cell)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, ri) => (
            <tr key={ri} className="border-b border-black/10 align-top">
              {row.map((cell, ci) => (
                <td key={ci} className="px-3 py-2">
                  {inline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function inline(text: string) {
  const nodes: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[1]) {
      nodes.push(
        <strong key={key++} className="font-semibold text-black/80">
          {m[1]}
        </strong>,
      );
    } else {
      nodes.push(
        <a
          key={key++}
          href={m[3]}
          className="font-medium text-primary underline-offset-2 hover:underline"
          {...(m[3].startsWith("http")
            ? { target: "_blank", rel: "noreferrer" }
            : {})}
        >
          {m[2]}
        </a>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes.length === 1 ? nodes[0] : nodes;
}
