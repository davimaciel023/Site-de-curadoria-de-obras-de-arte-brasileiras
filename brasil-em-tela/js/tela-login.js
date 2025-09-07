document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    console.log('Usuário:', email);
    console.log('Senha:', password);

    if (email === 'admin@gmail.com'  && password === 'admin') {
        window.location.href = 'index.html';
    } else {
        alert('Credenciais inválidas. Tente novamente.');
        return;
    }

    alert('Login realizado com sucesso!');
});