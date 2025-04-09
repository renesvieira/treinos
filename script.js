const scriptURL = 'https://script.google.com/macros/s/AKfycbyBPMJEmbA7a8OPGJoV5aD2rSXZNG22tI-IScUAKAnN5-kWFNYaddbrmmTA7y54kAp0Sg/exec';

// Verifica se está em uma página de treino (A, B, C ou D)
if (window.location.pathname.includes('treino')) {
    // Cria e adiciona o loader apenas nas páginas de treino
    const loader = document.createElement('div');
    loader.classList.add('loader');
    document.body.appendChild(loader);

    // Marcar exercício como feito (duplo clique)
    document.querySelectorAll('.marcar').forEach((item) => {
        item.addEventListener('dblclick', () => {
            item.classList.toggle('feito');
        });
    });

    // Carregar cargas da planilha
    fetch(scriptURL)
        .then(response => response.json())
        .then(data => {
            data.forEach(entry => {
                const nome = entry.exercicio.trim();
                const carga = entry.carga;
                const descanso = entry.descanso || ''; // Caso o descanso seja vazio

                document.querySelectorAll('.card-exercicio').forEach(card => {
                    const titulo = card.querySelector('h3').innerText.trim();
                    if (titulo === nome) {
                        const p = card.querySelector('p');

                        // Adiciona a carga como um campo editável
                        const input = document.createElement('input');
                        input.className = 'carga';
                        input.value = carga || ''; // Se não houver carga, deixa em branco
                        input.setAttribute('data-exercicio', nome);

                        // Adiciona o texto de descanso ao lado da carga
                        const descansoTexto = descanso ? `${descanso}s | ` : '';
                        p.innerHTML += `<span class="descanso">${descansoTexto}</span>`;
                        p.appendChild(input); // Insere o campo de carga

                    }
                });
            });

            // Remover o loader após 3 segundos
            setTimeout(() => {
                loader.style.display = 'none';  // Esconde o loader após 3 segundos
            }, 3000);  // 3000ms = 3 segundos
        })
        .catch(err => {
            console.error("Erro ao carregar cargas:", err);
            loader.style.display = 'none';  // Esconde o loader caso haja erro
        });

    // Detectar alteração da carga
    document.addEventListener('input', (e) => {
        if (e.target.classList && e.target.classList.contains('carga')) {
            e.target.dataset.edited = true;
        }
    });

    // Salvar nova carga
    document.addEventListener('blur', (e) => {
        if (e.target.classList && e.target.classList.contains('carga') && e.target.dataset.edited) {
            const nome = e.target.dataset.exercicio;
            const novaCarga = e.target.value;

            fetch(scriptURL, {
                method: 'POST',
                body: new URLSearchParams({
                    "exercicio": nome,
                    "carga": novaCarga
                })
            });

            delete e.target.dataset.edited;
        }
    }, true);

} else {
    // Se não estiver em uma página de treino, remove o loader se existir
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.style.display = 'none';
    }
}
