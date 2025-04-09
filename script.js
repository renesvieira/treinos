const scriptURL = 'https://script.google.com/macros/s/AKfycbyBPMJEmbA7a8OPGJoV5aD2rSXZNG22tI-IScUAKAnN5-kWFNYaddbrmmTA7y54kAp0Sg/exec';

// Verifica se está em uma página de treino (A, B, C ou D)
if (window.location.pathname.includes('treino')) {

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
        })
        .catch(err => {
            console.error("Erro ao carregar cargas:", err);
        });

} else {
    // Não há necessidade de fazer nada aqui, porque o loader foi removido
}
