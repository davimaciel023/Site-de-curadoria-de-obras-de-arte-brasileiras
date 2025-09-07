/* =========================================================
   GALERIA — Brasil em Tela
   Estrutura simples, legível e organizada
   ========================================================= */

/* =============== 1) DADOS =============== */

const OBRAS = [
    {
        id: "ob-001",
        titulo: "Retirantes",
        artista: "Cândido Portinari",
        ano: 1944,
        movimento: "Modernismo",
        imagem: "img/retirantes.png",
        miniatura: "img/retirantes.png",
        descricao: "Retrato do êxodo nordestino e da vulnerabilidade social."
    },
    {
        id: "ob-002",
        titulo: "O Mamoeiro",
        artista: "Anita Malfatti",
        ano: 1915,
        movimento: "Modernismo",
        imagem: "img/o_mamoeiro.png",
        miniatura: "img/o_mamoeiro.png",
        descricao: "Cores intensas e pinceladas expressivas na fase moderna da artista."
    },
    {
        id: "ob-003",
        titulo: "Operários",
        artista: "Tarsila do Amaral",
        ano: 1933,
        movimento: "Modernismo",
        imagem: "img/Operarios.jpg",
        miniatura: "img/Operarios.jpg",
        descricao: "A multiplicidade do povo brasileiro com fábricas ao fundo."
    }
]


/* =============== 2) ESTADO =============== */

const CHAVE_STORAGE_FAV = "favoritos"

const estado = {
    todas: [...OBRAS],
    filtradas: [...OBRAS],
    indiceAtual: 0,
    favoritos: new Set(JSON.parse(localStorage.getItem(CHAVE_STORAGE_FAV) || "[]")),
    filtros: {
        termo: "",
        artista: "",
        movimento: "",
        anoMin: "",
        anoMax: "",
        ordenar: "relevancia",
        somenteFavoritos: false
    }
}


/* =============== 3) ELEMENTOS =============== */

// Grid
const elGrade = document.getElementById("artGallery")
const elContadorResultados = document.getElementById("contadorResultados")

// Controles
const elBusca = document.getElementById("busca")
const elFiltroArtista = document.getElementById("filtroArtista")
const elFiltroMovimento = document.getElementById("filtroMovimento")
const elAnoMin = document.getElementById("anoMin")
const elAnoMax = document.getElementById("anoMax")
const elOrdenar = document.getElementById("ordenar")
const elSomenteFavs = document.getElementById("somenteFavoritos")
const elContadorFavs = document.getElementById("contadorFavoritos")

// Modal
const elModal = document.getElementById("artModal")
const elModalImg = document.getElementById("modalImage")
const elModalTitulo = document.getElementById("artModalTitle")
const elModalArtista = document.getElementById("modalArtist")
const elModalAno = document.getElementById("modalYear")
const elModalMov = document.getElementById("modalMovement")
const elModalDesc = document.getElementById("modalDesc")
const elModalFav = document.getElementById("favToggleBtn")
const elBtnPrev = document.getElementById("prevBtn")
const elBtnNext = document.getElementById("nextBtn")


/* =============== 4) HELPERS =============== */

function salvarFavoritosNoStorage() {
    localStorage.setItem(CHAVE_STORAGE_FAV, JSON.stringify([...estado.favoritos]))
}

function normalizarTexto(valor) {
    return (valor ?? "")
        .toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
}

function numeroOuVazio(v) {
    if (v === "" || v == null) return ""
    const n = Number(v)
    return Number.isFinite(n) ? n : ""
}

function atualizarBadgeFavoritos() {
    if (!elContadorFavs) return
    elContadorFavs.textContent = `❤️ ${estado.favoritos.size}`
}

function atualizarContadorResultados() {
    if (!elContadorResultados) return
    const n = estado.filtradas.length
    elContadorResultados.textContent = `${n} obra${n === 1 ? "" : "s"} encontrada${n === 1 ? "" : "s"}.`
}

function popularSelectCom(valores, selectEl) {
    if (!selectEl) return
    const unicos = [...new Set(valores.filter(Boolean))].sort((a, b) => a.localeCompare(b))
    unicos.forEach((v) => {
        const opt = document.createElement("option")
        opt.value = v
        opt.textContent = v
        selectEl.appendChild(opt)
    })
}


/* =============== 5) FILTRAGEM E ORDENAÇÃO =============== */

function aplicarFiltros() {
    const f = estado.filtros
    const termo = normalizarTexto(f.termo)
    const anoMin = numeroOuVazio(f.anoMin)
    const anoMax = numeroOuVazio(f.anoMax)

    let lista = estado.todas.filter((o) => {
        const atendeTermo =
            !termo ||
            [o.titulo, o.artista, o.movimento, o.descricao, String(o.ano || "")]
                .map((v) => normalizarTexto(v))
                .some((v) => v.includes(termo))

        const atendeArtista = !f.artista || o.artista === f.artista
        const atendeMovimento = !f.movimento || o.movimento === f.movimento
        const atendeAnoMin = anoMin === "" || (o.ano || 0) >= anoMin
        const atendeAnoMax = anoMax === "" || (o.ano || 0) <= anoMax
        const atendeFav = !f.somenteFavoritos || estado.favoritos.has(o.id)

        return (
            atendeTermo &&
            atendeArtista &&
            atendeMovimento &&
            atendeAnoMin &&
            atendeAnoMax &&
            atendeFav
        )
    })

    lista = ordenarLista(lista, f.ordenar)

    estado.filtradas = lista
    atualizarContadorResultados()
    renderizarGrade()
}

function ordenarLista(lista, criterio) {
    const coll = new Intl.Collator("pt-BR", { sensitivity: "base" })

    switch (criterio) {
        case "titulo_asc":
            return lista.sort((a, b) => coll.compare(a.titulo || "", b.titulo || ""))
        case "titulo_desc":
            return lista.sort((a, b) => coll.compare(b.titulo || "", a.titulo || ""))
        case "artista_asc":
            return lista.sort((a, b) => coll.compare(a.artista || "", b.artista || ""))
        case "artista_desc":
            return lista.sort((a, b) => coll.compare(b.artista || "", a.artista || ""))
        case "ano_asc":
            return lista.sort((a, b) => (a.ano || 0) - (b.ano || 0))
        case "ano_desc":
            return lista.sort((a, b) => (b.ano || 0) - (a.ano || 0))
        default:
            return lista
    }
}


/* =============== 6) RENDERIZAÇÃO =============== */

function criarCard(obra, indice) {
    const card = document.createElement("div")
    card.className = "obra-hover"
    card.dataset.id = obra.id

    card.innerHTML = `
        <img loading="lazy" src="${obra.miniatura || obra.imagem}" alt="${obra.titulo} - ${obra.artista}" />
        <button class="fav-pill" type="button" aria-pressed="${estado.favoritos.has(obra.id)}" title="Favoritar">❤️</button>
        <div class="info-hover">
            <h4>${obra.titulo}</h4>
            <p>${obra.artista}</p>
        </div>
    `

    const img = card.querySelector("img")
    const btnFav = card.querySelector(".fav-pill")

    img.addEventListener("click", function () {
        abrirModal(indice)
    })

    btnFav.addEventListener("click", function (e) {
        e.stopPropagation()
        alternarFavorito(obra.id)
        this.setAttribute("aria-pressed", String(estado.favoritos.has(obra.id)))

        if (estado.filtros.somenteFavoritos && !estado.favoritos.has(obra.id)) {
            card.remove()
            estado.filtradas = estado.filtradas.filter((o) => o.id !== obra.id)
            posRenderAjusteGrade()
            atualizarContadorResultados()
        }
    })

    return card
}

function renderizarGrade() {
    elGrade.innerHTML = ""

    if (estado.filtradas.length === 0) {
        const vazio = document.createElement("p")
        vazio.textContent = "Nenhuma obra encontrada com os filtros atuais."
        vazio.style.margin = "0 20px 20px"
        elGrade.appendChild(vazio)
        elGrade.classList.remove("single-item")
        return
    }

    const frag = document.createDocumentFragment()

    estado.filtradas.forEach((obra, indice) => {
        const card = criarCard(obra, indice)
        frag.appendChild(card)
    })

    elGrade.appendChild(frag)

    posRenderAjusteGrade()
}

/* === ajusta a grade para o caso de apenas 1 obra === */
function posRenderAjusteGrade() {
    if (estado.filtradas.length === 1) elGrade.classList.add("single-item")
    else elGrade.classList.remove("single-item")
}


/* =============== 7) FAVORITOS =============== */

function alternarFavorito(id) {
    if (estado.favoritos.has(id)) estado.favoritos.delete(id)
    else estado.favoritos.add(id)
    salvarFavoritosNoStorage()
    atualizarBadgeFavoritos()
}


/* =============== 8) MODAL =============== */

function preencherModal(obra) {
    elModalImg.src = obra.imagem
    elModalImg.alt = `${obra.titulo} — ${obra.artista}`
    elModalTitulo.textContent = obra.titulo
    elModalArtista.textContent = obra.artista || "—"
    elModalAno.textContent = obra.ano || "—"
    elModalMov.textContent = obra.movimento || "—"
    elModalDesc.textContent = obra.descricao || ""

    const ehFavorito = estado.favoritos.has(obra.id)
    elModalFav.setAttribute("aria-pressed", String(ehFavorito))
    elModalFav.textContent = ehFavorito ? "❤️ Remover dos favoritos" : "❤️ Favoritar"
}

function abrirModal(indice) {
    estado.indiceAtual = indice
    preencherModal(estado.filtradas[indice])
    elModal.setAttribute("aria-hidden", "false")
    document.body.style.overflow = "hidden"
}

function fecharModal() {
    elModal.setAttribute("aria-hidden", "true")
    document.body.style.overflow = ""
}

function obraAtual() {
    return estado.filtradas[estado.indiceAtual]
}


/* =============== 9) EVENTOS (MODAL) =============== */

document.querySelectorAll("[data-close]").forEach(function (el) {
    el.addEventListener("click", fecharModal)
})

elBtnPrev.addEventListener("click", function () {
    const n = estado.filtradas.length
    estado.indiceAtual = (estado.indiceAtual - 1 + n) % n
    preencherModal(obraAtual())
})

elBtnNext.addEventListener("click", function () {
    const n = estado.filtradas.length
    estado.indiceAtual = (estado.indiceAtual + 1) % n
    preencherModal(obraAtual())
})

window.addEventListener("keydown", function (e) {
    if (elModal.getAttribute("aria-hidden") === "true") return
    if (e.key === "Escape") fecharModal()
    if (e.key === "ArrowLeft") elBtnPrev.click()
    if (e.key === "ArrowRight") elBtnNext.click()
})

elModalFav.addEventListener("click", function () {
    const atual = obraAtual()
    const eraFav = estado.favoritos.has(atual.id)

    alternarFavorito(atual.id)
    preencherModal(atual)

    const btn = document.querySelector(`.obra-hover[data-id="${atual.id}"] .fav-pill`)
    if (btn) btn.setAttribute("aria-pressed", String(estado.favoritos.has(atual.id)))

    if (estado.filtros.somenteFavoritos && eraFav) {
        estado.filtradas = estado.filtradas.filter((o) => o.id !== atual.id)

        if (estado.filtradas.length === 0) {
            fecharModal()
            aplicarFiltros()
            return
        }

        estado.indiceAtual = estado.indiceAtual % estado.filtradas.length
        preencherModal(obraAtual())
        aplicarFiltros()
    }
})


/* =============== 10) EVENTOS (CONTROLES) =============== */

elBusca?.addEventListener("input", function () {
    estado.filtros.termo = this.value.trim()
    aplicarFiltros()
})

elFiltroArtista?.addEventListener("change", function () {
    estado.filtros.artista = this.value
    aplicarFiltros()
})

elFiltroMovimento?.addEventListener("change", function () {
    estado.filtros.movimento = this.value
    aplicarFiltros()
})

elAnoMin?.addEventListener("input", function () {
    estado.filtros.anoMin = numeroOuVazio(this.value)
    aplicarFiltros()
})

elAnoMax?.addEventListener("input", function () {
    estado.filtros.anoMax = numeroOuVazio(this.value)
    aplicarFiltros()
})

elOrdenar?.addEventListener("change", function () {
    estado.filtros.ordenar = this.value
    aplicarFiltros()
})

elSomenteFavs?.addEventListener("change", function () {
    estado.filtros.somenteFavoritos = !!this.checked
    aplicarFiltros()
})


/* =============== 11) BOOT =============== */

document.addEventListener("DOMContentLoaded", function () {
    popularSelectCom(OBRAS.map((o) => o.artista), elFiltroArtista)
    popularSelectCom(OBRAS.map((o) => o.movimento), elFiltroMovimento)

    atualizarBadgeFavoritos()
    aplicarFiltros()
})
