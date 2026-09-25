window.COURSE_DATA = {
  "modules": [
    {
      "id": "00",
      "name": "Introducción",
      "status": "ready",
      "title": "Qué es RAG y cuándo usarlo",
      "lead": "Antes de tocar Colab, entendemos el problema que estamos intentando resolver.",
      "body": "\n<h2>Qué es RAG</h2>\n<p><strong>RAG</strong> significa <em>Retrieval-Augmented Generation</em>. La idea es: primero buscamos en nuestros documentos y después le damos al LLM solamente los fragmentos relevantes para que responda con ellos.</p>\n<div class=\"diagram\"><span>Documentos</span><b>→</b><span>buscar</span><b>→</b><span>fragmentos relevantes</span><b>→</b><span>LLM</span><b>→</b><span>respuesta</span></div>\n<p>El modelo no “aprende” AcmeCloud. Recibe ese contexto en cada consulta.</p>\n\n<h2>El caso del curso: AcmeCloud</h2>\n<p>Vamos a construir <strong>AcmeCloud IT Assistant</strong>, un asistente interno que responde sobre aplicaciones corporativas, políticas IT y troubleshooting.</p>\n<div class=\"callout\"><strong>Ejemplo:</strong> “¿Qué hago con el error VPN-1047?” El sistema deberá encontrar el procedimiento interno y responder desde ese documento, no desde conocimiento genérico.</div>\n\n<h2>Cuándo sí usar RAG</h2>\n<ul><li>Documentación interna y manuales.</li><li>Información privada o cambiante.</li><li>Cuando necesitás citar la fuente.</li><li>Cuando el corpus es demasiado grande para enviarlo entero al modelo.</li><li>Cuando la documentación interna contradice lo que el modelo cree saber.</li></ul>\n\n<h2>Cuándo no</h2>\n<ul><li>Si todo cabe cómodamente en el contexto, puede ser mejor enviarlo directamente.</li><li>Para cambiar estilo o formato: prompting/fine-tuning.</li><li>Para preguntas agregadas como “¿cuántos sistemas usan MFA?”: suele ser un problema de SQL o procesamiento estructurado.</li><li>Para razonar sobre un documento completo si RAG solo trae fragmentos.</li></ul>\n\n<h2>La dificultad real</h2>\n<p>Un prototipo de RAG es fácil. Lo difícil es producción: <strong>trocear bien, recuperar el fragmento correcto, medir, controlar permisos y evitar respuestas inventadas</strong>.</p>\n\n<h2>Cómo vamos a aprender</h2>\n<div class=\"cycle\"><span>Concepto</span><b>→</b><span>Experimento</span><b>→</b><span>Fallo intencional</span><b>→</b><span>Diagnóstico</span><b>→</b><span>Solución</span></div>\n<p>No agregamos piezas porque “la arquitectura dice que van”. Las agregamos cuando ya vimos un fallo que justifican.</p>\n",
      "notebook": null,
      "quiz": [
        [
          "¿Qué parte de RAG ocurre primero?",
          "Buscar fragmentos relevantes",
          "Generar la respuesta",
          "Entrenar el modelo"
        ],
        [
          "¿RAG reentrena el LLM con tus documentos?",
          "No",
          "Sí",
          "Solo en Colab"
        ]
      ]
    },
    {
      "id": "01",
      "name": "Embeddings",
      "status": "ready",
      "title": "Embeddings y similitud coseno",
      "lead": "¿Cómo puede una computadora encontrar dos textos relacionados aunque no compartan las mismas palabras?",
      "body": "\n<h2>El concepto</h2>\n<p>Un <strong>embedding</strong> convierte texto en una lista de números. Textos con significado parecido deberían quedar cerca en ese espacio numérico.</p>\n<pre><code>\"VPN\"             → [0.82, 0.14, -0.33, ...]\n\"acceso remoto\"   → [0.79, 0.19, -0.30, ...]\n\"factura\"         → [-0.11, 0.90, 0.42, ...]</code></pre>\n<p>En RAG hacemos embeddings de los documentos y de la pregunta. Luego buscamos qué vectores se parecen más.</p>\n\n<h2>Error plantado 1: modelo incorrecto</h2>\n<p>Primero usamos un modelo inadecuado para español. No esperamos un error de Python: esperamos algo peor, un sistema que <em>parece funcionar</em> pero ordena mal.</p>\n<div class=\"callout warn\"><strong>Lección:</strong> los fallos de embeddings pueden ser silenciosos.</div>\n\n<h2>El score no lo calcula el modelo</h2>\n<p>El modelo produce vectores. La <strong>similitud coseno</strong> es una fórmula matemática que compara su dirección. No existe una regla universal “0.7 = relevante”.</p>\n\n<h2>Error plantado 2: imprevisibilidad</h2>\n<p>Un embedding puede acertar una relación semántica difícil y fallar una relación aparentemente obvia. Por eso más adelante mediremos el sistema en vez de confiar en intuición.</p>\n\n<h2>La dilución</h2>\n<p>Cuando un texto crece, el concepto puntual que buscamos puede perder peso dentro del embedding. Esto anticipa el problema del <strong>chunking</strong>: un fragmento enorme puede contener la respuesta exacta y aun así no recuperarse bien.</p>\n",
      "notebook": "01_embeddings.ipynb",
      "quiz": [
        [
          "¿Qué produce el modelo de embeddings?",
          "Vectores",
          "Scores de relevancia",
          "Respuestas finales"
        ],
        [
          "¿Un score alto garantiza una respuesta correcta?",
          "No",
          "Sí",
          "Solo con BM25"
        ]
      ]
    },
    {
      "id": "02",
      "name": "Primer RAG",
      "status": "ready",
      "title": "Primer RAG completo, sin framework",
      "lead": "Construimos el mínimo sistema completo para ver exactamente dónde aparece el LLM.",
      "body": "\n<h2>El mapa mental</h2>\n<div class=\"pipeline\">\n<div><small>una vez</small><strong>Documentos → chunks → embeddings → índice</strong></div>\n<div><small>cada consulta</small><strong>Pregunta → embedding → buscar → top-k → LLM → respuesta</strong></div>\n</div>\n<p>El LLM aparece <strong>al final</strong>. Si recuperamos el fragmento equivocado, un modelo más grande no arregla el problema.</p>\n\n<h2>Primer fallo: código exacto</h2>\n<p>Probamos “¿Qué significa VPN-1047?”. El vectorial puede preferir textos generales sobre VPN y acceso remoto porque busca parecido semántico, no coincidencia exacta.</p>\n\n<h2>Segundo fallo: pregunta agregada</h2>\n<p>Preguntamos “¿Cuántos sistemas usan MFA?”. Si el RAG solo trae cuatro chunks, el LLM no conoce el resto del catálogo. Puede responder correctamente sobre lo que vio y ser globalmente falso.</p>\n<div class=\"callout danger\"><strong>Lección:</strong> RAG confunde fácilmente “lo que recuperé” con “todo lo que existe”. Preguntas de conteo, máximo, mínimo o “lista todos” suelen necesitar otro mecanismo.</div>\n\n<h2>El fallo controlado</h2>\n<p>Una buena respuesta de RAG no es siempre una respuesta. Si los fragmentos no contienen la información, el comportamiento deseado es decir “no encuentro esa información”.</p>\n",
      "notebook": "02_primer_rag.ipynb",
      "quiz": [
        [
          "Si el fragmento correcto no llega al LLM, ¿dónde está el problema?",
          "Retrieval",
          "Generación",
          "Temperatura"
        ],
        [
          "¿Por qué “¿cuántos sistemas usan MFA?” es peligrosa para top-k RAG?",
          "Porque solo ve algunos chunks",
          "Porque MFA no puede indexarse",
          "Porque BM25 no cuenta"
        ]
      ]
    },
    {
      "id": "03",
      "name": "Chunking",
      "status": "ready",
      "title": "Chunking: cortar sin fabricar información",
      "lead": "Dividir documentos no es una tarea cosmética: un mal corte puede alterar el significado.",
      "body": "\n<h2>El error ingenuo</h2>\n<p>Primero cortamos el catálogo cada N caracteres. Un chunk puede terminar con datos de una aplicación y comenzar con el encabezado de otra.</p>\n<pre><code>... Owner: Finance IT\n\n### CRM-PROD\nSistema: Salesforce\n...</code></pre>\n<p>Un LLM no sabe que ese “Owner” pertenece a la ficha anterior.</p>\n\n<h2>La solución</h2>\n<p>Si el documento ya tiene estructura, la usamos. En nuestro catálogo cada ficha empieza con <code>###</code>. La prosa se puede agrupar por párrafos.</p>\n\n<h2>Lo que chunking sí y no arregla</h2>\n<p>El chunking estructural mejora la <strong>integridad</strong> del fragmento. No garantiza que dos fichas muy parecidas se distingan bien en embeddings. Ese es otro problema.</p>\n\n<h2>La tensión</h2>\n<p>Chunks pequeños suelen recuperarse mejor, pero pierden contexto. Chunks grandes conservan contexto, pero diluyen conceptos. No hay una medida universal: se resuelve midiendo.</p>\n",
      "notebook": "03_chunking.ipynb",
      "quiz": [
        [
          "¿Cuál es la prioridad del chunking estructural?",
          "Mantener integridad semántica",
          "Maximizar cantidad de chunks",
          "Hacer todos los chunks iguales"
        ],
        [
          "¿Existe un tamaño universal perfecto de chunk?",
          "No",
          "Sí: 500 caracteres",
          "Sí: 1.000 tokens"
        ]
      ]
    },
    {
      "id": "04",
      "name": "Búsqueda híbrida",
      "status": "ready",
      "title": "Búsqueda híbrida: BM25 + vectorial",
      "lead": "Los embeddings entienden significado; BM25 protege los términos exactos.",
      "body": "\n<h2>Por qué el vectorial falla</h2>\n<p>Para una consulta como <code>VPN-1047</code>, el embedding puede asociar “VPN”, “acceso remoto”, “conexión”, etc. Esa semántica es útil, pero el código exacto es la señal más discriminante.</p>\n\n<h2>BM25</h2>\n<p>BM25 no “entiende” el texto. Cuenta términos con ponderaciones: las palabras raras pesan más, las repeticiones tienen rendimiento decreciente y los documentos largos reciben una corrección.</p>\n<div class=\"compare\"><div><strong>Vectorial</strong><br>sinónimos, significado, paráfrasis</div><div><strong>BM25</strong><br>IDs, códigos, siglas, SKUs, nombres exactos</div></div>\n\n<h2>No elegir: combinar</h2>\n<p>Usamos <strong>Reciprocal Rank Fusion (RRF)</strong>. No suma scores incompatibles; fusiona posiciones de ranking.</p>\n<pre><code>vectorial ─┐\n           ├─ RRF → candidatos\nBM25 ──────┘</code></pre>\n\n<h2>Otro fallo importante</h2>\n<p>Ninguno de los dos buscadores sabe por sí solo decir “no hay respuesta”. Siempre puede devolver “lo mejor de lo malo”. Eso se controlará con generación, evaluación y diseño del sistema.</p>\n",
      "notebook": "04_busqueda_hibrida.ipynb",
      "quiz": [
        [
          "¿Qué herramienta es especialmente buena para VPN-1047?",
          "BM25",
          "Solo embeddings",
          "Temperatura 0"
        ],
        [
          "¿Por qué usamos RRF?",
          "Porque los scores de BM25 y vectorial no son comparables directamente",
          "Porque crea embeddings",
          "Porque elimina chunks"
        ]
      ]
    },
    {
      "id": "04b",
      "name": "Reranking",
      "status": "ready",
      "title": "Reranking con cross-encoder",
      "lead": "El retriever busca candidatos. El reranker los juzga con mucha más precisión.",
      "body": "\n<h2>Bi-encoder vs cross-encoder</h2>\n<p>El embedding del documento se calcula sin conocer la pregunta futura. Eso permite indexar millones de textos. El cross-encoder recibe <strong>pregunta y documento juntos</strong> y puede juzgar si ese documento realmente responde.</p>\n\n<h2>El reranker no busca</h2>\n<div class=\"diagram\"><span>1M docs</span><b>→</b><span>retrieval rápido</span><b>→</b><span>20 candidatos</span><b>→</b><span>reranker</span><b>→</b><span>4 mejores</span></div>\n<p>Si el chunk correcto no entra en los candidatos, el reranker jamás lo verá.</p>\n\n<h2>El coste</h2>\n<p>Es más lento porque calcula una puntuación nueva para cada par pregunta-documento. Por eso se aplica a pocos candidatos.</p>\n\n<h2>La pregunta importante</h2>\n<p>Que el ranking mejore no significa que la respuesta final mejore. Si el LLM ya recibía los chunks correctos, pagar más latencia puede no aportar nada. Más adelante esto se decide con evaluación.</p>\n",
      "notebook": "04b_reranking.ipynb",
      "quiz": [
        [
          "¿El reranker recupera documentos desde el índice?",
          "No",
          "Sí",
          "Solo BM25"
        ],
        [
          "Si el chunk correcto no está entre los candidatos, ¿puede rescatarlo?",
          "No",
          "Sí",
          "Solo con GPU"
        ]
      ]
    },
    {
      "id": "05",
      "name": "Evaluación",
      "status": "planned",
      "title": "Evaluación: medir en vez de intuir",
      "lead": "Módulo pendiente en el material original.",
      "body": "\n<div class=\"planned\"><strong>Estado: pendiente.</strong> Esta sección mantiene el alcance previsto del curso original y no agrega una lección inventada.</div>\n<h2>Contenido previsto</h2>\n<ul>\n<li>Construir un set de 30–50 preguntas con respuesta conocida.</li>\n<li>Medir <strong>recall@k</strong>: ¿en qué puesto queda el chunk correcto?</li>\n<li>Medir fidelidad de la respuesta al contexto.</li>\n<li>Comparar híbrido vs. híbrido + reranking con números.</li>\n<li>Detectar preguntas que RAG no puede responder antes de intentarlo.</li>\n</ul>\n<p>La idea central es que sin evaluación, “mejorar” el sistema es solo una impresión.</p>\n",
      "notebook": null,
      "quiz": []
    },
    {
      "id": "06",
      "name": "Prompt y citas",
      "status": "planned",
      "title": "Prompt, citas y control de alucinaciones",
      "lead": "Módulo pendiente en el material original.",
      "body": "\n<div class=\"planned\"><strong>Estado: pendiente.</strong> Conservamos el roadmap del curso original.</div>\n<h2>Contenido previsto</h2>\n<ul>\n<li>Responder exclusivamente con lo recuperado.</li>\n<li>Admitir “no sé” de forma fiable.</li>\n<li>Citas verificables: que la cita corresponda realmente al fragmento.</li>\n<li>Qué hacer cuando dos fuentes se contradicen.</li>\n</ul>\n",
      "notebook": null,
      "quiz": []
    },
    {
      "id": "07",
      "name": "Producción",
      "status": "planned",
      "title": "Producción",
      "lead": "Módulo pendiente en el material original.",
      "body": "\n<div class=\"planned\"><strong>Estado: pendiente.</strong> Conservamos el roadmap del curso original.</div>\n<h2>Contenido previsto</h2>\n<ul>\n<li>Base de datos vectorial e índices aproximados.</li>\n<li>Actualización incremental.</li>\n<li>Permisos por usuario antes del retrieval.</li>\n<li>Costes y latencia.</li>\n<li>Stemming para español en BM25.</li>\n</ul>\n",
      "notebook": null,
      "quiz": []
    }
  ]
};
