document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#cadastroForm form")

    const api = "http://localhost:3000"
    const rotaUser = `${api}/usuarios`

    form.addEventListener("submit", async (event) => {
        event.preventDefault()

        const nome = document.getElementById("nome").value.trim()
        const emailRaw = document.getElementById("email").value.trim()
        const email = emailRaw.toLowerCase() 
        const senha = document.getElementById("password").value.trim()

        if (!nome || !email || !senha) {
            alert("Por favor, preencha todos os campos.")
            return
        }
        if (senha.length < 6) {
            alert("A senha deve ter pelo menos 6 caracteres.")
            return
        }

        try {
            const resBusca = await fetch(`${rotaUser}?email=${encodeURIComponent(email)}`)
            if (!resBusca.ok) throw new Error("Falha ao consultar usuários.")
            const existentes = await resBusca.json()

            if (existentes.length > 0) {
                alert("Esse email já está cadastrado!")
                return
            }

            const resPost = await fetch(rotaUser, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, email, senha })
            })

            if (!resPost.ok) {
                const texto = await resPost.text().catch(() => "")
                throw new Error(`Falha no cadastro (status ${resPost.status}). ${texto}`)
            }

            alert("Cadastro realizado com sucesso!")
            window.location.href = "../telaLogin.html"
        } catch (err) {
            console.error("Erro ao cadastrar:", err)
            alert("Erro no servidor")
        }
    })
})
