document.addEventListener('DOMContentLoaded', () => {
    const URL_API_LOGIN = 'https://dummyjson.com/auth/login';

    const formularioLogin = document.getElementById('formularioLogin');
    const campoUsuario = document.getElementById('usuario');
    const campoSenha = document.getElementById('senha');
    const duracaoSessaoInput = document.getElementById('duracaoSessao');
    const mensagemErro = document.getElementById('mensagemErro');

    formularioLogin.addEventListener('submit', async (evento) => {
        evento.preventDefault();

        const usuarioDigitado = campoUsuario.value;
        const senhaDigitada = campoSenha.value;
        const duracaoMinutos = parseInt(duracaoSessaoInput.value, 10);

        mensagemErro.textContent = 'Verificando credenciais...';
        mensagemErro.style.color = '#007bff';

        try {
            const resposta = await fetch(URL_API_LOGIN, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: usuarioDigitado,
                    password: senhaDigitada
                })
            });

            if (resposta.ok) {
                const dadosLogin = await resposta.json();
                console.log('Login bem-sucedido. Dados da API:', dadosLogin);

                const expiresAt = Date.now() + (duracaoMinutos * 60 * 1000);

                const dadosParaSalvar = {
                    username: dadosLogin.username,
                    token: dadosLogin.token,
                    loginTime: Date.now(),
                    expiresAt: expiresAt
                };
                localStorage.setItem('dadosUsuarioLogado', JSON.stringify(dadosParaSalvar));

                mensagemErro.textContent = 'Login realizado com sucesso!';
                mensagemErro.style.color = '#28a745';
                window.location.href = 'posts.html';

            } else {
                const dadosErro = await resposta.json();
                const mensagemDeErroApi = dadosErro.message || 'Credenciais inválidas.';
                console.error('Erro de autenticação:', mensagemDeErroApi);

                mensagemErro.textContent = mensagemDeErroApi;
                mensagemErro.style.color = '#e74c3c';
            }

        } catch (erro) {
            console.error('Erro de rede:', erro);
            mensagemErro.textContent = 'Erro ao tentar conectar. Verifique sua conexão ou tente mais tarde.';
            mensagemErro.style.color = '#e74c3c';
        }
    });
});