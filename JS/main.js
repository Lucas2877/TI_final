function cerrarSesion() {
  sessionStorage.removeItem("token");
  window.location.href = "index.html";
}
let botonOscuro = document.getElementById("bot-oscuro");

// Al cargar la página, aplicar el modo guardado
if (localStorage.getItem("modoOscuro") === "true") {
  document.body.classList.add("dark-mode");
  if (botonOscuro) botonOscuro.textContent = "🌞";
}

if (botonOscuro) {
  botonOscuro.addEventListener("click", (e) => {
    document.body.classList.toggle("dark-mode");

    const estaOscuro = document.body.classList.contains("dark-mode");
    botonOscuro.textContent = estaOscuro ? "🌞" : "🌚";

    // Guardar preferencia
    localStorage.setItem("modoOscuro", estaOscuro);
  });
}

const btnLogin = document.getElementById("btnLogin");
const btnSalir = document.getElementById("btnSalir");
const inputUsuario = document.getElementById("usuario");
const inputPassword = document.getElementById("password");
const mensaje = document.getElementById("mensaje");
const togglePassword = document.getElementById("togglePassword");

if (togglePassword && inputPassword) {
  togglePassword.addEventListener("click", function () {

    if (inputPassword.type === "password") {
      inputPassword.type = "text";
      togglePassword.textContent = "🙈";
    } else {
      inputPassword.type = "password";
      togglePassword.textContent = "👁️";
    }

  });
}

const zonaLogin = document.getElementById("zonaLogin");
const zonaBienvenida = document.getElementById("zonaBienvenida");

const nombre = document.getElementById("nombre");
const email = document.getElementById("email");
const foto = document.getElementById("foto");

// Cuando arranca la página, ¿hay un token guardado?
const tokenGuardado = sessionStorage.getItem("token");

if (tokenGuardado) {
  obtenerDatosDelUsuario(tokenGuardado);
}

// Cuando el usuario hace click en "Ingresar"
if (btnLogin) {

  btnLogin.addEventListener("click", function () {

    const datos = {
      username: inputUsuario.value,
      password: inputPassword.value
    };

    fetch("https://dummyjson.com/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    })

      .then(function (respuesta) {

        if (!respuesta.ok) {
          window.location.href = "index.html";
          return;
        }

        return respuesta.json();
      })

      .then(function (data) {

        if (!data) return;

        console.log("Respuesta del login:", data);

        sessionStorage.setItem("token", data.accessToken);

        window.location.href = "admin.html";
      })

      .catch(function (error) {
        mensaje.textContent = error.message;
      });

  });

}

/*
 * Pedir datos del usuario logueado (endpoint protegido)
 * Mandamos el token en el header "Authorization"
 */
function obtenerDatosDelUsuario(token) {

  fetch("https://dummyjson.com/auth/me", {
    method: "GET",
    headers: {
      "Authorization": "Bearer " + token
    }
  })

    .then(function (respuesta) {

      if (!respuesta.ok) {
        throw new Error("Token inválido o vencido");
      }

      return respuesta.json();
    })

    .then(function (data) {
      mostrarBienvenida(data);
    })

    .catch(function (error) {
      console.log("Error:", error.message);
      sessionStorage.removeItem("token");
    });
}

function mostrarBienvenida(data) {

  if (!zonaLogin || !zonaBienvenida) return;

  zonaLogin.hidden = true;
  zonaBienvenida.hidden = false;

  if (nombre) {
    nombre.textContent = data.firstName + " " + data.lastName;
  }

  if (email) {
    email.textContent = data.email;
  }

  if (foto) {
    foto.src = data.image;
  }
}

// cerrar sesión
if (btnSalir) {
  btnSalir.addEventListener("click", cerrarSesion);
}
const btnLoguearse = document.getElementById("btnLoguearse");
const saludoUsuario = document.getElementById("saludoUsuario");
const nombreUsuario = document.getElementById("nombreUsuario");
const btnCerrarSesionIndex = document.getElementById("btnCerrarSesionIndex");

if (btnLoguearse) {
  btnLoguearse.addEventListener("click", function () {
    window.location.href = "login.html";
  });
}

const tokenIndex = sessionStorage.getItem("token");

// Por defecto, asumimos que NO hay sesión
if (saludoUsuario) saludoUsuario.hidden = true;
if (btnCerrarSesionIndex) btnCerrarSesionIndex.hidden = true;
if (btnLoguearse) btnLoguearse.hidden = false;

if (tokenIndex && btnLoguearse && saludoUsuario && btnCerrarSesionIndex) {

  fetch("https://dummyjson.com/auth/me", {
    method: "GET",
    headers: { "Authorization": "Bearer " + tokenIndex }
  })
    .then(function (respuesta) {
      if (!respuesta.ok) throw new Error("Token inválido");
      return respuesta.json();
    })
    .then(function (data) {
      btnLoguearse.hidden = true;
      saludoUsuario.hidden = false;
      btnCerrarSesionIndex.hidden = false;
      nombreUsuario.textContent = data.firstName;
    })
    .catch(function () {
      sessionStorage.removeItem("token");
      saludoUsuario.hidden = true;
      btnCerrarSesionIndex.hidden = true;
      btnLoguearse.hidden = false;
    });
}

if (btnCerrarSesionIndex) {
  btnCerrarSesionIndex.addEventListener("click", cerrarSesion);
}

// FORMULARIO DEL ADMIN

function editarNoticia(index) {

    let noticias = JSON.parse(localStorage.getItem("noticias")) || [];

    let noticia = noticias[index];

    document.getElementById("titulo").value = noticia.titulo;
    document.getElementById("descripcion").value = noticia.descripcion;
    document.getElementById("imagen").value = noticia.imagen;

    noticiaEnEdicion = index;
}
function mostrarNoticiasAdmin() {

    const lista = document.getElementById("listaNoticias");

    if (!lista) return;

    lista.innerHTML = "";

    let noticias = JSON.parse(localStorage.getItem("noticias")) || [];

    // Filtrar noticias vacías o inválidas
    noticias = noticias.filter(noticia => noticia && noticia.titulo && noticia.titulo.trim() !== "");

    noticias.forEach(function (noticia, index) {

        lista.innerHTML += `
        <article>
            <h3>${noticia.titulo}</h3>
            <p>${noticia.descripcion}</p>
            <img src="${noticia.imagen}" width="200">

            <br><br>

            <button id="btnEditar${index}" type="button" onclick="editarNoticia(${index})">
                Editar
            </button>

            <button id="btnEliminar${index}" type="button" onclick="eliminarNoticia(${index})">
                Eliminar
            </button>

            <hr>
        </article>
        `;
    });
}


const noticiasFijas = [
  {
    titulo: "Revelaron el gesto que tuvo Messi con los empleados del predio de AFA tras ganar el Mundial 2022: “Casi un departamento”",
    imagen: "https://www.ole.com.ar/images/2023/02/03/DKvJawqNY_720x0__1.jpg",
    descripcion: "Gerardo Salorio, ex preparador físico de la Selección, contó la actitud que tuvo el astro rosarino con los premios por conseguir la tercera estrella"
  },
  {
    titulo: "Las entradas para el Mundial 2026 son las más caras de la historia: cuánto sale ver a Argentina",
    imagen: "https://www.infobae.com/resizer/v2/BI42W7HBPVHOFMQZ4AJFNTXNI4.jpg?auth=22450d54598fa6d9c1a34ee9a74dccfe7d4f2a2176bd7bc1974c9e92b153e42f&smart=true&width=992&height=558&quality=85",
    descripcion: "Las cifras para conseguir un lugar en los estadios de la Copa del Mundo superan todos los registros anteriores, según una investigación de The Economist, y generan un debate sobre el acceso y el ambiente en los partidos"
  },
  {
    titulo: "El Banco Central acumuló 90 jornadas consecutivas con compras de dólares: sumó más de USD 8.300 millones en 2026",
    imagen: "https://www.infobae.com/resizer/v2/FZIRB5AB5JCOJDWXZH3QII2UWA.JPG?auth=8b0f85374ce99d85f7d31e54fc37cd1462b8a4e9f88980a86ce564721c1275bb&smart=true&width=992&height=659&quality=85",
    descripcion: "La autoridad monetaria compró USD 144 millones este martes y superó el 83% del piso de la meta anual de adquisición de divisas. Las reservas anotaron una leve suba"
  },
  {
    titulo: "Disparidad regional: cuánto pagan de luz y gas los usuarios de cada provincia y por qué la brecha es tan grande",
    imagen: "https://www.infobae.com/resizer/v2/5WEEJ7CX3ZB25GXZSVWXI3ZMUQ.jpg?auth=9d82882bed26811dd99dd22f7e7b1c991d34965d23875a5f546e5e50f9803815&smart=true&width=992&height=558&quality=85",
    descripcion: "Las tarifas varían considerablemente entre las diferentes jurisdicciones, incluso dentro de un mismo segmento de hogares"
  },
  {
    titulo: "Tomar más de tres tazas de café al día podría triplicar el riesgo de daño renal en algunas personas, según un nuevo estudio",
    imagen: "https://www.infobae.com/resizer/v2/EU3PVM2CUFBNRI2CBXEHUREXJY.png?auth=09fe9ce4dcbf7492d44a1e841e87dab135073b75b32a06ea9618c8813fc75900&smart=true&width=992&height=543&quality=85",
    descripcion: "La investigación identificó que el riesgo aumenta especialmente en personas con una variante genética que ralentiza el metabolismo de la cafeína y potencia sus efectos en el organismo"
  },
  {
    titulo: "EEUU alertó sobre un \"golpe de Estado en marcha\" en Bolivia impulsado por sectores ligados al crimen organizado",
    imagen: "https://www.infobae.com/resizer/v2/NNHGH34EWVE7JNI5PWQ2B35V3E.JPG?auth=ae65c55ea24f0a44e0c7a053df95de08a762e94db9c88a519ca4fe0a0616e10e&smart=true&width=992&height=660&quality=85",
    descripcion: "El vicesecretario del Estado estadounidense, Christopher Landau, respaldó al presidente Rodrigo Paz frente a las protestas y denunció que fuerzas “antiinstitucionales” buscan desestabilizar al país"
  }
];

function toggleDescripcion(article)
 {  console.log("toggle ejecutado", article);
    const descripcion = article.querySelector(".descripcion");
    const leerMas = article.querySelector(".leer-mas");

    descripcion.classList.toggle("oculta");

    if (descripcion.classList.contains("oculta")) {
        leerMas.textContent = "Leer más ▼";
    } else {
        leerMas.textContent = "Leer menos ▲";
    }
}
function abrirImagen(src, descripcion) {
  const overlay = document.createElement("div");
  overlay.id = "imagenOverlay";
  overlay.innerHTML = `<img src="${src}"><p>${descripcion}</p>`;
  overlay.addEventListener("click", function() {
    document.body.removeChild(overlay);
  });
  document.body.appendChild(overlay);
}
window.abrirImagen = abrirImagen;

window.toggleDescripcion = toggleDescripcion

function mostrarNoticiasIndex() {

    const contenedor = document.getElementById("noticiasNuevas");

    if (!contenedor) return;

    contenedor.innerHTML = "";

    let noticiasGuardadas = JSON.parse(localStorage.getItem("noticias")) || [];

    let todasLasNoticias = noticiasFijas.concat(noticiasGuardadas);

    todasLasNoticias.forEach(function(noticia) {
    contenedor.innerHTML += `
        <article onclick="toggleDescripcion(this)">
            <h2>${noticia.titulo}</h2>
            <img src="${noticia.imagen}" onclick="abrirImagen('${noticia.imagen}', '${noticia.descripcion}')">
            <p class="descripcion oculta">${noticia.descripcion}</p>
            <span class="leer-mas">Leer más ▼</span>
        </article>
    `;
});
}

mostrarNoticiasIndex();

function eliminarNoticia(index) {

    let noticias = JSON.parse(localStorage.getItem("noticias")) || [];

    noticias.splice(index, 1);

    localStorage.setItem("noticias", JSON.stringify(noticias));

    mostrarNoticiasAdmin();
}

let noticiaEnEdicion = null;

window.editarNoticia = editarNoticia;
window.eliminarNoticia = eliminarNoticia;


  const formNoticia = document.getElementById("formNoticia");

    if (formNoticia) 

    formNoticia.addEventListener("submit", function(e) {
    e.preventDefault();
    
    let titulo = document.getElementById("titulo").value.trim();
    let descripcion = document.getElementById("descripcion").value.trim();
    let imagen = document.getElementById("imagen").value.trim();

    // Validar que no esté vacío
    if (!titulo || !imagen) {
        alert("Título e Imagen son requeridos");
        return;
    }

    let noticias = JSON.parse(localStorage.getItem("noticias")) || [];
    
    let noticia = {
        titulo: titulo,
        descripcion: descripcion,
        imagen: imagen
    };
    
    if (noticiaEnEdicion !== null) {
        noticias[noticiaEnEdicion] = noticia;
        noticiaEnEdicion = null;
    } else {
        noticias.push(noticia);
    }
    
    localStorage.setItem("noticias", JSON.stringify(noticias));
    
    document.getElementById("formNoticia").reset();
    mostrarNoticiasAdmin();
});

const btnCerrarSesion = document.getElementById("btnCerrarSesion");

if (btnCerrarSesion) {
  btnCerrarSesion.addEventListener("click", cerrarSesion);
}

mostrarNoticiasAdmin();
const linkAdmin = document.getElementById("linkAdmin");

if (linkAdmin) {

  linkAdmin.addEventListener("click", function(e) {

    e.preventDefault();

    const token = sessionStorage.getItem("token");

    if (token) {
      window.location.href = "admin.html";
    } else {
      window.location.href = "login.html";
    }

  });

}
const btnIrAdmin = document.getElementById("btnIrAdmin");

if (btnIrAdmin) {
  btnIrAdmin.addEventListener("click", function() {
    window.location.href = "admin.html";
  });
}

//BARRA DE MONEDAS//

function cargarTicker() {
  const apiKey = "9551f1133fa6213b27214563";

  const promiseBluelytics = fetch("https://api.bluelytics.com.ar/v2/latest")
    .then(r => r.json());

  const promiseExchange = fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`)
    .then(r => r.json());

  Promise.all([promiseBluelytics, promiseExchange])
    .then(function([blue, exchange]) {

      const usdToArs = exchange.conversion_rates.ARS;

      const items = [
        { nombre: "🇺🇸 💵 DÓLAR BLUE", compra: blue.blue.value_buy, venta: blue.blue.value_sell },
        { nombre: "🇺🇸 💵 DÓLAR OFICIAL", compra: blue.oficial.value_buy, venta: blue.oficial.value_sell },
        { nombre: "🇪🇺 💶 EURO BLUE", compra: blue.blue_euro.value_buy, venta: blue.blue_euro.value_sell },
        { nombre: "🇪🇺 💶 EURO OFICIAL", compra: blue.oficial_euro.value_buy, venta: blue.oficial_euro.value_sell },
        { nombre: "🇬🇧 💷 LIBRA ESTERLINA", compra: (usdToArs / exchange.conversion_rates.GBP).toFixed(2), venta: ((usdToArs / exchange.conversion_rates.GBP) * 1.02).toFixed(2) },
        { nombre: "🇧🇷 🪙 REAL BRASILEÑO", compra: (usdToArs / exchange.conversion_rates.BRL).toFixed(2), venta: ((usdToArs / exchange.conversion_rates.BRL) * 1.02).toFixed(2) },
        { nombre: "🇨🇱 🪙 PESO CHILENO", compra: (usdToArs / exchange.conversion_rates.CLP).toFixed(2), venta: ((usdToArs / exchange.conversion_rates.CLP) * 1.02).toFixed(2) },
        { nombre: "🇺🇾 🪙 PESO URUGUAYO", compra: (usdToArs / exchange.conversion_rates.UYU).toFixed(2), venta: ((usdToArs / exchange.conversion_rates.UYU) * 1.02).toFixed(2) },
        { nombre: "🇯🇵 💴 YEN JAPONÉS", compra: (usdToArs / exchange.conversion_rates.JPY).toFixed(2), venta: ((usdToArs / exchange.conversion_rates.JPY) * 1.02).toFixed(2) },
      ];

      const ticker = document.getElementById("tickerContenido");
      if (!ticker) return;

      const contenido = items.map(item => `
  <span class="ticker-item">
    ${item.nombre} — Compra: <span>$${item.compra}</span> | Venta: <span>$${item.venta}</span>
  </span>
`).join("&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;");

ticker.innerHTML = `
  <span class="ticker-loop">${contenido}</span>
  <span class="ticker-loop">${contenido}</span>
`;

    })
    .catch(() => {
      const ticker = document.getElementById("tickerContenido");
      if (ticker) ticker.textContent = "No se pudo cargar la cotización.";
    });
}

cargarTicker();

const formContacto = document.getElementById("formContacto");

if (formContacto) {
  formContacto.addEventListener("submit", function(e) {
    e.preventDefault();

    document.getElementById("contactoNombre").value = "";
    document.getElementById("contactoEmail").value = "";
    document.getElementById("contactoMensaje").value = "";
    document.getElementById("mensajeContacto").textContent = "¡Mensaje enviado! Gracias por contactarnos.";
    document.getElementById("mensajeContacto").style.color = "#4cd964";
  });
}