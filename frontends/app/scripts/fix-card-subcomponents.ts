/**
 * File: frontends/app/scripts/fix-card-subcomponents.ts
 * Purpose: Replace <CardHeader>, <CardTitle>, <CardContent> with <div> equivalents
 * Usage:
 *   pnpm ts-node frontends/app/scripts/fix-card-subcomponents.ts
 *
 * Behaviour:
 * - <CardHeader ...> → <div className={`p-6 border-b ${oldClass??''}`}>...</div>
 * - <CardTitle ...>  → <div className={`${oldClass??''}`}>...</div>
 * - <CardContent ...>→ <div className={`p-6 ${oldClass??''}`}>...</div>
 * - Removes CardHeader/CardTitle/CardContent named imports from '@autorestock/ui-kit'
 * - Only touches the 5 target files
 */

import path from "node:path";
import { Project, SyntaxKind, JsxOpeningElement, JsxClosingElement, ImportDeclaration, StringLiteral, QuoteKind } from "ts-morph";

const ROOT = process.cwd();

// Target files you listed
const targets = [
  "packages/ui-user/src/components/CsvImport.tsx",
  "packages/ui-user/src/components/EbayOAuth.tsx",
  "packages/ui-user/src/components/EmailSetup.tsx",
  "packages/ui-user/src/components/MarketplaceEmailConnection.tsx",
  "packages/ui-user/src/components/UserRegistration.tsx",
];

const COMPONENT_MAP = {
  CardHeader: { tag: "div", baseClass: "p-6 border-b" },
  CardTitle: { tag: "div", baseClass: "" },
  CardContent: { tag: "div", baseClass: "p-6" },
};

function mergeClassName(existing: string | undefined, base: string): string {
  const trimmed = (existing ?? "").trim();
  if (!trimmed && !base) return "";
  if (!trimmed) return base;
  if (!base) return trimmed;
  return `${base} ${trimmed}`;
}

function isFromUiKit(node: ImportDeclaration) {
  const m = node.getModuleSpecifier();
  return m.getLiteralText() === "@autorestock/ui-kit";
}

function normalizeClassAttribute(openEl: JsxOpeningElement, baseClass: string) {
  // Find className attribute (if any)
  const attrs = openEl.getAttributes();
  const attr = attrs.find(a => {
    if (a.getKind() !== SyntaxKind.JsxAttribute) return false;
    const nameNode = a.getChildAtIndex(0);
    return nameNode?.getText() === "className";
  });

  if (attr && attr.getKind() === SyntaxKind.JsxAttribute) {
    const jsxAttr: any = attr;
    const initializer = jsxAttr.getInitializer?.();

    if (!initializer) {
      // Empty className - replace with base only
      if (jsxAttr.setInitializer) jsxAttr.setInitializer(`"${baseClass}"`);
      return;
    }

    if (initializer.getKind() === SyntaxKind.StringLiteral) {
      // className="..."
      const existingLiteral = (initializer as StringLiteral).getLiteralValue();
      const merged = mergeClassName(existingLiteral, baseClass);
      if (jsxAttr.setInitializer) jsxAttr.setInitializer(`"${merged}"`);
      return;
    }

    // className={...}
    const exprText = initializer.getText();
    if (!baseClass) {
      // keep as-is
      return;
    }
    // Convert to template literal merging base + dynamic
    // className={`p-6 border-b ${ ... }`}
    if (jsxAttr.setInitializer) {
      jsxAttr.setInitializer('{' + '`' + baseClass + ' ${' + exprText.replace(/^{|}$/g, "") + '}`' + '}');
    }
    return;
  }

  // No className at all → insert base if present
  if (baseClass) {
    openEl.addAttribute({
      name: "className",
      initializer: `"${baseClass}"`,
    } as any);
  }
}

function retag(openEl: JsxOpeningElement, newTag: string, baseClass: string) {
  openEl.getTagNameNode().replaceWithText(newTag);
  normalizeClassAttribute(openEl, baseClass);
  const parent = openEl.getParentIfKind(SyntaxKind.JsxElement);
  if (parent) {
    const closeEl = parent.getClosingElement();
    if (closeEl) closeEl.getTagNameNode().replaceWithText(newTag);
  } else {
    // Self-closing case: <CardHeader /> → <div />
    // nothing else to do beyond renaming; class handling done above
  }
}

function processFile(filePath: string) {
  const project = new Project({
    tsConfigFilePath: path.join(ROOT, "tsconfig.json"),
    skipFileDependencyResolution: true,
  });

  const sf = project.addSourceFileAtPathIfExists(filePath);
  if (!sf) {
    console.warn(`⚠️  Could not find ${filePath}`);
    return;
  }

  // 1) Update imports: remove CardHeader/CardTitle/CardContent from @autorestock/ui-kit
  sf.getImportDeclarations().forEach((imp) => {
    if (!isFromUiKit(imp)) return;

    let changed = false;
    const named = imp.getNamedImports();
    named.forEach((ni) => {
      const name = ni.getName();
      if (name === "CardHeader" || name === "CardTitle" || name === "CardContent" || name === "Progress") {
        ni.remove();
        changed = true;
      }
    });

    if (changed) {
      // If import has no specifiers left, keep it if it still imports Card/Button/etc; otherwise remove
      if (imp.getNamedImports().length === 0 && !imp.getDefaultImport() && !imp.getNamespaceImport()) {
        imp.remove();
      }
    }
  });

  // 2) Replace JSX elements
  sf.forEachDescendant((node) => {
    if (node.getKind() !== SyntaxKind.JsxOpeningElement) return;
    const openEl = node as JsxOpeningElement;
    const name = openEl.getTagNameNode().getText() as keyof typeof COMPONENT_MAP;
    if (name in COMPONENT_MAP) {
      const { tag, baseClass } = COMPONENT_MAP[name];
      retag(openEl, tag, baseClass);
    }
  });

  sf.saveSync();
  console.log(`✅ Updated: ${filePath}`);
}

(function run() {
  console.log("🔧 Fixing Card subcomponents...");
  targets.forEach(processFile);
  console.log("✅ Done.");
})();

