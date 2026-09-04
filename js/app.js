const products = [
    {
        id: 1,
        name: "Sándwich de pollo",
        description: "Sándwich de pollo con verduras.",
        price: 6.00,
        category: "comidas",
        image: "img/sandwich.jpg",
        available: true
    },
    {
        id: 2,
        name: "Café",
        description: "Café caliente recién preparado.",
        price: 3.50,
        category: "bebidas",
        image: "img/cafe.jpg",
        available: true
    },
    {
        id: 3,
        name: "Jugo de naranja",
        description: "Jugo de naranja natural.",
        price: 4.00,
        category: "bebidas",
        image: "img/jugo.jpg",
        available: true
    },
    {
        id: 4,
        name: "Galletas",
        description: "Galletas de chocolate.",
        price: 2.50,
        category: "snacks",
        image: "img/galletas.jpg",
        available: true
    },
    {
        id: 5,
        name: "Empanada",
        description: "Empanada de pollo.",
        price: 4.50,
        category: "comidas",
        image: "img/empanada.jpg",
        available: true
    },
    {
        id: 6,
        name: "Agua",
        description: "Agua mineral.",
        price: 2.00,
        category: "bebidas",
        image: "img/agua.jpg",
        available: false
    }
];


let cart = [];
let currentProduct = null;
let currentOrderNumber = 1;
let detailQuantity = 1;


const productsContainer =
    document.getElementById("productsContainer");

const cartButton =
    document.getElementById("cartButton");

const cartCount =
    document.getElementById("cartCount");


const productModal =
    document.getElementById("productModal");

const closeProduct =
    document.getElementById("closeProduct");

const productDetailContent =
    document.getElementById("productDetailContent");

const cartModal =
    document.getElementById("cartModal");

const closeCart =
    document.getElementById("closeCart");

const cartItems =
    document.getElementById("cartItems");

const cartTotal =
    document.getElementById("cartTotal");

const confirmOrder =
    document.getElementById("confirmOrder");


const orderModal =
    document.getElementById("orderModal");

const orderNumber =
    document.getElementById("orderNumber");

const orderSummaryItems =
    document.getElementById("orderSummaryItems");

const orderSummaryTotal =
    document.getElementById("orderSummaryTotal");

const viewStatus =
    document.getElementById("viewStatus");

const closeOrder =
    document.getElementById("closeOrder");


const statusModal =
    document.getElementById("statusModal");

const statusOrderNumber =
    document.getElementById("statusOrderNumber");

const closeStatus =
    document.getElementById("closeStatus");

const backToMenu =
    document.getElementById("backToMenu");


function showProducts(category = "todos") {

    productsContainer.innerHTML = "";

    const filteredProducts =
        category === "todos"
            ? products
            : products.filter(
                product => product.category === category
            );


    filteredProducts.forEach(product => {

        const card =
            document.createElement("article");

        card.classList.add("product-card");


        const availabilityText =
            product.available
                ? "Disponible"
                : "Agotado";


        const availabilityClass =
            product.available
                ? "available"
                : "unavailable";


        card.innerHTML = `

            <div class="product-image">

                <img
                    src="${product.image}"
                    alt="${product.name}"
                >

            </div>


            <div class="product-info">

                <h3>
                    ${product.name}
                </h3>


                <p>
                    ${product.description}
                </p>


                <span class="availability ${availabilityClass}">
                    ${availabilityText}
                </span>


                <div class="product-bottom">

                    <span class="price">
                        S/ ${product.price.toFixed(2)}
                    </span>


                    <button
                        class="add-button"
                        onclick="openProductDetail(${product.id})"
                        ${!product.available ? "disabled" : ""}
                    >
                        ${product.available
                            ? "Ver producto"
                            : "Agotado"}
                    </button>

                </div>

            </div>

        `;


        productsContainer.appendChild(card);

    });

}


function openProductDetail(productId) {

    const product =
        products.find(
            item => item.id === productId
        );


    if (!product || !product.available) {
        return;
    }


    currentProduct = product;
    detailQuantity = 1;


    productDetailContent.innerHTML = `

        <div class="detail-image">

            <img
                src="${product.image}"
                alt="${product.name}"
            >

        </div>


        <div class="detail-info">

            <h2>
                ${product.name}
            </h2>


            <p>
                ${product.description}
            </p>


            <span class="availability available">
                Disponible
            </span>


            <div class="detail-price">
                S/ ${product.price.toFixed(2)}
            </div>


            <div class="detail-quantity">

                <span>
                    Cantidad
                </span>


                <div class="quantity-controls">

                    <button
                        onclick="changeDetailQuantity(-1)"
                    >
                        -
                    </button>


                    <span id="detailQuantity">
                        1
                    </span>


                    <button
                        onclick="changeDetailQuantity(1)"
                    >
                        +
                    </button>

                </div>

            </div>


            <button
                class="confirm-button"
                onclick="addProductFromDetail()"
            >
                Agregar al carrito
            </button>

        </div>

    `;


    productModal.classList.remove("hidden");

}


function changeDetailQuantity(change) {

    detailQuantity += change;


    if (detailQuantity < 1) {
        detailQuantity = 1;
    }


    const quantityElement =
        document.getElementById("detailQuantity");


    if (quantityElement) {

        quantityElement.textContent =
            detailQuantity;

    }

}


function addProductFromDetail() {

    if (!currentProduct) {
        return;
    }


    const existingProduct =
        cart.find(
            item => item.id === currentProduct.id
        );


    if (existingProduct) {

        existingProduct.quantity +=
            detailQuantity;

    } else {

        cart.push({
            ...currentProduct,
            quantity: detailQuantity
        });

    }


    updateCart();


    detailQuantity = 1;
    currentProduct = null;


    productModal.classList.add("hidden");

}


function updateCart() {

    const totalQuantity =
        cart.reduce(
            (total, product) =>
                total + product.quantity,
            0
        );


    cartCount.textContent =
        totalQuantity;


    renderCart();

}


function renderCart() {

    cartItems.innerHTML = "";


    if (cart.length === 0) {

        cartItems.innerHTML = `
            <p>Tu carrito está vacío.</p>
        `;


        cartTotal.textContent =
            "S/ 0.00";


        confirmOrder.disabled = true;

        return;

    }


    confirmOrder.disabled = false;


    let total = 0;


    cart.forEach(product => {

        const subtotal =
            product.price *
            product.quantity;


        total += subtotal;


        const item =
            document.createElement("div");


        item.classList.add("cart-item");


        item.innerHTML = `

            <div class="cart-item-info">

                <strong>
                    ${product.name}
                </strong>


                <span>
                    S/ ${subtotal.toFixed(2)}
                </span>

            </div>


            <div class="quantity-controls">

                <button
                    onclick="changeQuantity(${product.id}, -1)"
                >
                    -
                </button>


                <span>
                    ${product.quantity}
                </span>


                <button
                    onclick="changeQuantity(${product.id}, 1)"
                >
                    +
                </button>

            </div>

        `;


        cartItems.appendChild(item);

    });


    cartTotal.textContent =
        `S/ ${total.toFixed(2)}`;

}


function changeQuantity(productId, change) {

    const product =
        cart.find(
            item => item.id === productId
        );


    if (!product) {
        return;
    }


    product.quantity += change;


    if (product.quantity <= 0) {

        cart =
            cart.filter(
                item => item.id !== productId
            );

    }


    updateCart();

}


document
    .querySelectorAll(".category")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".category")
                    .forEach(btn =>
                        btn.classList.remove("active")
                    );


                button.classList.add("active");


                showProducts(
                    button.dataset.category
                );

            }
        );

    });


cartButton.addEventListener(
    "click",
    () => {

        cartModal.classList.remove(
            "hidden"
        );


        renderCart();

    }
);


closeCart.addEventListener(
    "click",
    () => {

        cartModal.classList.add(
            "hidden"
        );

    }
);


closeProduct.addEventListener(
    "click",
    () => {

        productModal.classList.add(
            "hidden"
        );


        currentProduct = null;
        detailQuantity = 1;

    }
);


confirmOrder.addEventListener(
    "click",
    () => {

        if (cart.length === 0) {

            alert(
                "Agrega al menos un producto antes de confirmar."
            );

            return;

        }


        const number =
            String(currentOrderNumber)
                .padStart(3, "0");


        orderNumber.textContent =
            `#${number}`;


        statusOrderNumber.textContent =
            `#${number}`;


        createOrderSummary();


        cartModal.classList.add(
            "hidden"
        );


        orderModal.classList.remove(
            "hidden"
        );


        currentOrderNumber++;

    }
);


function createOrderSummary() {

    orderSummaryItems.innerHTML = "";


    let total = 0;


    cart.forEach(product => {

        const subtotal =
            product.price *
            product.quantity;


        total += subtotal;


        const item =
            document.createElement("div");


        item.classList.add(
            "summary-item"
        );


        item.innerHTML = `

            <span>
                ${product.name}
                x${product.quantity}
            </span>


            <strong>
                S/ ${subtotal.toFixed(2)}
            </strong>

        `;


        orderSummaryItems.appendChild(
            item
        );

    });


    orderSummaryTotal.textContent =
        `S/ ${total.toFixed(2)}`;

}


viewStatus.addEventListener(
    "click",
    () => {

        orderModal.classList.add(
            "hidden"
        );


        statusModal.classList.remove(
            "hidden"
        );

    }
);


closeOrder.addEventListener(
    "click",
    () => {

        orderModal.classList.add(
            "hidden"
        );


        cart = [];

        updateCart();

    }
);


closeStatus.addEventListener(
    "click",
    () => {

        statusModal.classList.add(
            "hidden"
        );

    }
);


backToMenu.addEventListener(
    "click",
    () => {

        statusModal.classList.add(
            "hidden"
        );


        cart = [];

        updateCart();

    }
);


showProducts();
