"""Arma preview/index.html (vista previa como Artifact de claude.ai) a partir de dist/."""
import re, pathlib
s = pathlib.Path('dist/index.html').read_text()
links = re.findall(r'<link[^>]*fonts\.googleapis\.com/css2[^>]*>', s, re.S)
css = re.findall(r'<link rel="stylesheet" crossorigin href="[^"]+">', s)
js = re.findall(r'<script type="module" crossorigin src="[^"]+"></script>', s)
out = "\n".join(["<title>Wish.OS</title>", *links, *css, '<div id="root"></div>', *js]).replace(' crossorigin', '')
pathlib.Path('preview').mkdir(exist_ok=True)
pathlib.Path('preview/index.html').write_text(out + "\n")
print(out)
