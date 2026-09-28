document.addEventListener("DOMContentLoaded", () => {
    // Elementos da Interface
    const header = document.getElementById("header");
    const btnMenu = document.getElementById("btn-menu");
    const mobileDrawer = document.getElementById("mobile-drawer");
    const navOverlay = document.getElementById("nav-overlay");
    
    // Elementos de Busca Dinâmica
    const searchInput = document.getElementById("search-input");
    const searchDropdown = document.getElementById("search-dropdown");
    const searchResultsList = document.getElementById("search-results-list");

    // Base de dados simulada para busca instantânea de contatos
    const contatos = [
        { nome: "Ana Carolina", email: "ana.c@email.com" },
        { nome: "Bruno Almeida", email: "bruno@email.com" },
        { nome: "Carlos Eduardo", email: "carlos@email.com" },
        { nome: "Daniela Martins", email: "daniela@email.com" },
        { nome: "Fernanda Souza", email: "fernanda@email.com" }
    ];

    /* 1. Header Fixo com Efeito de Sombra */
    window.addEventListener("scroll", () => {
        if (window.scrollY > 20) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });

    /* 2. Controle do Menu Mobile Drawer */
    const toggleMobileMenu = () => {
        const isActive = mobileDrawer.classList.toggle("active");
        navOverlay.classList.toggle("active");
        btnMenu.classList.toggle("active");
    };

    if (btnMenu) btnMenu.addEventListener("click", toggleMobileMenu);
    if (navOverlay) navOverlay.addEventListener("click", toggleMobileMenu);

    /* 3. Busca Filtro em Tempo Real no Header */
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase().trim();

            if (query.length > 0) {
                const resultados = contatos.filter(c => 
                    c.nome.toLowerCase().includes(query) || 
                    c.email.toLowerCase().includes(query)
                );

                if (resultados.length > 0) {
                    searchResultsList.innerHTML = resultados.map(c => `
                        <li>
                            <a href="#">
                                <strong>${c.nome}</strong><br>
                                <small style="color:#64748b">${c.email}</small>
                            </a>
                        </li>
                    `).join("");
                } else {
                    searchResultsList.innerHTML = `
                        <li style="padding:10px; color:#94a3b8; font-size:0.85rem;">
                            Nenhum contato encontrado
                        </li>`;
                }
                searchDropdown.hidden = false;
            } else {
                searchDropdown.hidden = true;
            }
        });

        // Ocultar busca ao clicar fora
        document.addEventListener("click", (e) => {
            if (!e.target.closest("#search-form")) {
                searchDropdown.hidden = true;
            }
        });
    }
});