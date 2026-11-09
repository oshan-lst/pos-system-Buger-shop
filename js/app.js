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
