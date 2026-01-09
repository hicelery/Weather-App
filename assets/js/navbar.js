document.querySelectorAll(".navbar-collapse .nav-link").forEach((link) => {
    link.addEventListener("click", function (e) {
        // Use the clicked link element's href (not e.target which may be a child node)
        const href = this.getAttribute("href");
        // Get the hash portion even if href contains a path (e.g. index.html#section)
        const hash = href ? new URL(href, window.location.href).hash : "";
        const section = hash ? document.querySelector(hash) : null;
        console.log(section);
        if (section) {
            e.preventDefault(); // Prevent default anchor click behavior
            const navbarHeight =
                document.querySelector(".navbar-toggler").offsetHeight;
            window.scroll({
                top: section.offsetTop - navbarHeight, // Adjust for navbar height
                behavior: "smooth",
            });
            document.querySelector(".navbar-collapse").classList.remove("show"); // Collapse navbar
        }
    });
});
