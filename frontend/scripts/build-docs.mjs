import { readdir, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Marked } from 'marked';
import { createHighlighter } from 'shiki';

const root = fileURLToPath(new URL('..', import.meta.url));
const srcDir = join(root, 'docs-src');
const outDir = join(root, 'public', 'docs');

const highlighter = await createHighlighter({
  themes: ['github-dark'],
  langs: ['typescript', 'javascript', 'html', 'css', 'bash', 'json'],
});

const marked = new Marked({
  async: true,
  renderer: {
    code({ text, lang }) {
      const language = highlighter.getLoadedLanguages().includes(lang) ? lang : 'text';
      return highlighter.codeToHtml(text, { lang: language, theme: 'github-dark' });
    },
  },
});

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

const files = (await readdir(srcDir)).filter((f) => f.endsWith('.md'));

for (const file of files) {
  const md = await readFile(join(srcDir, file), 'utf8');
  const html = await marked.parse(md);
  const slug = basename(file, '.md');
  await writeFile(join(outDir, `${slug}.html`), html);
  console.log(`docs: ${file} → public/docs/${slug}.html`);
}

console.log(`docs: built ${files.length} file(s)`);
