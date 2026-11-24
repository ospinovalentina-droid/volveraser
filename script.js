/* Fundación Volver a ser · Interactividad de la página */
(function () {
  "use strict";
  const $ = (s, o = document) => o.querySelector(s);
  const $$ = (s, o = document) => [...o.querySelectorAll(s)];

  /* 1. MENÚ MÓVIL */
  const menu = $("#menu"), botonMenu = $("#menuBoton");
  function cerrarMenu() { menu.classList.remove("abierto"); botonMenu.setAttribute("aria-expanded", "false"); }
  botonMenu.addEventListener("click", () => {
    const abierto = menu.classList.toggle("abierto");
    botonMenu.setAttribute("aria-expanded", abierto);
  });
  $$("a", menu).forEach(a => a.addEventListener("click", cerrarMenu));

  /* 2. ENCABEZADO CON SOMBRA, BOTÓN "ARRIBA" Y ENLACE ACTIVO */
  const encabezado = $("#encabezado"), arriba = $("#arriba");
  window.addEventListener("scroll", () => {
    encabezado.classList.toggle("sombra", window.scrollY > 10);
    arriba.classList.toggle("visible", window.scrollY > 600);
  }, { passive: true });
  arriba.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  const enlaces = $$(".menu a:not(.menu-cta)");
  const observadorMenu = new IntersectionObserver(entradas => {
    entradas.forEach(e => {
      if (e.isIntersecting) enlaces.forEach(a => a.classList.toggle("activo", a.getAttribute("href") === "#" + e.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  ["inicio", "nosotros", "servicios", "recursos", "promociones", "calculadora"].forEach(id => { const s = document.getElementById(id); if (s) observadorMenu.observe(s); });

  /* 3. APARICIÓN SUAVE AL HACER SCROLL */
  const observadorReveal = new IntersectionObserver(entradas => {
    entradas.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); observadorReveal.unobserve(e.target); } });
  }, { threshold: 0.12 });
  $$(".reveal").forEach(el => observadorReveal.observe(el));

  /* 4. FILTRO DE RECURSOS */
  $$(".filtro").forEach(btn => btn.addEventListener("click", () => {
    $$(".filtro").forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");
    const tema = btn.dataset.filtro;
    $$(".recurso").forEach(r => r.classList.toggle("oculto", tema !== "todos" && r.dataset.tema !== tema));
  }));

  /* 5. VENTANA DE DETALLE DE SERVICIOS */
  const servicios = {
    biblioteca: { titulo: "Biblioteca digital", precio: "Gratuito", img: "img/biblioteca.svg",
      desc: "Materiales breves y fáciles de leer sobre bienestar emocional. Es contenido educativo, no diagnóstico.",
      lista: ["Autocuidado y pausas en el día a día", "Manejo cotidiano del estrés", "Hábitos saludables", "Cuándo buscar ayuda profesional"] },
    talleres: { titulo: "Talleres comunitarios", precio: "Gratuito o subsidiado", img: "img/talleres.svg",
      desc: "Encuentros psicoeducativos facilitados con aliados idóneos para aprender y compartir en comunidad.",
      lista: ["Bienestar emocional y comunicación", "Redes de apoyo", "Habilidades para la vida", "Espacios cercanos y respetuosos"] },
    rutas: { titulo: "Orientación sobre rutas de apoyo", precio: "Gratuito", img: "img/rutas.svg",
      desc: "Información para identificar servicios y canales institucionales o profesionales y facilitar la búsqueda de atención adecuada.",
      lista: ["Cómo identificar servicios disponibles", "Canales institucionales y profesionales", "Primeros pasos para pedir apoyo", "En urgencias: llama al 123"] }
  };
  const modal = $("#modal");
  function abrirModal(clave) {
    const s = servicios[clave]; if (!s) return;
    $("#modalImg").src = s.img; $("#modalImg").alt = s.titulo;
    $("#modalTitulo").textContent = s.titulo; $("#modalPrecio").textContent = s.precio; $("#modalDesc").textContent = s.desc;
    $("#modalLista").innerHTML = s.lista.map(i => "<li>" + i + "</li>").join("");
    modal.hidden = false; document.body.style.overflow = "hidden"; $("#modalCerrar").focus();
  }
  function cerrarModal() { modal.hidden = true; document.body.style.overflow = ""; }
  $$("[data-servicio]").forEach(b => b.addEventListener("click", () => abrirModal(b.dataset.servicio)));
  $("#modalCerrar").addEventListener("click", cerrarModal);
  $("#modalContacto").addEventListener("click", cerrarModal);
  modal.addEventListener("click", e => { if (e.target === modal) cerrarModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !modal.hidden) cerrarModal(); });

  /* 6. CALCULADORA DE APORTES */
  const cop = n => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
  const num = id => parseFloat($("#" + id).value);
  function pulso(el) { el.classList.add("pulso"); setTimeout(() => el.classList.remove("pulso"), 300); }

  $("#formCalc").addEventListener("submit", e => {
    e.preventDefault();
    const campos = ["participantes", "aporte", "costo", "presupuesto"];
    let valido = true;
    campos.forEach(id => {
      const v = num(id), malo = isNaN(v) || v < 0 || (id === "participantes" && v < 1);
      $("#" + id).classList.toggle("error", malo);
      if (malo) valido = false;
    });
    const msg = $("#rMensaje");
    if (!valido) { msg.textContent = "Revisa los campos marcados: completa todos los datos con números válidos."; return; }

    const aportes = num("participantes") * num("aporte");
    const recursos = aportes + num("presupuesto");
    const costo = num("costo");
    const actividad = $("#actividad").value || "Actividad sin seleccionar";
    $("#rActividad").textContent = actividad;
    $("#rAportes").textContent = cop(aportes);
    $("#barra").style.width = Math.min(100, costo > 0 ? (recursos / costo) * 100 : 100) + "%";

    if (recursos >= costo) {
      $("#rEtqFinal").textContent = "Excedente para objetivos sociales";
      $("#rFinal").textContent = cop(recursos - costo);
      msg.textContent = "¡El costo queda cubierto! El excedente se destinaría a los objetivos sociales de la fundación.";
    } else {
      const faltante = costo - recursos;
      $("#rEtqFinal").textContent = "Faltante por cubrir";
      $("#rFinal").textContent = cop(faltante);
      msg.textContent = "Faltan recursos. Cada persona tendría que aportar " + cop(Math.ceil(faltante / num("participantes")) + num("aporte")) + " para cubrir el costo, o se buscarían aliados.";
    }
    pulso($("#rAportes")); pulso($("#rFinal"));
  });

  $("#ejemplo").addEventListener("click", () => {
    $("#actividad").selectedIndex = 1;
    $("#participantes").value = 20; $("#aporte").value = 5000; $("#costo").value = 150000; $("#presupuesto").value = 80000;
    $("#formCalc").requestSubmit();
  });

  /* 7. FORMULARIO DE CONTACTO (demostrativo: no envía datos) */
  $("#formContacto").addEventListener("submit", e => {
    e.preventDefault();
    const nombre = $("#nombre"), correo = $("#correo"), mensaje = $("#mensaje"), estado = $("#estadoForm");
    const okCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.value.trim());
    nombre.classList.toggle("error", !nombre.value.trim());
    correo.classList.toggle("error", !okCorreo);
    mensaje.classList.toggle("error", !mensaje.value.trim());
    if (!nombre.value.trim() || !okCorreo || !mensaje.value.trim()) {
      estado.className = "estado-form mal"; estado.textContent = "Completa tu nombre, un correo válido y tu mensaje."; return;
    }
    estado.className = "estado-form ok";
    estado.textContent = "¡Gracias, " + nombre.value.trim() + "! Mensaje recibido (demostración: no se envían datos).";
    e.target.reset();
  });
})();
