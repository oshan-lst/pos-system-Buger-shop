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

//customer manage
function loadCustomers() {

    var data = localStorage.getItem("grill_customers");

    if (data != null) {

        try {
            customers = JSON.parse(data);
        } catch (error) {
            customers = [];
        }
    }

    displayCustomers();
    updateCustomerSelect();
    updateDashboard();
}

function saveCustomersToStorage() {
    localStorage.setItem("grill_customers", JSON.stringify(customers));
}

function displayCustomers() {

    var html = "";

    for (var i = 0; i < customers.length; i++) {

        var customer = customers[i];

        html +=
            "<tr>" +
                "<td>#CUS-" + customer.id + "</td>" +
                "<td><strong>" + escapeHTML(customer.name) + "</strong></td>" +
                "<td>" + escapeHTML(customer.phone) + "</td>" +
                "<td>" + escapeHTML(customer.email || "-") + "</td>" +
                "<td>" +
                    '<button class="action-btn edit" onclick="editCustomer(' + customer.id + ')" title="Edit">' +
                        '<i class="bi bi-pencil"></i>' +
                    '</button>' +
                    '<button class="action-btn delete" onclick="deleteCustomer(' + customer.id + ')" title="Delete">' +
                        '<i class="bi bi-trash"></i>' +
                    '</button>' +
                "</td>" +
            "</tr>";
    }

    if (customers.length == 0) {
        html = '<tr><td colspan="5" class="empty-state">No customers yet. Add your first customer!</td></tr>';
    }

    getElement("customersTable").innerHTML = html;
}

function openCustomerModal() {

    getElement("customerForm").reset();
    getElement("customerId").value = "";
    getElement("customerModalTitle").textContent = "Add Customer";

    bootstrap.Modal.getOrCreateInstance(getElement("customerModal")).show();
}

function editCustomer(id) {

    var customer = findCustomer(id);

    if (customer == null) {
        return;
    }

    getElement("customerId").value = customer.id;
    getElement("customerName").value = customer.name;
    getElement("customerPhone").value = customer.phone;
    getElement("customerEmail").value = customer.email || "";

    getElement("customerModalTitle").textContent = "Edit Customer";

    bootstrap.Modal.getOrCreateInstance(getElement("customerModal")).show();
}

function saveCustomer(event) {

    event.preventDefault();

    var id = getElement("customerId").value;
    var name = getElement("customerName").value.trim();
    var phone = getElement("customerPhone").value.trim();
    var email = getElement("customerEmail").value.trim();

    if (name == "" || phone == "") {
        alert("Customer name and phone are required.");
        return;
    }

    for (var i = 0; i < customers.length; i++) {

        if (customers[i].phone == phone && customers[i].id != id) {
            alert("This phone number already exists.");
            return;
        }
    }

    if (id == "") {

        customers.push({
            id: generateId(customers),
            name: name,
            phone: phone,
            email: email
        });

        showToast("Customer added successfully!");

    } else {

        var customer = findCustomer(Number(id));

        if (customer == null) {
            alert("Customer not found.");
            return;
        }

        customer.name = name;
        customer.phone = phone;
        customer.email = email;

        showToast("Customer updated successfully!");
    }

    saveCustomersToStorage();

    displayCustomers();
    updateCustomerSelect();
    updateDashboard();

    bootstrap.Modal.getInstance(getElement("customerModal")).hide();
}

function deleteCustomer(id) {

    if (!confirm("Delete this customer? Existing orders will remain saved.")) {
        return;
    }

    for (var i = 0; i < customers.length; i++) {

        if (customers[i].id == id) {
            customers.splice(i, 1);
            break;
        }
    }

    saveCustomersToStorage();

    displayCustomers();
    updateCustomerSelect();
    updateDashboard();

    showToast("Customer deleted!");
}

function updateCustomerSelect() {

    var select = getElement("cartCustomer");
    var previousValue = select.value;

    var html = '<option value="">Walk-in Customer</option>';

    for (var i = 0; i < customers.length; i++) {

        html +=
            '<option value="' + customers[i].id + '">' +
            escapeHTML(customers[i].name) +
            '</option>';
    }

    select.innerHTML = html;

    if (previousValue != "" && findCustomer(Number(previousValue)) != null) {
        select.value = previousValue;
    }
}
//shoping cart
function addToCart(id) {

    var product = findProduct(id);

    if (product == null) {
        return;
    }

    for (var i = 0; i < cart.length; i++) {

        if (cart[i].id == id) {

            cart[i].quantity++;

            updateCart();
            showToast("Quantity updated!");

            return;
        }
    }

    cart.push({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: 1
    });

    updateCart();
    showToast("Added to cart!");
}

function changeQuantity(id, change) {

    for (var i = 0; i < cart.length; i++) {

        if (cart[i].id == id) {

            cart[i].quantity += change;

            if (cart[i].quantity <= 0) {
                cart.splice(i, 1);
            }

            break;
        }
    }

    updateCart();
}

function removeFromCart(id) {

    for (var i = 0; i < cart.length; i++) {

        if (cart[i].id == id) {
            cart.splice(i, 1);
            break;
        }
    }

    updateCart();
}

function clearCart() {

    if (cart.length == 0) {
        return;
    }

    if (!confirm("Clear all items from the cart?")) {
        return;
    }

    cart = [];

    getElement("discount").value = 0;

    updateCart();

    showToast("Cart cleared!");
}

function calculateTotals() {

    var subtotal = 0;
    var quantity = 0;

    for (var i = 0; i < cart.length; i++) {

        subtotal += cart[i].price * cart[i].quantity;
        quantity += cart[i].quantity;
    }

    var discount = Number(getElement("discount").value);

    if (!Number.isFinite(discount) || discount < 0) {
        discount = 0;
    }

    if (discount > 100) {
        discount = 100;
    }

    var discountAmount = subtotal * discount / 100;
    var total = subtotal - discountAmount;

    return {
        subtotal: subtotal,
        discount: discount,
        discountAmount: discountAmount,
        total: total,
        quantity: quantity
    };
}

function updateCart() {

    var html = "";

    for (var i = 0; i < cart.length; i++) {

        var item = cart[i];

        html +=
            '<div class="cart-item">' +
                '<div>' +
                    '<h4>' + escapeHTML(item.name) + '</h4>' +
                    '<span class="cart-item-price">' + formatMoney(item.price * item.quantity) + '</span>' +
                    '<div class="quantity-control">' +
                        '<button onclick="changeQuantity(' + item.id + ', -1)">-</button>' +
                        '<span>' + item.quantity + '</span>' +
                        '<button onclick="changeQuantity(' + item.id + ', 1)">+</button>' +
                    '</div>' +
                '</div>' +
                '<button class="icon-btn" onclick="removeFromCart(' + item.id + ')">' +
                    '<i class="bi bi-x-lg"></i>' +
                '</button>' +
            '</div>';
    }

    if (cart.length == 0) {

        html =
            '<div class="empty-cart">' +
                '<i class="bi bi-basket2"></i>' +
                '<p>Your cart is empty</p>' +
                '<small>Add some delicious burgers!</small>' +
            '</div>';
    }

    getElement("cartItems").innerHTML = html;

    var totals = calculateTotals();

    getElement("cartCount").textContent = totals.quantity + " items";
    getElement("subtotal").textContent = formatMoney(totals.subtotal);
    getElement("discountAmount").textContent = formatMoney(totals.discountAmount);
    getElement("grandTotal").textContent = formatMoney(totals.total);
}




