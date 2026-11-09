console.log("welcome buger pos System");

//dark & light mood chnege funtion
function toggleTheme() {
    var body = document.body;
    if (body.classList.contains("light-mode")) {
        body.classList.remove("light-mode");
        localStorage.setItem("grill_theme", "dark");
    } else {
        body.classList.add("light-mode");
        localStorage.setItem("grill_theme", "light");
    }
    updateThemeButton();
}

function updateThemeButton() {

    var icon = document.getElementById("themeIcon");
    var text = document.getElementById("themeText");

    if (document.body.classList.contains("light-mode")) {
        icon.className = "bi bi-moon-stars-fill";
        text.textContent = "Dark Mode";
    } else {
        icon.className = "bi bi-sun-fill";
        text.textContent = "Light Mode";
    }
}

function loadTheme() {
    var savedTheme = localStorage.getItem("grill_theme");
    if (savedTheme == "light") {
        document.body.classList.add("light-mode");
    } else {
        document.body.classList.remove("light-mode");
    }
    updateThemeButton();
}

document.addEventListener("DOMContentLoaded", function () {
    loadTheme();
});

//main function 

//gobal varible
var products = [];
var customers = [];
var orders = [];
var cart = [];

var selectedCategory = "All";
var toastTimer = null;

document.addEventListener("DOMContentLoaded", function() {

    loadCustomers();
    loadOrders();
    loadProducts();

    updateClock();

    setInterval(function() {
        updateClock();
    }, 60000);

});

function getElement(id) {
    return document.getElementById(id);
}

function formatMoney(amount) {
    return "Rs. " + Number(amount).toLocaleString("en-LK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function escapeHTML(value) {

    var text = String(value);

    text = text.replace(/&/g, "&amp;");
    text = text.replace(/</g, "&lt;");
    text = text.replace(/>/g, "&gt;");
    text = text.replace(/"/g, "&quot;");
    text = text.replace(/'/g, "&#39;");

    return text;
}

function showToast(message) {

    var toast = getElement("toastMessage");

    toast.textContent = message;
    toast.classList.add("show");

    if (toastTimer != null) {
        clearTimeout(toastTimer);
    }

    toastTimer = setTimeout(function() {
        toast.classList.remove("show");
    }, 3000);
}

//update clock
function updateClock() {

    var now = new Date();

    getElement("currentDate").textContent =
        now.toLocaleDateString("en-LK", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric"
        });
}
//item gen id
function generateId(items) {

    var highestId = 0;

    for (var i = 0; i < items.length; i++) {

        if (Number(items[i].id) > highestId) {
            highestId = Number(items[i].id);
        }
    }

    return highestId + 1;
}

//all find function
function findProduct(id) {

    for (var i = 0; i < products.length; i++) {

        if (products[i].id == id) {
            return products[i];
        }
    }

    return null;
}
function findCustomer(id) {

    for (var i = 0; i < customers.length; i++) {

        if (customers[i].id == id) {
            return customers[i];
        }
    }

    return null;
}
function findOrder(id) {

    for (var i = 0; i < orders.length; i++) {

        if (orders[i].id == id) {
            return orders[i];
        }
    }

    return null;
}

//page navigation function
function showPage(page, button) {

    var pages = document.querySelectorAll(".page-section");

    for (var i = 0; i < pages.length; i++) {
        pages[i].classList.remove("active-page");
    }
    getElement(page + "Page").classList.add("active-page");

    var buttons = document.querySelectorAll(".nav-menu .nav-link");

    for (var j = 0; j < buttons.length; j++) {
        buttons[j].classList.remove("active");
    }
    if (button != null) {
        button.classList.add("active");
    }
    var titles = {
        dashboard: "Dashboard",
        pos: "Point of Sale",
        products: "Product Management",
        customers: "Customer Management",
        orders: "Order Management"
    };
    getElement("pageTitle").textContent = titles[page];

    getElement("sidebar").classList.remove("open");

    if (page == "dashboard") {
        updateDashboard();
    }

    if (page == "pos") {
        displayMenu();
        updateCart();
    }

    if (page == "products") {
        displayProducts();
    }

    if (page == "customers") {
        displayCustomers();
    }

    if (page == "orders") {
        displayOrders();
    }
}
function goToPage(page) {

    var buttons = document.querySelectorAll(".nav-menu .nav-link");

    var pages = ["dashboard", "pos", "products", "customers", "orders"];

    for (var i = 0; i < pages.length; i++) {

        if (pages[i] == page) {
            showPage(page, buttons[i]);
            return;
        }
    }
}

function toggleSidebar() {
    getElement("sidebar").classList.toggle("open");
}

//product data call
function loadProducts() {

    var savedProducts = localStorage.getItem("grill_products");

    if (savedProducts != null) {

        try {
            products = JSON.parse(savedProducts);

            displayMenu();
            displayProducts();
            updateDashboard();

            return;

        } catch (error) {
            console.log("Saved product data error:", error);
        }
    }
    fetch("data/products.json")
        .then(function(response) {

            if (!response.ok) {
                throw new Error("Cannot load products.json");
            }

            return response.json();
        })
        .then(function(data) {

            products = data;

            displayMenu();
            displayProducts();
            updateDashboard();

        })
        .catch(function(error) {

            console.log("Product loading error:", error);

            getElement("menuGrid").innerHTML =
                '<div class="empty-state">Unable to load products. Use VS Code Live Server.</div>';

            showToast("Could not load products.json");
        });
}
function saveProductsToStorage() {
    localStorage.setItem("grill_products", JSON.stringify(products));
}

//product menu
function setCategory(category, button) {

    selectedCategory = category;

    var buttons = document.querySelectorAll(".category-btn");

    for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove("active");
    }

    button.classList.add("active");

    displayMenu();
}

function displayMenu() {

    var grid = getElement("menuGrid");
    var search = getElement("productSearch").value.toLowerCase();

    var html = "";
    var count = 0;

    for (var i = 0; i < products.length; i++) {

        var product = products[i];

        var categoryMatches =
            selectedCategory == "All" ||
            product.category == selectedCategory;

        var searchMatches =
            product.name.toLowerCase().indexOf(search) != -1;

        if (categoryMatches && searchMatches) {

            count++;

            var image = GrillImageAPI.getProductImage(product);

            html +=
                '<div class="product-card">' +
                    '<img class="product-image" src="' + escapeHTML(image) + '" alt="' + escapeHTML(product.name) + '" onerror="this.style.display=\'none\'">' +
                    '<div class="product-info">' +
                        '<span class="product-category">' + escapeHTML(product.category) + '</span>' +
                        '<h3>' + escapeHTML(product.name) + '</h3>' +
                        '<p>' + escapeHTML(product.description || "") + '</p>' +
                        '<div class="product-bottom">' +
                            '<span class="product-price">' + formatMoney(product.price) + '</span>' +
                            '<button class="add-cart-btn" onclick="addToCart(' + product.id + ')">' +
                                '<i class="bi bi-plus-lg"></i>' +
                            '</button>' +
                        '</div>' +
                    '</div>' +
                '</div>';
        }
    }

    if (count == 0) {
        html = '<div class="empty-state">No products found.</div>';
    }

    grid.innerHTML = html;
}
//product manage
function displayProducts() {

    var table = getElement("productsTable");
    var html = "";

    for (var i = 0; i < products.length; i++) {

        var product = products[i];
        var image = GrillImageAPI.getProductImage(product);

        html +=
            "<tr>" +
                '<td><div class="table-product">' +
                    '<img src="' + escapeHTML(image) + '" alt="Product">' +
                    '<strong>' + escapeHTML(product.name) + '</strong>' +
                '</div></td>' +
                "<td>" + escapeHTML(product.category) + "</td>" +
                "<td>" + formatMoney(product.price) + "</td>" +
                "<td>" +
                    '<button class="action-btn edit" onclick="editProduct(' + product.id + ')" title="Edit">' +
                        '<i class="bi bi-pencil"></i>' +
                    '</button>' +
                    '<button class="action-btn delete" onclick="deleteProduct(' + product.id + ')" title="Delete">' +
                        '<i class="bi bi-trash"></i>' +
                    '</button>' +
                "</td>" +
            "</tr>";
    }

    if (products.length == 0) {
        html = '<tr><td colspan="4" class="empty-state">No products available.</td></tr>';
    }

    table.innerHTML = html;
}
function openProductModal() {

    getElement("productForm").reset();
    getElement("productId").value = "";
    getElement("productModalTitle").textContent = "Add Product";

    var modal = bootstrap.Modal.getOrCreateInstance(getElement("productModal"));
    modal.show();
}
function editProduct(id) {

    var product = findProduct(id);

    if (product == null) {
        return;
    }

    getElement("productId").value = product.id;
    getElement("productName").value = product.name;
    getElement("productCategory").value = product.category;
    getElement("productPrice").value = product.price;
    getElement("productDescription").value = product.description || "";
    getElement("productImage").value = product.image || "";

    getElement("productModalTitle").textContent = "Edit Product";

    var modal = bootstrap.Modal.getOrCreateInstance(getElement("productModal"));
    modal.show();
}
function saveProduct(event) {

    event.preventDefault();

    var id = getElement("productId").value;
    var name = getElement("productName").value.trim();
    var category = getElement("productCategory").value;
    var price = Number(getElement("productPrice").value);
    var description = getElement("productDescription").value.trim();
    var image = getElement("productImage").value.trim();

    if (name == "" || !Number.isFinite(price) || price <= 0) {
        alert("Please enter a valid product name and price.");
        return;
    }

    if (id == "") {

        var newProduct = {
            id: generateId(products),
            name: name,
            category: category,
            price: price,
            description: description,
            image: image
        };

        products.push(newProduct);

        showToast("Product added successfully!");

    } else {

        var product = findProduct(Number(id));

        if (product == null) {
            alert("Product not found.");
            return;
        }

        product.name = name;
        product.category = category;
        product.price = price;
        product.description = description;
        product.image = image;

        showToast("Product updated successfully!");
    }

    saveProductsToStorage();

    displayProducts();
    displayMenu();
    updateCart();
    updateDashboard();

    bootstrap.Modal.getInstance(getElement("productModal")).hide();
}
function deleteProduct(id) {

    if (!confirm("Are you sure you want to delete this product?")) {
        return;
    }

    for (var i = 0; i < products.length; i++) {

        if (products[i].id == id) {
            products.splice(i, 1);
            break;
        }
    }

    for (var j = cart.length - 1; j >= 0; j--) {

        if (cart[j].id == id) {
            cart.splice(j, 1);
        }
    }

    saveProductsToStorage();

    displayProducts();
    displayMenu();
    updateCart();
    updateDashboard();

    showToast("Product deleted!");
}



