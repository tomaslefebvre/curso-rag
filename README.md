# Curso RAG desde cero · AcmeCloud

Sitio estático para GitHub Pages. No necesita servidor ni build.

## Qué incluye

- Curso navegable por módulos
- Progreso guardado en el navegador (`localStorage`)
- Quizzes cortos
- Enlaces a notebooks de Google Colab
- Corpus ficticio de soporte IT
- Módulos 5, 6 y 7 marcados como pendientes, igual que en el material fuente

## 1. Subir a GitHub

Creá un repositorio llamado, por ejemplo:

`curso-rag-acmecloud`

Copiá todos los archivos de esta carpeta al repositorio y hacé commit en la rama `main`.

## 2. Configurar tu usuario (opcional en GitHub Pages)

Si lo publicás con la URL estándar `usuario.github.io/repositorio/`, la web intenta detectar automáticamente usuario y repo. Si querés dejarlo explícito o usás un dominio especial, editá `config.js`:

```js
window.COURSE_CONFIG = {
  githubOwner: "TU_USUARIO",
  githubRepo: "curso-rag-acmecloud",
  githubBranch: "main"
};
```

Cambiá `TU_USUARIO` por tu usuario real de GitHub. Esto hace funcionar los botones **Abrir ejercicio en Colab**.

## 3. Activar GitHub Pages

En el repositorio:

1. Settings
2. Pages
3. Build and deployment → Source: **Deploy from a branch**
4. Branch: `main`
5. Folder: `/ (root)`
6. Save

GitHub te mostrará la URL publicada.

## 4. Probar localmente

Podés abrir `index.html` directamente. Para una prueba más fiel a GitHub Pages, también podés servir la carpeta con cualquier servidor HTTP local.

## Nota sobre progreso

El progreso se guarda en el navegador. No se sincroniza entre dispositivos. GitHub Pages no incluye usuarios ni base de datos.

## Estructura

```text
.
├── index.html
├── style.css
├── app.js
├── config.js
├── course-data.js
├── corpus/
│   ├── catalogo_sistemas.txt
│   ├── politicas_it.txt
│   └── manual_soporte.txt
└── notebooks/
    ├── 01_embeddings.ipynb
    ├── 02_primer_rag.ipynb
    ├── 03_chunking.ipynb
    ├── 04_busqueda_hibrida.ipynb
    └── 04b_reranking.ipynb
```
