import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const pages = [
    ["Inicio", "index.html"],
    ["Galería", "galeria/index.html"],
    ["Ubicación", "ubicacion/index.html"],
    ["Contacto", "contacto/index.html"],
];

async function readPage(file) {
    return readFile(new URL(`../dist/${file}`, import.meta.url), "utf8");
}

for (const [name, file] of pages) {
    test(`${name}: estructura semántica y salto accesible`, async () => {
        const html = await readPage(file);

        assert.match(html, /<html lang="es">/);
        assert.match(html, /class="skip-link" href="#contenido"/);
        assert.match(html, /id="contenido" tabindex="-1"/);
        assert.equal((html.match(/<main\b/g) ?? []).length, 1);
        assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
        assert.match(html, /aria-label="Navegación principal"/);
        assert.match(html, /id="theme-toggle"/);
        assert.match(html, /aria-label="Modo oscuro"/);
        assert.match(html, /aria-pressed="false"/);
        assert.match(html, /aria-label="Anuncios del jardín"/);
        assert.doesNotMatch(html, /cintilla-toggle|cintilla-control|Pausar anuncios/);
        assert.equal((html.match(/<ul class="cintilla-group"/g) ?? []).length, 2);
        assert.match(html, /<ul class="cintilla-group" aria-hidden="true"/);
        assert.equal((html.match(/Reserva la fecha de tu evento/g) ?? []).length, 2);
        assert.equal((html.match(/class="brand-name"/g) ?? []).length, 0);
        assert.equal((html.match(/<a class="brand"[^>]*>/g) ?? []).length, 2);
    });
}

test("El logo es monocromático y compartido entre header y footer", async () => {
    const header = await readFile(new URL("../src/components/Header.astro", import.meta.url), "utf8");
    const footer = await readFile(new URL("../src/components/Footer.astro", import.meta.url), "utf8");

    for (const component of [header, footer]) {
        assert.match(component, /src="\/logo-jardin-sky\.png"/);
        assert.match(component, /brightness-0/);
        assert.match(component, /\[\[data-theme=dark\]_&\]:invert/);
    }
});

test("El favicon usa el emblema del logo y se adapta al tema del sistema", async () => {
    const html = await readPage("index.html");
    const favicon = await readFile(new URL("../dist/favicon.svg", import.meta.url), "utf8");

    assert.match(html, /rel="icon" type="image\/svg\+xml" href="\/favicon\.svg"/);
    assert.match(favicon, /<image class="logo" href="\/logo-jardin-sky\.png"/);
    assert.match(favicon, /prefers-color-scheme: dark/);
    await readFile(new URL("../dist/logo-jardin-sky.png", import.meta.url));
});

test("El favicon ICO contiene imágenes válidas en varias resoluciones", async () => {
    const icon = await readFile(new URL("../dist/favicon.ico", import.meta.url));

    assert.equal(icon.readUInt16LE(0), 0);
    assert.equal(icon.readUInt16LE(2), 1);
    const imageCount = icon.readUInt16LE(4);
    assert.equal(imageCount, 3);

    const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const dimensions = [];
    for (let index = 0; index < imageCount; index++) {
        const entryOffset = 6 + index * 16;
        const width = icon[entryOffset] || 256;
        const height = icon[entryOffset + 1] || 256;
        const imageLength = icon.readUInt32LE(entryOffset + 8);
        const imageOffset = icon.readUInt32LE(entryOffset + 12);

        dimensions.push(`${width}x${height}`);
        assert.deepEqual(icon.subarray(imageOffset, imageOffset + pngSignature.length), pngSignature);
        assert.ok(imageOffset + imageLength <= icon.length);
    }
    assert.deepEqual(dimensions, ["16x16", "32x32", "48x48"]);
});

test("El footer publica Facebook y el crédito de LinkedIn con destinos seguros", async () => {
    const html = await readPage("index.html");
    const footer = await readFile(new URL("../src/components/Footer.astro", import.meta.url), "utf8");
    const socialNav = html.match(/<nav\b[^>]*aria-label="Redes sociales"[^>]*>[\s\S]*?<\/nav>/)?.[0] ?? "";

    assert.match(socialNav, /href="https:\/\/www\.facebook\.com\/profile\.php\?id=61590183835911"[^>]*target="_blank"[^>]*rel="noopener noreferrer"/);
    assert.doesNotMatch(socialNav, /linkedin/i);
    assert.equal((socialNav.match(/<svg\b/g) ?? []).length, 1);
    assert.match(html, /Todos los derechos reservados\. Hecho por <a[^>]*href="https:\/\/www\.linkedin\.com\/in\/jose-toledano-morales\/"[^>]*target="_blank"[^>]*rel="noopener noreferrer"[^>]*>Jose Toledano<\/a>/);
    assert.match(footer, /text-black[^\"]*\[\[data-theme=dark\]_&\]:text-white/);
});

test("Galería: imágenes descriptivas, diferidas y ampliables por teclado", async () => {
    const html = await readPage("galeria/index.html");
    const images = html.match(/<img\b[^>]*class="gallery-image[^\"]*"[^>]*>/g) ?? [];

    assert.equal(images.length, 3);
    for (const image of images) {
        assert.match(image, /alt="[^"]+"/);
        assert.match(image, /loading="lazy"/);
        assert.match(image, /decoding="async"/);
    }
    assert.equal((html.match(/<button\b[^>]*data-gallery-image/g) ?? []).length, 3);
    assert.match(html, /aria-roledescription="carrusel"/);
    assert.equal((html.match(/data-slot="carousel-item"/g) ?? []).length, 3);
    assert.match(html, /data-slot="carousel-previous"/);
    assert.match(html, /data-slot="carousel-next"/);
    assert.match(html, /aria-label="Ver fotografía 1"/);
    assert.match(html, /role="status"/);
});

test("Inicio: el video espera a entrar en pantalla y respeta movimiento reducido", async () => {
    const html = await readPage("index.html");
    const video = html.match(/<video\b[^>]*>/)?.[0] ?? "";

    assert.match(video, /data-lazy-video/);
    assert.match(video, /preload="none"/);
    assert.match(video, /poster="\/uno.webp"/);
    assert.doesNotMatch(video, /\sautoplay(?:\s|>)/);
    assert.match(html, /data-src="\/video2\.mp4"/);
    assert.match(html, /prefers-reduced-motion: reduce/);
});

test("Ubicación: el mapa tiene título y carga diferida", async () => {
    const html = await readPage("ubicacion/index.html");
    const iframe = html.match(/<iframe\b[^>]*>/)?.[0] ?? "";

    assert.match(iframe, /title="Mapa de Jardín de Eventos SKY/);
    assert.match(iframe, /loading="lazy"/);
});

test("Contacto: los campos del formulario tienen etiquetas asociadas", async () => {
    const html = await readPage("contacto/index.html");

    for (const fieldId of ["name", "email", "event_type", "message"]) {
        assert.match(html, new RegExp(`<label[^>]*for="${fieldId}"`));
        assert.match(html, new RegExp(`<(?:input|select|textarea)[^>]*id="${fieldId}"`));
        assert.match(html, new RegExp(`name="${fieldId}"`));
    }
    assert.match(html, /data-slot="input"/);
    assert.match(html, /data-slot="native-select"/);
    assert.match(html, /data-slot="textarea"/);
    assert.match(html, /action="mailto:jardineventosky@gmail.com"/);
    assert.doesNotMatch(html, /action="#"/);
});

test("El video no se incluye en páginas que no son inicio", async () => {
    for (const [, file] of pages.slice(1)) {
        assert.doesNotMatch(await readPage(file), /<video\b/);
    }
});

test("El tema inicia con la preferencia guardada o la del sistema", async () => {
    const html = await readPage("index.html");

    assert.match(html, /localStorage\.getItem\(themeStorageKey\)/);
    assert.match(html, /prefers-color-scheme: dark/);
    assert.match(html, /document\.documentElement\.dataset\.theme = initialTheme/);
});

test("El tema mantiene una superficie diferenciada para header y contenido", async () => {
    const styles = await readFile(new URL("../src/styles/global.css", import.meta.url), "utf8");
    const lightTheme = styles.match(/:root\[data-theme="light"\]\s*\{([^}]+)\}/)?.[1] ?? "";
    const hero = await readFile(new URL("../src/components/Hero.astro", import.meta.url), "utf8");
    const gallery = await readFile(new URL("../src/components/Gallery.astro", import.meta.url), "utf8");

    assert.match(lightTheme, /--color-forest:\s*#e6ede7;/);
    assert.match(lightTheme, /--color-paper:\s*#f4f6f1;/);
    assert.notEqual("#e6ede7", "#f4f6f1");
    assert.match(styles, /--color-background:\s*var\(--color-paper\)/);
    assert.match(hero, /bg-background/);
    assert.match(gallery, /bg-background/);
    for (const file of ["contacto/index.html", "ubicacion/index.html"]) {
        assert.match(await readPage(file), /bg-background/);
    }
});

test("Todos los botones usan las variantes compartidas de shadcn", async () => {
    for (const [, file] of pages) {
        const html = await readPage(file);
        const buttons = html.match(/<button\b[^>]*>/g) ?? [];
        assert.ok(buttons.length > 0);
        for (const button of buttons) {
            assert.match(button, /data-variant="[^"]+"/);
            assert.match(button, /data-size="[^"]+"/);
        }
    }
});
