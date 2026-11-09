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

