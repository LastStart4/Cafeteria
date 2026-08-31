const products = [
{
id: 1,
name: "Sándwich de pollo",
description: "Sándwich de pollo con verduras.",
price: 6.00,
category: "comidas",
image: "🥪"
},
{
id: 2,
name: "Café",
description: "Café caliente recién preparado.",
price: 3.50,
category: "bebidas",
image: "☕"
},
{
id: 3,
name: "Jugo de naranja",
description: "Jugo de naranja natural.",
price: 4.00,
category: "bebidas",
image: "🧃"
},
{
id: 4,
name: "Galletas",
description: "Galletas de chocolate.",
price: 2.50,
category: "snacks",
image: "🍪"
},
{
id: 5,
name: "Empanada",
description: "Empanada de pollo.",
price: 4.50,
category: "comidas",
image: "🥟"
},
{
id: 6,
name: "Agua",
description: "Agua mineral.",
price: 2.00,
category: "bebidas",
image: "💧"
}
];

let cart = [];

const productsContainer = document.getElementById("productsContainer");
const cartButton = document.getElementById("cartButton");
const cartCount = document.getElementById("cartCount");

const cartModal = document.getElementById("cartModal");
const closeCart = document.getElementById("closeCart");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");

const confirmOrder = document.getElementById("confirmOrder");

const orderModal = document.getElementById("orderModal");
const closeOrder = document.getElementById("closeOrder");

// Mostrar productos

function showProducts(category = "todos") {

productsContainer.innerHTML = "";

const filteredProducts = category === "todos"
    ? products
    : products.filter(product => product.category === category);

filteredProducts.forEach(product => {

    const card = document.createElement("article");

    card.classList.add("product-card");

    card.innerHTML = `
        <div class="product-image">
            ${product.image}
        </div>

        <div class="product-info">

            <h3>${product.name}</h3>

            <p>${product.description}</p>

            <div class="product-bottom">

                <span class="price">
                    S/ ${product.price.toFixed(2)}
                </span>

                <button class="add-button"
                    onclick="addToCart(${product.id})">
                    Agregar
                </button>

            </div>

        </div>
    `;

    productsContainer.appendChild(card);
});

}

// Agregar producto

function addToCart(productId) {


const product = products.find(item => item.id === productId);

const existingProduct = cart.find(item => item.id === productId);

if (existingProduct) {
    existingProduct.quantity++;
} else {

    cart.push({
        ...product,
        quantity: 1
    });

}

updateCart();

}

// Actualizar carrito

function updateCart() {


const totalQuantity = cart.reduce(
    (total, product) => total + product.quantity,
    0
);

cartCount.textContent = totalQuantity;

renderCart();


}

// Mostrar carrito

function renderCart() {

cartItems.innerHTML = "";

if (cart.length === 0) {

    cartItems.innerHTML = `
        <p>Tu carrito está vacío.</p>
    `;

    cartTotal.textContent = "S/ 0.00";

    return;
}

let total = 0;

cart.forEach(product => {

    const subtotal = product.price * product.quantity;

    total += subtotal;

    const item = document.createElement("div");

    item.classList.add("cart-item");

    item.innerHTML = `

        <div class="cart-item-info">

            <strong>${product.name}</strong>

            <span>
                S/ ${subtotal.toFixed(2)}
            </span>

        </div>

        <div class="quantity-controls">

            <button onclick="changeQuantity(${product.id}, -1)">
                -
            </button>

            <span>${product.quantity}</span>

            <button onclick="changeQuantity(${product.id}, 1)">
                +
            </button>

        </div>
    `;

    cartItems.appendChild(item);
});

cartTotal.textContent = `S/ ${total.toFixed(2)}`;

}

// Cambiar cantidad

function changeQuantity(productId, change) {

const product = cart.find(item => item.id === productId);

if (!product) return;

product.quantity += change;

if (product.quantity <= 0) {

    cart = cart.filter(item => item.id !== productId);

}

updateCart();


}

// Filtros

document.querySelectorAll(".category").forEach(button => {


button.addEventListener("click", () => {

    document.querySelectorAll(".category")
        .forEach(btn => btn.classList.remove("active"));

    button.classList.add("active");

    showProducts(button.dataset.category);

});


});

// Abrir carrito

cartButton.addEventListener("click", () => {

tModal.classList.remove("hidden");

renderCart();


});

// Cerrar carrito

closeCart.addEventListener("click", () => {

cartModal.classList.add("hidden");
});

// Confirmar pedido

confirmOrder.addEventListener("click", () => {

if (cart.length === 0) {

    alert("Agrega al menos un producto antes de confirmar.");

    return;
}

cartModal.classList.add("hidden");

orderModal.classList.remove("hidden");

cart = [];

updateCart();

});

// Volver al menú

closeOrder.addEventListener("click", () => {

orderModal.classList.add("hidden");

});

// Cargar productos inicialmente

showProducts();
