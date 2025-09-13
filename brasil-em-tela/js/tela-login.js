document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#loginForm form")

    form.addEventListener("submit", async (event) => {
        event.preventDefault()

        const email = document.getElementById("emailLogin").value.trim()
        const senha = document.getElementById("passwordLogin").value.trim()

        if (!email || !senha) {
            alert("Preencha todos os campos.")
            return
        }

        try {
            const res = await fetch(`http://localhost:3000/usuarios?email=${email}&senha=${senha}`)
            const usuarios = await res.json()

            if (usuarios.length === 1) {
                alert("Login realizado com sucesso!")
                window.location.href = "index.html"
            } else {
                alert("Email ou senha incorretos.")
            }
        } catch (err) {
            console.error("Erro ao logar:", err)
            alert("Erro no servidor")
        }
    })
})
