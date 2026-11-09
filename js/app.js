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



