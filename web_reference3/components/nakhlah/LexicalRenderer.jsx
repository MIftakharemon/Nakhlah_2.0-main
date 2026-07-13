/**
 * LexicalRenderer — renders Lexical editor JSON AST to React elements.
 *
 * Supported node types:
 *  root, paragraph, text, list (bullet / number), listitem,
 *  horizontalrule, linebreak
 *
 * Text format flags (bitmask):
 *  1 = bold | 2 = italic | 4 = strikethrough | 8 = underline | 16 = code
 */

function applyTextFormat(format, children) {
  let el = <>{children}</>;
  if (format & 1) el = <strong>{el}</strong>;
  if (format & 2) el = <em>{el}</em>;
  if (format & 4) el = <s>{el}</s>;
  if (format & 8) el = <u>{el}</u>;
  if (format & 16)
    el = <code className="bg-muted px-1 rounded text-sm font-mono">{el}</code>;
  return el;
}

const ALIGN_CLASS = {
  start: "text-left",
  end: "text-right",
  justify: "text-justify",
  center: "text-center",
  right: "text-right",
  left: "text-left",
};

function parseStyleString(styleText) {
  if (!styleText || typeof styleText !== "string") return undefined;

  const styleObject = {};
  const declarations = styleText
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);

  declarations.forEach((declaration) => {
    const [prop, ...valueParts] = declaration.split(":");
    if (!prop || valueParts.length === 0) return;

    const rawProp = prop.trim();
    const rawValue = valueParts.join(":").trim();
    if (!rawProp || !rawValue) return;

    const camelProp = rawProp.replace(/-([a-z])/g, (_, char) =>
      char.toUpperCase(),
    );
    styleObject[camelProp] = rawValue;
  });

  return Object.keys(styleObject).length > 0 ? styleObject : undefined;
}

function renderNode(node, idx) {
  if (!node) return null;

  switch (node.type) {
    case "root":
      return (
        <div key={idx}>
          {(node.children || []).map((child, i) => renderNode(child, i))}
        </div>
      );

    case "paragraph": {
      const alignClass = ALIGN_CLASS[node.format] || "";
      const children = (node.children || []).map((child, i) =>
        renderNode(child, i),
      );
      const isEmpty = !node.children || node.children.length === 0;
      const hasBlockChild = (node.children || []).some((child) =>
        ["horizontalrule", "list"].includes(child?.type),
      );

      if (hasBlockChild) {
        return (
          <div
            key={idx}
            className={`mb-3 leading-relaxed text-foreground/90 ${alignClass}`}
          >
            {isEmpty ? <br /> : children}
          </div>
        );
      }

      return (
        <p
          key={idx}
          className={`mb-3 leading-relaxed text-foreground/90 ${alignClass}`}
        >
          {isEmpty ? <br /> : children}
        </p>
      );
    }

    case "text": {
      const content = node.text || "";
      return (
        <span key={idx} style={parseStyleString(node.style)}>
          {applyTextFormat(node.format || 0, content)}
        </span>
      );
    }

    case "linebreak":
      return <br key={idx} />;

    case "horizontalrule":
      return <hr key={idx} className="my-4 border-border" />;

    case "list": {
      if (node.listType === "check") {
        return (
          <ul key={idx} className="mb-3 space-y-2">
            {(node.children || []).map((child, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-foreground/90 leading-relaxed"
              >
                <span className="mt-0.5 text-muted-foreground">
                  {child?.checked ? "☑" : "☐"}
                </span>
                <span>
                  {(child?.children || []).map((nestedChild, nestedIndex) =>
                    renderNode(nestedChild, nestedIndex),
                  )}
                </span>
              </li>
            ))}
          </ul>
        );
      }

      const Tag = node.listType === "number" ? "ol" : "ul";
      const listClass =
        node.listType === "number"
          ? "list-decimal list-outside pl-6 mb-3 space-y-1"
          : "list-disc list-outside pl-6 mb-3 space-y-1";
      return (
        <Tag key={idx} className={listClass}>
          {(node.children || []).map((child, i) => renderNode(child, i))}
        </Tag>
      );
    }

    case "listitem":
      return (
        <li key={idx} className="text-foreground/90 leading-relaxed pl-1">
          {(node.children || []).map((child, i) => renderNode(child, i))}
        </li>
      );

    default:
      // Render children if present, ignore unknown leaf nodes
      if (node.children) {
        return (
          <span key={idx}>
            {node.children.map((child, i) => renderNode(child, i))}
          </span>
        );
      }
      return null;
  }
}

/**
 * @param {{ root: object } | null | undefined} lexicalJson
 */
export default function LexicalRenderer({ lexicalJson, className = "" }) {
  if (!lexicalJson?.root) return null;
  return (
    <div className={`lexical-content text-sm ${className}`}>
      {renderNode(lexicalJson.root, 0)}
    </div>
  );
}
