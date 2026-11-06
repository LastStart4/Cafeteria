const products = [
    { id: 1, name: "Café Americano", shortName: "Café", description: "Espresso doble con agua caliente. Cuerpo limpio, aroma tostado y persistente.", price: 5, category: "Bebidas", emoji: "☕", stock: 18, image: "img/cafe.jpg" },
    { id: 2, name: "Café Latte", shortName: "Latte", description: "Espresso con leche vaporizada y una fina capa de espuma cremosa.", price: 6.5, category: "Bebidas", emoji: "🥛", stock: 3, image: "img/cafe.jpg" },
    { id: 3, name: "Té de Menta", shortName: "Té", description: "Infusión de hierbabuena fresca, servida caliente. Refrescante y reconfortante.", price: 4, category: "Bebidas", emoji: "🍵", stock: 0, image: "img/jugo.jpg" },
    { id: 4, name: "Sándwich de Jamón", shortName: "Sándwich", description: "Pan artesanal tostado con jamón ahumado, queso gouda fundido y lechuga fresca.", price: 8, category: "Snacks", emoji: "🥪", stock: 9, image: "img/sandwich.jpg" },
    { id: 5, name: "Empanada de Carne", shortName: "Empanada", description: "Masa horneada rellena de carne molida sazonada, aceituna botija y huevo duro.", price: 3.5, category: "Snacks", emoji: "🥟", stock: 2, image: "img/empanada.jpg" },
    { id: 6, name: "Brownie de Chocolate", shortName: "Brownie", description: "Brownie de chocolate negro 70% cacao con nueces. Húmedo por dentro, crujiente por fuera.", price: 5.5, category: "Postres", emoji: "🍫", stock: 14, image: "img/galletas.jpg" },
    { id: 7, name: "Torta de Limón", shortName: "Torta", description: "Bizcocho esponjoso bañado en crema de limón y glaseado de azúcar impalpable.", price: 7, category: "Postres", emoji: "🍰", stock: 0, image: "img/galletas.jpg" }
];

const universityUser = {
    name: "Juan Pérez",
    code: "2026123456",
    email: "juan.perez@utp.edu.pe",
    initials: "JP"
};

const historyOrders = [
    { number: "00118", date: "24 sep 2026", items: [{ id: 1, quantity: 1 }, { id: 4, quantity: 1 }], total: 13, status: "Entregado", step: 4 },
    { number: "00112", date: "23 sep 2026", items: [{ id: 2, quantity: 1 }, { id: 6, quantity: 1 }], total: 12, status: "Entregado", step: 4 },
    { number: "00098", date: "22 sep 2026", items: [{ id: 3, quantity: 1 }, { id: 5, quantity: 1 }], total: 7.5, status: "Cancelado", step: 0 },
    { number: "00087", date: "20 sep 2026", items: [{ id: 1, quantity: 1 }, { id: 7, quantity: 1 }, { id: 4, quantity: 1 }], total: 20, status: "Entregado", step: 4 }
];

const categories = ["Todos", "Bebidas", "Snacks", "Postres"];
const trackingSteps = ["Pedido recibido", "Confirmado", "En preparación", "Listo", "Entregado"];
const app = document.getElementById("app");
const toast = document.getElementById("toast");
const state = {
    screen: "account",
    previousScreen: "menu",
    category: "Todos",
    search: "",
    productId: null,
    detailQuantity: 1,
    feedbackVariant: "A",
    variantLocked: false,
    cart: [],
    draftCart: [],
    orderNumber: "",
    trackingStep: 2,
    confirmedOrders: [],
    confirming: false,
    expandedOrder: null,
    showStatus: false
};

const money = amount => `S/ ${amount.toFixed(2)}`;
const getProduct = id => products.find(product => product.id === id);
const cartCount = items => items.reduce((count, item) => count + item.quantity, 0);
const cartTotal = items => items.reduce((sum, item) => sum + getProduct(item.id).price * item.quantity, 0);
const escapeHTML = value => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

function icon(name, size = 20) {
    const paths = {
        search: '<circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.4-4.4"></path>',
        cart: '<circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"></path>',
        history: '<path d="M3 3v5h5"></path><path d="M3.5 8A9 9 0 1 1 3 12"></path><path d="M12 7v5l3 2"></path>',
        user: '<circle cx="12" cy="8" r="4"></circle><path d="M4 21a8 8 0 0 1 16 0"></path>',
        back: '<path d="m15 18-6-6 6-6"></path><path d="M9 12h11"></path>',
        check: '<path d="m5 12 4 4L19 6"></path>',
        plus: '<path d="M12 5v14"></path><path d="M5 12h14"></path>',
        minus: '<path d="M5 12h14"></path>',
        trash: '<path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="m19 6-1 14H6L5 6"></path><path d="M10 11v5M14 11v5"></path>',
        chevron: '<path d="m9 18 6-6-6-6"></path>'
    };
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || ""}</svg>`;
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("visible");
    clearTimeout(showToast.timeout);
    showToast.timeout = setTimeout(() => toast.classList.remove("visible"), 1800);
}

function stockLevel(stock) {
    if (stock === 0) return { text: "Agotado", className: "stock-out" };
    if (stock <= 3) return { text: "Stock bajo", className: "stock-low" };
    return { text: "Disponible", className: "stock-available" };
}

function primaryButton(label, action, options = {}) {
    const { disabled = false, loading = false, loadingLabel = "Procesando pedido…", secondary = false, extraClass = "" } = options;
    return `<button type="button" class="action-button ${secondary ? "action-secondary" : "action-primary"} ${extraClass}" data-action="${action}" ${disabled || loading ? "disabled" : ""} ${loading ? 'aria-busy="true"' : ""}>${loading ? '<span class="spinner" aria-hidden="true"></span>' : ""}${loading ? loadingLabel : label}</button>`;
}

function screenHeader(title, subtitle, backAction = "back") {
    return `
        <header class="screen-header">
            <button type="button" class="back-button" data-action="${backAction}" aria-label="Volver a la pantalla anterior">${icon("back")}</button>
            <div>
                ${subtitle ? `<p class="eyebrow">${subtitle}</p>` : ""}
                <h1>${title}</h1>
            </div>
        </header>`;
}

function renderAccount() {
    app.innerHTML = `
        <section class="account-screen">
            <header class="account-hero">
                <p class="eyebrow">Cafetería Universitaria</p>
                <h1>Tu cuenta, tu pedido</h1>
                <p>Identifica tus pedidos y retíralos de forma rápida dentro del campus.</p>
            </header>
            <div class="account-content">
                <section class="account-card">
                    <div class="account-identity">
                        <div class="avatar">${universityUser.initials}</div>
                        <div>
                            <h2>${universityUser.name}</h2>
                            <p>Cuenta universitaria verificada</p>
                        </div>
                    </div>
                    <div class="account-fields">
                        <div><span>Código universitario</span><strong>${universityUser.code}</strong></div>
                        <div><span>Correo institucional</span><strong>${universityUser.email}</strong></div>
                    </div>
                </section>
                <p class="account-notice">Los pedidos realizados quedarán asociados a este código universitario.</p>
                <section class="variant-card" aria-label="Alternativa de feedback al agregar">
                    <div>
                        <p class="variant-eyebrow">Prueba A/B</p>
                        <strong>Feedback al agregar</strong>
                    </div>
                    <div class="variant-control">
                        ${["A", "B"].map(variant => `<button type="button" data-action="variant" data-value="${variant}" aria-pressed="${state.feedbackVariant === variant}" ${state.variantLocked ? "disabled" : ""}>${variant}</button>`).join("")}
                    </div>
                </section>
                <p class="variant-help">${state.variantLocked ? `Variante ${state.feedbackVariant} asignada para esta sesión.` : "Asigna la variante antes de iniciar la prueba. No podrá cambiarse durante la sesión."}</p>
                ${primaryButton("Continuar al menú", "continue")}
            </div>
        </section>`;
}

function renderMenu() {
    const shown = products.filter(product =>
        (state.category === "Todos" || product.category === state.category) &&
        product.name.toLocaleLowerCase("es").includes(state.search.toLocaleLowerCase("es"))
    );
    const items = cartCount(state.cart);

    app.innerHTML = `
        <section class="menu-screen">
            <header class="menu-hero">
                <div class="menu-heading">
                    <div>
                        <p class="eyebrow">Bienvenido a</p>
                        <h1>Cafetería</h1>
                    </div>
                    <nav class="menu-icons" aria-label="Navegación">
                        <button type="button" data-action="account" aria-label="Abrir mi cuenta">${icon("user")}</button>
                        <button type="button" data-action="history" aria-label="Abrir historial de pedidos">${icon("history")}</button>
                        <button type="button" data-action="cart" aria-label="Abrir carrito, ${items} productos">${icon("cart")}${items ? `<span class="cart-badge">${items}</span>` : ""}</button>
                    </nav>
                </div>
                <label class="search-box">${icon("search")}<input type="search" data-action="search" aria-label="Buscar productos del menú" placeholder="Buscar productos..." value="${escapeHTML(state.search)}"></label>
            </header>
            <div class="menu-categories" role="group" aria-label="Filtrar por categoría">
                ${categories.map(category => `<button type="button" class="category-chip ${state.category === category ? "active" : ""}" data-action="category" data-value="${category}" aria-pressed="${state.category === category}">${category}</button>`).join("")}
            </div>
            <div class="product-list">
                ${shown.length ? `<div class="product-grid">${shown.map(renderProductCard).join("")}</div>` : '<p class="empty-state">No se encontraron productos.</p>'}
            </div>
            ${items ? `<footer class="menu-cart-footer"><button type="button" class="cart-summary-button" data-action="cart"><span class="cart-summary-count">${items}</span><strong>Ver pedido</strong><span>${money(cartTotal(state.cart))}</span></button></footer>` : ""}
        </section>`;
}

function renderProductCard(product) {
    const stock = stockLevel(product.stock);
    const unavailable = product.stock === 0;
    const inCart = state.cart.find(item => item.id === product.id);
    return `
        <button type="button" class="product-card" data-action="select-product" data-id="${product.id}" ${unavailable ? "disabled" : ""} aria-label="${product.name}, ${money(product.price)}, ${stock.text}">
            <span class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.style.display='none'">
                ${unavailable ? '<span class="sold-out-cover"><strong>AGOTADO</strong></span>' : ""}
                ${inCart && !unavailable ? `<span class="item-count">×${inCart.quantity}</span>` : ""}
            </span>
            <span class="product-info">
                <strong>${product.name}</strong>
                <span class="product-price-row"><b>${money(product.price)}</b><span class="stock-badge ${stock.className}">${stock.text}</span></span>
                <span class="product-add-label">${unavailable ? "Sin stock" : "Agregar"}</span>
            </span>
        </button>`;
}

function renderDetail() {
    const product = getProduct(state.productId);
    if (!product) {
        state.screen = "menu";
        render();
        return;
    }
    const stock = stockLevel(product.stock);
    const cartQty = cartCount(state.cart);
    const cartItem = state.cart.find(item => item.id === product.id);
    const maxAvailable = product.stock - (cartItem ? cartItem.quantity : 0);
    const quantity = Math.min(state.detailQuantity, Math.max(1, maxAvailable));

    app.innerHTML = `
        <section class="detail-screen">
            <div class="detail-hero">
                <img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'">
                <div class="detail-overlay"></div>
                <button type="button" class="floating-back" data-action="back" aria-label="Volver al menú">${icon("back")}</button>
                <button type="button" class="floating-cart" data-action="cart" aria-label="Abrir carrito, ${cartQty} productos">${icon("cart")}${cartQty ? `<span class="cart-badge">${cartQty}</span>` : ""}</button>
                <div class="detail-title"><p class="eyebrow">${product.category}</p><h1>${product.name}</h1></div>
            </div>
            <div class="detail-content">
                <div class="detail-summary">
                    <div><p class="detail-description">${product.description}</p><span class="stock-badge ${stock.className}">${stock.text}${product.stock ? ` · ${product.stock} uds.` : ""}</span></div>
                    <div class="detail-price"><span>Precio</span><strong>${money(product.price)}</strong></div>
                </div>
                <section class="quantity-card">
                    <h2>Cantidad</h2>
                    <div class="quantity-card-row">
                        ${renderQuantityPicker(quantity, maxAvailable, "detail-quantity")}
                        <div class="subtotal"><span>Subtotal</span><strong>${money(product.price * quantity)}</strong></div>
                    </div>
                    ${stock.className === "stock-low" && quantity >= maxAvailable ? `<p class="stock-warning">Estás solicitando todo el stock disponible (${maxAvailable} uds.)</p>` : ""}
                </section>
                ${primaryButton(`Agregar al pedido · ${money(product.price * quantity)}`, "add", { disabled: maxAvailable <= 0 })}
            </div>
        </section>`;
}

function renderQuantityPicker(quantity, max, action, id = "") {
    return `
        <div class="quantity-picker">
            <button type="button" data-action="${action}" data-id="${id}" data-change="-1" aria-label="Disminuir cantidad" ${quantity <= 1 ? "disabled" : ""}>${icon("minus", 14)}</button>
            <span aria-live="polite">${quantity}</span>
            <button type="button" data-action="${action}" data-id="${id}" data-change="1" aria-label="Aumentar cantidad" ${max !== undefined && quantity >= max ? "disabled" : ""}>${icon("plus", 14)}</button>
        </div>`;
}

function renderCart() {
    const total = cartTotal(state.cart);
    app.innerHTML = `
        <section class="standard-screen">
            ${screenHeader("Mi Pedido", "Resumen", "menu")}
            <div class="scroll-content">
                ${state.cart.length ? `<div class="cart-items">${state.cart.map(item => renderCartItem(item, false)).join("")}</div>` : '<div class="empty-state">🛒<p>Tu pedido está vacío</p></div>'}
                ${state.cart.length ? `<section class="total-card"><div><span>Total del pedido</span><small>${cartCount(state.cart)} producto(s)</small></div><strong>${money(total)}</strong></section>` : ""}
            </div>
            <footer class="screen-actions">
                ${primaryButton("Modificar pedido", "modify", { secondary: true, disabled: !state.cart.length || state.confirming })}
                ${primaryButton("Confirmar pedido", "confirm", { disabled: !state.cart.length, loading: state.confirming, secondary: state.confirming })}
                ${state.cart.length ? primaryButton("Cancelar pedido", "cancel", { secondary: true, disabled: state.confirming, extraClass: "ghost-button" }) : ""}
            </footer>
        </section>`;
}

function renderCartItem(item, editing) {
    const product = getProduct(item.id);
    return `
        <article class="${editing ? "modify-item" : "cart-item"}">
            <div class="cart-item-image"><img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'"></div>
            <div class="cart-item-main">
                <strong>${product.name}</strong>
                <span>${item.quantity} × ${money(product.price)}</span>
                ${editing ? renderQuantityPicker(item.quantity, product.stock, "draft-quantity", product.id) : ""}
            </div>
            ${editing ? `<button type="button" class="remove-item" data-action="remove-item" data-id="${product.id}" aria-label="Eliminar ${product.name}">${icon("trash", 15)} Eliminar</button>` : `<strong class="line-total">${money(product.price * item.quantity)}</strong>`}
        </article>`;
}

function renderModify() {
    const total = cartTotal(state.draftCart);
    app.innerHTML = `
        <section class="standard-screen">
            ${screenHeader("Modificar Pedido", "Editar", "modify-back")}
            <div class="scroll-content">
                ${state.draftCart.length ? `<div class="modify-items">${state.draftCart.map(item => renderCartItem(item, true)).join("")}</div>` : '<div class="empty-state">🗑️<p>No quedan productos en el pedido</p></div>'}
                ${state.draftCart.length ? `<section class="total-card"><span>Nuevo total</span><strong>${money(total)}</strong></section>` : ""}
            </div>
            <footer class="screen-actions">
                ${primaryButton("Guardar cambios", "save-modifications")}
                ${primaryButton("Volver al pedido", "back-to-cart", { secondary: true })}
            </footer>
            ${state.showDiscardDialog ? renderDiscardDialog() : ""}
        </section>`;
}

function renderDiscardDialog() {
    return `
        <div class="dialog-backdrop" data-action="dismiss-dialog">
            <section class="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="dialog-title">
                <h2 id="dialog-title">Cambios sin guardar</h2>
                <p>Modificaste productos o cantidades. Puedes continuar editando o descartar los cambios realizados.</p>
                <div class="dialog-actions">
                    ${primaryButton("Continuar editando", "continue-editing")}
                    ${primaryButton("Descartar cambios", "discard-changes", { secondary: true })}
                </div>
            </section>
        </div>`;
}

function renderConfirmation() {
    const order = currentOrder();
    app.innerHTML = `
        <section class="confirmation-screen">
            <header class="confirmation-brand">Cafetería</header>
            <div class="confirmation-content">
                <div class="confirmation-check">${icon("check", 28)}</div>
                <h1>Pedido confirmado</h1>
                <p class="confirmation-subtitle">Tu pedido está siendo preparado con cariño.</p>
                <section class="order-details">
                    <h2>Detalles del pedido</h2>
                    ${detailRow("Número de pedido", `#${state.orderNumber}`)}
                    ${detailRow("Estudiante", universityUser.name)}
                    ${detailRow("Código universitario", universityUser.code)}
                    ${detailRow("Total", money(order.total), "total")}
                    ${detailRow("Estado", `<span class="status-badge status-preparing">◷ En preparación</span>`, "state")}
                </section>
            </div>
            <footer class="screen-actions">
                ${primaryButton("Ver estado del pedido", "tracking")}
                ${primaryButton("Volver al menú", "reset", { secondary: true })}
            </footer>
        </section>`;
}

function detailRow(label, value, className = "") {
    return `<div class="detail-row ${className}"><span>${label}</span><strong>${value}</strong></div>`;
}

function currentOrder() {
    return state.confirmedOrders.find(order => order.number === state.orderNumber);
}

function pickupCode(number) {
    const seed = Number(number || "125");
    const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    return `${letters[seed % letters.length]}${(seed * 7) % 10}${letters[(seed + 5) % letters.length]}${(seed * 3) % 10}${letters[(seed + 11) % letters.length]}${(seed * 9) % 10}`;
}

function renderTracking() {
    const order = currentOrder();
    if (!order) {
        state.screen = "menu";
        render();
        return;
    }
    app.innerHTML = `
        <section class="standard-screen tracking-screen">
            ${screenHeader("Seguimiento del Pedido", `Pedido #${order.number}`, "reset")}
            <div class="tracking-progress">
                <p>Simulación del prototipo: los estados avanzan manualmente y no representan seguimiento en tiempo real.</p>
                <div class="progress-track">${trackingSteps.map((step, index) => `<span class="${index <= order.step ? "complete" : ""} ${index === order.step ? "current" : ""}" title="${step}"></span>`).join("")}</div>
                <div class="progress-labels"><span>Inicio</span><strong>${trackingSteps[order.step]}</strong><span>Entregado</span></div>
            </div>
            <div class="scroll-content tracking-content">
                <div class="tracking-list">
                    ${trackingSteps.map((step, index) => renderTrackingStep(step, index, order.step)).join("")}
                </div>
                ${order.step >= 3 ? renderPickupCard(order) : ""}
            </div>
            <footer class="screen-actions">
                ${order.step < 4
                    ? primaryButton(order.step === 2 ? "Simular: pedido listo" : "Simular: pedido retirado", "advance-tracking")
                    : primaryButton("Ver historial de pedidos", "history")}
                ${primaryButton("Volver al menú", "reset", { secondary: true })}
            </footer>
        </section>`;
}

function renderTrackingStep(step, index, currentStep) {
    const done = index < currentStep;
    const current = index === currentStep;
    const icons = ["▤", "✓", "♨", "♧", "★"];
    const descriptions = [
        "Orden registrada en el sistema",
        "Estado de confirmación simulado",
        "Preparación representada en el prototipo",
        "Estado de retiro simulado",
        "Fin de la simulación del pedido"
    ];
    return `
        <article class="tracking-step ${done ? "done" : ""} ${current ? "current" : ""}">
            <div class="tracking-marker">${done ? icon("check", 16) : icons[index]}</div>
            <div>
                <div class="tracking-title"><strong>${step}</strong>${current ? '<span class="status-badge status-preparing">Actual</span>' : done ? '<span class="status-badge status-done">Completado</span>' : ""}</div>
                <p>${descriptions[index]}</p>
            </div>
        </article>`;
}

function renderPickupCard(order) {
    const delivered = order.step >= 4;
    return `
        <section class="pickup-card">
            <span class="status-badge status-done">${delivered ? "PEDIDO ENTREGADO" : "LISTO PARA RETIRAR"}</span>
            <h2>${delivered ? "Pedido retirado" : "¡Tu pedido está listo!"}</h2>
            <p>Pedido #${order.number}</p>
            <div class="qr-placeholder" role="img" aria-label="QR ilustrativo, no escaneable">${Array.from({ length: 49 }, (_, index) => `<i class="${(index * 17 + Number(order.number) + index * 3) % 5 < 2 ? "dark" : ""}"></i>`).join("")}</div>
            <span class="qr-caption">QR ilustrativo · No escaneable</span>
            <span class="pickup-label">Código de retiro</span>
            <strong class="pickup-code">${pickupCode(order.number)}</strong>
            <p>Representación visual para la prueba del flujo de retiro.</p>
        </section>`;
}

function renderHistory() {
    const orders = [
        ...state.confirmedOrders.map(order => ({ ...order, isActive: order.number === state.orderNumber })),
        ...historyOrders.map(order => ({ ...order, isActive: false }))
    ];
    app.innerHTML = `
        <section class="standard-screen">
            ${screenHeader("Historial de Pedidos", "Mis pedidos", "menu")}
            <div class="scroll-content history-list">
                ${orders.map(renderHistoryOrder).join("")}
            </div>
        </section>`;
}

function renderHistoryOrder(order) {
    const expanded = state.expandedOrder === order.number;
    const statusClass = order.status === "Cancelado" ? "status-cancelled" : order.status === "En preparación" ? "status-preparing" : "status-done";
    const itemNames = order.items.map(item => `${item.quantity > 1 ? `${item.quantity} × ` : ""}${getProduct(item.id).name}`);
    const preview = itemNames.slice(0, 2).join(", ");
    const summary = `${preview}${itemNames.length > 2 ? ` +${itemNames.length - 2} más` : ""}`;
    return `
        <article class="history-card ${order.isActive ? "active-order" : ""}">
            <div class="history-card-main">
                <div class="history-heading"><div><strong>Pedido #${order.number}</strong><span>${order.date}</span></div><span class="status-badge ${statusClass}">${order.status}</span></div>
                <p>${summary}</p>
                <div class="history-total"><strong>${money(order.total)}</strong><button type="button" data-action="history-detail" data-id="${order.number}" aria-expanded="${expanded}">${expanded ? "Ocultar detalle" : "Ver detalle"} ${icon("chevron", 14)}</button></div>
            </div>
            ${expanded ? `<div class="history-detail">
                <h3>Productos</h3>
                ${order.items.map(item => `<p>• ${item.quantity > 1 ? `${item.quantity} × ` : ""}${getProduct(item.id).name}</p>`).join("")}
                ${order.isActive && order.step >= 3 ? `<p class="pickup-history">Código de retiro: ${pickupCode(order.number)}</p>` : ""}
                <h3>Progreso</h3>
                <div class="mini-progress">${trackingSteps.map((step, index) => `<span class="${order.status !== "Cancelado" && index <= order.step ? "done" : ""}">${step.split(" ")[0]}</span>`).join("")}</div>
                ${order.status === "Cancelado" ? '<p class="cancelled-note">✕ Pedido cancelado</p>' : ""}
                ${order.isActive && order.status !== "Entregado" ? `<button class="text-button" type="button" data-action="open-tracking">Ver seguimiento</button>` : ""}
            </div>` : ""}
        </article>`;
}

function render() {
    switch (state.screen) {
        case "account": renderAccount(); break;
        case "menu": renderMenu(); break;
        case "detail": renderDetail(); break;
        case "cart": renderCart(); break;
        case "modify": renderModify(); break;
        case "confirmation": renderConfirmation(); break;
        case "tracking": renderTracking(); break;
        case "history": renderHistory(); break;
        default: state.screen = "account"; renderAccount();
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function navigateTo(screen) {
    state.screen = screen;
    render();
}

function addToCart() {
    const product = getProduct(state.productId);
    const existing = state.cart.find(item => item.id === product.id);
    const alreadyAdded = existing ? existing.quantity : 0;
    const amount = Math.min(state.detailQuantity, product.stock - alreadyAdded);
    if (amount < 1) {
        showToast(`Solo quedan ${product.stock - alreadyAdded} unidades disponibles.`);
        return;
    }
    if (existing) existing.quantity += amount;
    else state.cart.push({ id: product.id, quantity: amount });

    const variant = state.feedbackVariant;
    state.screen = "menu";
    renderMenu();
    if (variant === "B") showToast(`✓ ${product.shortName} agregado al carrito`);
    else showToast("Producto agregado al carrito");
    window.setTimeout(() => {
        if (state.screen === "menu") navigateTo("cart");
    }, 650);
}

function createOrderNumber() {
    let number = String(Math.floor(Math.random() * 90000) + 10000);
    while (state.confirmedOrders.some(order => order.number === number)) {
        number = String(Math.floor(Math.random() * 90000) + 10000);
    }
    return number;
}

function confirmOrder() {
    if (state.confirming || !state.cart.length) return;
    state.confirming = true;
    renderCart();
    window.setTimeout(() => {
        const order = {
            number: createOrderNumber(),
            date: "Hoy",
            items: state.cart.map(item => ({ ...item })),
            total: cartTotal(state.cart),
            status: "En preparación",
            step: 2,
            isActive: true
        };
        state.confirmedOrders.unshift(order);
        state.orderNumber = order.number;
        state.trackingStep = 2;
        state.cart = [];
        state.confirming = false;
        navigateTo("confirmation");
    }, 650);
}

function changeItemQuantity(items, id, amount, max) {
    const item = items.find(entry => entry.id === id);
    if (!item) return;
    item.quantity = Math.max(1, Math.min(max, item.quantity + amount));
}

function updateOrderStep() {
    const order = currentOrder();
    if (!order) return;
    const next = Math.min(4, order.step + 1);
    order.step = next;
    order.status = next >= 4 ? "Entregado" : next === 3 ? "Listo" : "En preparación";
    state.trackingStep = next;
    renderTracking();
}

app.addEventListener("input", event => {
    if (event.target.matches('[data-action="search"]')) {
        state.search = event.target.value;
        const cursor = event.target.selectionStart;
        renderMenu();
        const input = app.querySelector('[data-action="search"]');
        input.focus();
        input.setSelectionRange(cursor, cursor);
    }
});

app.addEventListener("click", event => {
    const button = event.target.closest("[data-action]");
    if (!button || button.disabled) return;
    const action = button.dataset.action;

    switch (action) {
        case "variant":
            if (!state.variantLocked) {
                state.feedbackVariant = button.dataset.value;
                renderAccount();
            }
            break;
        case "continue":
            state.variantLocked = true;
            navigateTo("menu");
            break;
        case "account":
            state.previousScreen = "menu";
            navigateTo("account");
            break;
        case "menu":
            navigateTo("menu");
            break;
        case "history":
            navigateTo("history");
            break;
        case "cart":
            state.previousScreen = "menu";
            navigateTo("cart");
            break;
        case "category":
            state.category = button.dataset.value;
            renderMenu();
            break;
        case "select-product": {
            const product = getProduct(Number(button.dataset.id));
            if (!product || product.stock === 0) return;
            state.productId = product.id;
            state.detailQuantity = 1;
            state.previousScreen = "menu";
            navigateTo("detail");
            break;
        }
        case "back":
            navigateTo(state.previousScreen);
            break;
        case "detail-quantity": {
            const product = getProduct(state.productId);
            const inCart = state.cart.find(item => item.id === product.id)?.quantity ?? 0;
            state.detailQuantity = Math.max(1, Math.min(product.stock - inCart, state.detailQuantity + Number(button.dataset.change)));
            renderDetail();
            break;
        }
        case "add":
            addToCart();
            break;
        case "cart-quantity": {
            const product = getProduct(Number(button.dataset.id));
            changeItemQuantity(state.cart, product.id, Number(button.dataset.change), product.stock);
            renderCart();
            break;
        }
        case "modify":
            state.draftCart = state.cart.map(item => ({ ...item }));
            navigateTo("modify");
            break;
        case "draft-quantity": {
            const product = getProduct(Number(button.dataset.id));
            changeItemQuantity(state.draftCart, product.id, Number(button.dataset.change), product.stock);
            renderModify();
            break;
        }
        case "remove-item":
            state.draftCart = state.draftCart.filter(item => item.id !== Number(button.dataset.id));
            renderModify();
            showToast(`${getProduct(Number(button.dataset.id)).shortName} retirado del pedido`);
            break;
        case "modify-back":
        case "back-to-cart":
            if (state.screen === "modify" && JSON.stringify(state.cart) !== JSON.stringify(state.draftCart)) {
                state.showDiscardDialog = true;
                renderModify();
            } else {
                state.showDiscardDialog = false;
                navigateTo("cart");
            }
            break;
        case "continue-editing":
            state.showDiscardDialog = false;
            renderModify();
            break;
        case "discard-changes":
            state.showDiscardDialog = false;
            state.draftCart = [];
            navigateTo("cart");
            break;
        case "dismiss-dialog":
            if (event.target === button) {
                state.showDiscardDialog = false;
                renderModify();
            }
            break;
        case "save-modifications":
            state.cart = state.draftCart.filter(item => item.quantity > 0);
            state.draftCart = [];
            state.showDiscardDialog = false;
            navigateTo("cart");
            showToast("Cambios guardados en el pedido");
            break;
        case "cancel":
            state.cart = [];
            navigateTo("menu");
            showToast("Pedido cancelado");
            break;
        case "confirm":
            confirmOrder();
            break;
        case "tracking":
            navigateTo("tracking");
            break;
        case "advance-tracking":
            updateOrderStep();
            break;
        case "reset":
            state.cart = [];
            state.orderNumber = "";
            navigateTo("menu");
            break;
        case "history-detail":
            state.expandedOrder = state.expandedOrder === button.dataset.id ? null : button.dataset.id;
            renderHistory();
            break;
        case "open-tracking":
            navigateTo("tracking");
            break;
        default:
            break;
    }
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && state.showDiscardDialog) {
        state.showDiscardDialog = false;
        renderModify();
    }
});

render();
