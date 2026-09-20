import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import glsl from "shiki/langs/glsl.mjs";
import typescript from "shiki/langs/typescript.mjs";
import xml from "shiki/langs/xml.mjs";
import theme from "shiki/themes/github-light.mjs";
const highlighter = createHighlighterCore({
  themes: [theme],
  langs: [glsl, typescript, xml],
  engine: createJavaScriptRegexEngine(),
});
export async function highlight(source: string, lang: string) {
  return (await highlighter).codeToHtml(source, {
    lang,
    theme: "github-light",
  });
}
