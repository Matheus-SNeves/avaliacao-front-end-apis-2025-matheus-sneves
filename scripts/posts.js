let allPosts = [];
let allUsers = [];

document.addEventListener('DOMContentLoaded', () => {
    const nomeUsuarioHeader = document.getElementById('nomeUsuarioHeader');
    const botaoSair = document.getElementById('botaoSair');
    const searchInput = document.getElementById('searchInput');
    const searchUser = document.getElementById('searchUser');
    const mainContent = document.querySelector('main');

    const postModal = document.getElementById('postModal');
    const modalPostTitle = document.getElementById('modalPostTitle');
    const modalPostContent = document.getElementById('modalPostContent');
    const modalCloseButton = document.querySelector('.modal-close-button');

    const dadosUsuarioString = localStorage.getItem('dadosUsuarioLogado');
    let dadosUsuario = null;
    

    if (dadosUsuarioString) {
        try {
            dadosUsuario = JSON.parse(dadosUsuarioString);

            if (dadosUsuario.expiresAt && Date.now() > dadosUsuario.expiresAt) {
                localStorage.removeItem('dadosUsuarioLogado');
                alert('Tempo acabado. Por favor, faça login novamente.');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 10); 
                return;
            }

            if (dadosUsuario.username) {
                nomeUsuarioHeader.textContent = dadosUsuario.username;
            } else {
                nomeUsuarioHeader.textContent = 'Usuário';
            }
            console.log('Dados do usuário logado carregados:', dadosUsuario);
        } catch (e) {
            console.error('Erro ao parsear dados do usuário do localStorage ou sessão inválida:', e);
            alert('Erro ao carregar dados da sessão. Por favor, faça login novamente.');
            localStorage.removeItem('dadosUsuarioLogado');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 10); 
            return;
        }
    } else {
        alert('Você não está logado. Redirecionando para a tela de login.');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 10); 
        return;
    }

    const checkSessionInterval = setInterval(() => {
        const currentTimestamp = Date.now();
        const dadosUsuarioString = localStorage.getItem('dadosUsuarioLogado');

        if (dadosUsuarioString) {
            try {
                const dadosUsuario = JSON.parse(dadosUsuarioString);

                if (dadosUsuario.expiresAt && currentTimestamp > dadosUsuario.expiresAt) {
                    clearInterval(checkSessionInterval);
                    localStorage.removeItem('dadosUsuarioLogado');
                    alert('Tempo acabado. Por favor, faça login novamente.');
                }
            } catch (e) {
                clearInterval(checkSessionInterval);
                localStorage.removeItem('dadosUsuarioLogado');
                console.error('Erro ao parsear dados do usuário durante verificação periódica:', e);
                alert('Erro na sessão. Faça login novamente.');
            }
        } else {
            clearInterval(checkSessionInterval);
            console.warn('Dados do usuário não encontrados durante verificação periódica.');
        }
    }, 1000);

    if (botaoSair) {
        botaoSair.addEventListener('click', () => {
            localStorage.removeItem('dadosUsuarioLogado');
            alert('Você foi desconectado(a).');
            window.location.href = 'login.html';
        });
    }

    function renderPosts(postsToDisplay) {
        mainContent.innerHTML = '';

        if (postsToDisplay.length === 0) {
            mainContent.innerHTML = '<p>Nenhum post encontrado para os critérios de busca.</p>';
            return;
        }

        postsToDisplay.forEach(post => {
            const card = document.createElement('div');
            card.classList.add('card-post');
            card.dataset.postId = post.id;

            card.innerHTML = `
                <div>
                    <h2>${post.title}</h2>
                    <p>${post.body.substring(0, 40)}...</p>
                    <small>ID do Post: ${post.id} | ID do Usuário: ${post.userId}</small>
                </div>
            `;
            card.addEventListener('click', () => openPostModal(post.id));
            mainContent.appendChild(card);
        });
    }

    async function openPostModal(postId) {
        try {
            const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`);
            if (!response.ok) {
                throw new Error('Erro ao carregar detalhes do post.');
            }
            const postDetails = await response.json();

            modalPostTitle.textContent = postDetails.title;
            modalPostContent.textContent = postDetails.body;

            postModal.classList.add('show');
        } catch (error) {
            console.error('Erro ao abrir o modal do post:', error);
            alert('Não foi possível carregar os detalhes do post. Tente novamente.');
        }
    }

    function closePostModal() {
        postModal.classList.remove('show');
    }

    modalCloseButton.addEventListener('click', closePostModal);
    postModal.addEventListener('click', (event) => {
        if (event.target === postModal) {
            closePostModal();
        }
    });

    async function loadData() {
        try {
            const postsResponse = await fetch('https://jsonplaceholder.typicode.com/posts');
            if (!postsResponse.ok) {
                throw new Error('Erro na rede ou na API ao carregar posts.');
            }
            allPosts = await postsResponse.json();

            const usersResponse = await fetch('https://jsonplaceholder.typicode.com/users');
            if (!usersResponse.ok) {
                throw new Error('Erro na rede ou na API ao carregar usuários.');
            }
            allUsers = await usersResponse.json();

            applyFilters();
        } catch (erro) {
            console.error('Erro ao carregar dados:', erro);
            mainContent.innerHTML = '<p style="color: red;">Não foi possível carregar os dados. Tente novamente mais tarde.</p>';
        }
    }

    function applyFilters() {
        const postSearchTerm = searchInput.value.toLowerCase().trim();
        const userIdSearchTerm = searchUser.value.trim();
        let filteredPosts = allPosts;

        if (userIdSearchTerm !== '') {
            const userIdNum = parseInt(userIdSearchTerm, 10);
            if (!isNaN(userIdNum)) {
                filteredPosts = filteredPosts.filter(post => post.userId === userIdNum);
            } else {
                mainContent.innerHTML = '<p>Por favor, digite um ID de usuário válido (apenas números).</p>';
                return;
            }
        }

        if (postSearchTerm !== '') {
            filteredPosts = filteredPosts.filter(post =>
                post.title.toLowerCase().includes(postSearchTerm)
            );
        }

        renderPosts(filteredPosts);
    }

    loadData();

    searchInput.addEventListener('input', applyFilters);
    searchUser.addEventListener('input', applyFilters);
});