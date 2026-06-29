const CONFIG = {
  // Nombre del producto principal que aparece en titulos, botones y mensajes.
  productName: "CLEAN PRO – El destructor definitivo de grasa y óxido para parrillas",

  // Precios de los combos. Cambia solo los numeros, sin puntos ni comas.
  priceOne: 149000,
  pricePackTwo: 249000,
  pricePackThree: 329000,
  previousPrice: 199000,

  // Numero de WhatsApp en formato internacional, sin +, espacios ni guiones.
  whatsapp: "595972738779",

  // Nombre de tu tienda o marca.
  storeName: "VGSHOP PY",

  // Ruta del logo. Guarda tu logo como assets/logo.png o cambia esta ruta.
  logoPath: "assets/logo.png",

  // Ubicacion que aparece en algunos textos del sitio.
  cityCountry: "Paraguay",

  // Stock inicial que se muestra al visitante.
  initialStock: 18,

  // Supabase: pega aqui los datos de tu proyecto.
  // IMPORTANTE: usa la anon public key, nunca la service_role key.
  supabaseUrl: "https://roruinqorwgolcrhhmpm.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvcnVpbnFvcndnb2xjcmhobXBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NTU0MDcsImV4cCI6MjA5ODIzMTQwN30.VzNSqYUM6amTOToZUsJ7Emjapy-y9Y44hDmbC1XG9Eg",
  supabaseTable: "cleanpro",

  // Imagenes del producto. Guarda tus fotos en la carpeta assets con estos nombres.
  productImages: [
    "assets/producto-1.jpg",
    "assets/producto-2.jpg",
    "assets/producto-3.jpg"
  ]
};

const combos = [
  // Edita aqui el nombre, cantidad, precio y texto de ahorro de cada combo.
  { id: "one", name: "1 unidad", quantity: 1, price: CONFIG.priceOne, previous: CONFIG.previousPrice, tag: "", saving: "Ideal para probar" },
  { id: "two", name: "Pack 2 unidades", quantity: 2, price: CONFIG.pricePackTwo, previous: CONFIG.previousPrice * 2, tag: "Más popular", saving: "Ahorrás más por unidad" },
  { id: "three", name: "Pack 3 unidades", quantity: 3, price: CONFIG.pricePackThree, previous: CONFIG.previousPrice * 3, tag: "Mejor precio", saving: "Máximo ahorro del día" }
];

let selectedCombo = combos[0];
let currentStock = CONFIG.initialStock;
let currentViewers = 27;
let timerSeconds = 15 * 60;
let selectedMapLink = "";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
const money = (value) => `Gs. ${Number(value).toLocaleString("es-PY")}`;

function initContent() {
  // Carga automaticamente los datos de CONFIG dentro del HTML.
  $$("[data-product-name]").forEach((el) => { el.textContent = CONFIG.productName; });
  $$("[data-store-name]").forEach((el) => { el.textContent = CONFIG.storeName; });
  $$("[data-store-logo]").forEach((el) => {
    if (!CONFIG.logoPath) return;

    el.src = CONFIG.logoPath;
    el.alt = CONFIG.storeName;
    el.onerror = () => { el.hidden = true; };
    el.hidden = false;
  });
  $$("[data-whatsapp-phone]").forEach((el) => { el.textContent = `+${CONFIG.whatsapp}`; });
  $("#mainImage").src = CONFIG.productImages[0];
  $("#checkoutImage").src = CONFIG.productImages[0];
}

function renderGallery() {
  // Genera las miniaturas de la galeria usando CONFIG.productImages.
  const gallery = $("#thumbGallery");
  gallery.innerHTML = CONFIG.productImages.map((image, index) => `
    <button type="button" class="${index === 0 ? "active" : ""}" aria-label="Ver imagen ${index + 1}">
      <img src="${image}" alt="Imagen ${index + 1} de ${CONFIG.productName}" loading="lazy">
    </button>
  `).join("");

  gallery.querySelectorAll("button").forEach((button, index) => {
    button.addEventListener("click", () => {
      $("#mainImage").src = CONFIG.productImages[index];
      gallery.querySelectorAll("button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
    });
  });
}

function renderCombos() {
  // Dibuja las tarjetas de combos y calcula el porcentaje de descuento.
  const list = $("#comboList");
  list.innerHTML = combos.map((combo) => {
    const discount = Math.round((1 - combo.price / combo.previous) * 100);
    return `
      <button type="button" class="combo-card ${combo.id === selectedCombo.id ? "active" : ""}" data-combo="${combo.id}">
        ${combo.tag ? `<span class="combo-tag">${combo.tag}</span>` : ""}
        <div>
          <h3>${combo.name}</h3>
          <small>${combo.saving}</small>
          <span class="discount">${discount}% OFF</span>
        </div>
        <div class="combo-price">
          <strong>${money(combo.price)}</strong>
          <del>${money(combo.previous)}</del>
        </div>
      </button>
    `;
  }).join("");

  list.querySelectorAll(".combo-card").forEach((card) => {
    card.addEventListener("click", () => {
      selectedCombo = combos.find((combo) => combo.id === card.dataset.combo);
      renderCombos();
      updateOrderUI();
    });
  });
}

function updateOrderUI() {
  // Actualiza precios, resumen y barra movil cuando el cliente elige un combo.
  const productText = `${CONFIG.productName} - ${selectedCombo.name}`;
  $("#selectedProduct").textContent = productText;
  $("#selectedTotal").textContent = money(selectedCombo.price);
  $("#mainButtonPrice").textContent = money(selectedCombo.price);
  $("#checkoutPrice").textContent = money(selectedCombo.price);
  $("#summaryProduct").textContent = productText;
  $("#summaryQuantity").textContent = `${selectedCombo.quantity} ${selectedCombo.quantity === 1 ? "unidad" : "unidades"}`;
  $("#summaryTotal").textContent = money(selectedCombo.price);
  $("#stickyPrice").textContent = money(selectedCombo.price);
  updateWhatsappLinks();
}

function getWhatsappMessage() {
  // Mensaje automatico que se abre al tocar un boton de WhatsApp.
  return encodeURIComponent(
    `Hola, quiero comprar ${CONFIG.productName}. Combo elegido: ${selectedCombo.name}. Total: ${money(selectedCombo.price)}. Pago al recibir en ${CONFIG.cityCountry}.`
  );
}

function updateWhatsappLinks() {
  // Coloca el mismo enlace de WhatsApp en todos los botones verdes.
  const url = `https://wa.me/${CONFIG.whatsapp}?text=${getWhatsappMessage()}`;
  $$("[data-whatsapp-link]").forEach((link) => { link.href = url; });
}

function initCounters() {
  // Simula personas viendo y stock disponible para dar sensacion de actividad.
  updateCounters();
  setInterval(() => {
    currentViewers = Math.max(18, Math.min(46, currentViewers + Math.floor(Math.random() * 5) - 2));
    updateCounters();
  }, 4500);

  setInterval(() => {
    if (Math.random() > 0.72 && currentStock > 5) currentStock -= 1;
    updateCounters();
  }, 30000);
}

function updateCounters() {
  // Escribe los numeros de visitantes y stock en la pagina.
  $("#viewersCount").textContent = currentViewers;
  $("#stickyViewers").textContent = currentViewers;
  $("#stockCount").textContent = currentStock;
  $("#stickyStock").textContent = currentStock;
}

function initTimer() {
  // Temporizador de oferta que se reinicia cada 15 minutos.
  setInterval(() => {
    timerSeconds = timerSeconds > 0 ? timerSeconds - 1 : 15 * 60;
    const minutes = String(Math.floor(timerSeconds / 60)).padStart(2, "0");
    const seconds = String(timerSeconds % 60).padStart(2, "0");
    $("#offerTimer").textContent = `${minutes}:${seconds}`;
  }, 1000);
}

function openCheckoutModal() {
  // Abre el formulario como ventana emergente.
  $("#checkout").classList.remove("hidden");
  document.body.classList.add("modal-open");
}

function closeCheckoutModal() {
  // Cierra la ventana emergente del formulario.
  $("#checkout").classList.add("hidden");
  document.body.classList.remove("modal-open");
}

function closeConfirmationModal() {
  // Cierra el mensaje de pedido recibido.
  $("#confirmation").classList.add("hidden");
  document.body.classList.remove("modal-open");
}

function keepModalLock() {
  const hasOpenModal = !$("#checkout").classList.contains("hidden") || !$("#confirmation").classList.contains("hidden") || !$("#mapModal").classList.contains("hidden");
  document.body.classList.toggle("modal-open", hasOpenModal);
}

function setMapLink(link) {
  selectedMapLink = link;
  $("#mapLinkInput").value = link;
  $("#mapOpenLink").href = link || "https://www.google.com/maps";
}

function showMapSearch(query) {
  const normalizedQuery = query.trim() || "Asuncion, Paraguay";
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(normalizedQuery)}`;
  $("#mapPicker").src = `https://www.google.com/maps?q=${encodeURIComponent(normalizedQuery)}&output=embed`;
  setMapLink(mapsUrl);
}

function openMapModal() {
  $("#mapModal").classList.remove("hidden");
  document.body.classList.add("modal-open");
  if (!selectedMapLink) showMapSearch("Asuncion, Paraguay");
}

function closeMapModal() {
  $("#mapModal").classList.add("hidden");
  keepModalLock();
}

function searchMapLocation() {
  const query = $("#mapSearch").value.trim();
  const error = $("#mapError");
  if (!query) {
    error.textContent = "Escribí una dirección o lugar para buscar.";
    return;
  }

  showMapSearch(`${query}, Paraguay`);
  error.textContent = "Si querés una ubicación exacta, tocá Abrir, compartí desde Google Maps y pegá el enlace acá.";
}

function initMapPicker() {
  $("[data-open-map]").addEventListener("click", openMapModal);
  $$('[data-close-map]').forEach((button) => button.addEventListener("click", closeMapModal));
  $("#mapModal").addEventListener("click", (event) => {
    if (event.target.id === "mapModal") closeMapModal();
  });
  $("#mapSearchButton").addEventListener("click", searchMapLocation);
  $("#mapSearch").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      searchMapLocation();
    }
  });
  $("#mapLinkInput").addEventListener("input", (event) => {
    selectedMapLink = event.target.value.trim();
    $("#mapOpenLink").href = selectedMapLink || "https://www.google.com/maps";
  });
  $("#mapConfirm").addEventListener("click", () => {
    const link = $("#mapLinkInput").value.trim() || selectedMapLink;
    $("#mapsInput").value = link;
    closeMapModal();
  });
}

function initCheckoutModal() {
  // Hace que los botones de compra abran el formulario emergente.
  $$('[data-scroll-to-checkout]').forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openCheckoutModal();
    });
  });

  $$('[data-close-checkout]').forEach((button) => {
    button.addEventListener("click", closeCheckoutModal);
  });

  $("#checkout").addEventListener("click", (event) => {
    if (event.target.id === "checkout") closeCheckoutModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && $("#mapModal").classList.contains("hidden")) closeCheckoutModal();
  });
}

function initConfirmationModal() {
  // Permite cerrar la confirmacion con el boton, clic fuera o tecla Escape.
  $$('[data-close-confirmation]').forEach((button) => {
    button.addEventListener("click", closeConfirmationModal);
  });

  $("#confirmation").addEventListener("click", (event) => {
    if (event.target.id === "confirmation") closeConfirmationModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && $("#mapModal").classList.contains("hidden")) closeConfirmationModal();
  });
}

async function initForm() {
  // Valida el formulario, guarda el pedido y muestra la confirmacion.
  $("#orderForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const submitButton = form.querySelector("button[type='submit']");
    const data = Object.fromEntries(new FormData(form).entries());
    const error = $("#formError");

    if (!data.name?.trim() || !data.phone?.trim() || !data.city?.trim() || !data.address?.trim()) {
      error.textContent = "Completá nombre, WhatsApp, ciudad y dirección para continuar.";
      return;
    }

    if (data.phone.replace(/\D/g, "").length < 7) {
      error.textContent = "Ingresá un número de WhatsApp válido.";
      return;
    }

    error.textContent = "";
    const order = {
      id: generateOrderNumber(),
      product: CONFIG.productName,
      combo: selectedCombo.name,
      quantity: selectedCombo.quantity,
      total: selectedCombo.price,
      customer_name: data.name.trim(),
      customer_phone: data.phone.trim(),
      city: data.city.trim(),
      address: data.address.trim(),
      neighborhood: data.neighborhood?.trim() || "",
      reference: data.reference?.trim() || "",
      maps_url: data.maps?.trim() || "",
      created_at: new Date().toISOString(),
      status: "pending_confirmation"
    };

    submitButton.disabled = true;
    submitButton.textContent = "ENVIANDO PEDIDO...";

    try {
      saveOrder(order);
      await saveOrderToSupabase(order);
      prepareExternalPayload(order);
    } catch (supabaseError) {
      error.textContent = "No se pudo enviar el pedido. Revisá la configuración de Supabase.";
      console.error(supabaseError);
      submitButton.disabled = false;
      submitButton.textContent = "REALIZAR PEDIDO";
      return;
    }

    $("#orderNumber").textContent = order.id;
    $("#confirmationPhone").textContent = order.customer_phone;
    closeCheckoutModal();
    $("#confirmation").classList.remove("hidden");
    document.body.classList.add("modal-open");
    form.reset();
    submitButton.disabled = false;
    submitButton.textContent = "REALIZAR PEDIDO";
  });
}

function generateOrderNumber() {
  // Genera un numero simple para identificar cada pedido.
  return `#PY${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;
}

function saveOrder(order) {
  // Guarda pedidos en el navegador. No los envia a internet por si solo.
  const orders = JSON.parse(localStorage.getItem("landingOrders") || "[]");
  orders.push(order);
  localStorage.setItem("landingOrders", JSON.stringify(orders));
}

async function saveOrderToSupabase(order) {
  // Envia el pedido a Supabase usando la API REST del proyecto.
  if (CONFIG.supabaseUrl === "TU_SUPABASE_URL" || CONFIG.supabaseAnonKey === "TU_SUPABASE_ANON_KEY") {
    throw new Error("Faltan configurar supabaseUrl y supabaseAnonKey en CONFIG.");
  }

  const response = await fetch(`${CONFIG.supabaseUrl}/rest/v1/${CONFIG.supabaseTable}`, {
    method: "POST",
    headers: {
      apikey: CONFIG.supabaseAnonKey,
      Authorization: `Bearer ${CONFIG.supabaseAnonKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal"
    },
    body: JSON.stringify(order)
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Error guardando pedido en Supabase.");
  }
}

function prepareExternalPayload(order) {
  // Deja los datos listos para conectarlos despues con Google Sheets o Supabase.
  window.latestOrderPayload = {
    googleSheets: order,
    supabase: {
      table: "orders",
      payload: order
    }
  };
}

document.addEventListener("DOMContentLoaded", () => {
  // Punto de inicio: ejecuta todo cuando la pagina ya cargo.
  initContent();
  renderGallery();
  renderCombos();
  updateOrderUI();
  initCounters();
  initTimer();
  initCheckoutModal();
  initConfirmationModal();
  initMapPicker();
  initForm();
});
