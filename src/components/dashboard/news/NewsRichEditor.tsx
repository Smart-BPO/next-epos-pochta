"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { cn } from "@/lib/cn";
import { dashBtnSecondary } from "@/styles/dashboard";

type NewsRichEditorProps = {
  name: string;
  defaultHtml: string;
  folder?: string;
};

function ToolbarButton({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg px-2 py-1 text-xs font-semibold",
        active
          ? "bg-primary-soft text-primary"
          : "text-black/55 hover:bg-black/[0.04]",
      )}
    >
      {children}
    </button>
  );
}

export function NewsRichEditor({
  name,
  defaultHtml,
  folder = "news/inline",
}: NewsRichEditorProps) {
  const [html, setHtml] = useState(defaultHtml || "<p></p>");
  const [busy, setBusy] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded-xl max-w-full h-auto" },
      }),
    ],
    content: defaultHtml || "<p></p>",
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => {
      setHtml(ed.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[220px] px-3 py-3 text-sm leading-relaxed outline-none prose prose-sm max-w-none",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (defaultHtml && current === "<p></p>" && defaultHtml !== "<p></p>") {
      editor.commands.setContent(defaultHtml, { emitUpdate: true });
    }
  }, [editor, defaultHtml]);

  const insertImage = async (file: File) => {
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("folder", folder);
      const res = await fetch("/api/dashboard/media/upload/", {
        method: "POST",
        body,
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error || "upload_failed");
      editor?.chain().focus().setImage({ src: json.url }).run();
      toast.success("Изображение вставлено");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "upload_failed");
    } finally {
      setBusy(false);
    }
  };

  if (!editor) {
    return (
      <div className="rounded-xl border border-black/10 bg-white p-3 text-sm text-black/40">
        Загрузка редактора…
        <input type="hidden" name={name} value={html} />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
      <div className="flex flex-wrap gap-1 border-b border-black/[0.06] bg-[#fafbfc] px-2 py-1.5">
        <ToolbarButton
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          B
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          I
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          H3
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • List
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. List
        </ToolbarButton>
        <ToolbarButton
          onClick={() => {
            const href = window.prompt("URL ссылки");
            if (!href) return;
            editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
          }}
        >
          Link
        </ToolbarButton>
        <label className={cn(dashBtnSecondary, "cursor-pointer !px-2 !py-1 text-xs")}>
          {busy ? "…" : "Img"}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) void insertImage(file);
            }}
          />
        </label>
      </div>
      <EditorContent editor={editor} />
      <input type="hidden" name={name} value={html} />
    </div>
  );
}
