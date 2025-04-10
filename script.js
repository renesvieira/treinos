const scriptURL = 'https://script.google.com/macros/s/AKfycbyBPMJEmbA7a8OPGJoV5aD2rSXZNG22tI-IScUAKAnN5-kWFNYaddbrmmTA7y54kAp0Sg/exec';

// Função para mostrar o loader
function mostrarLoader() {
    const loaderDiv = document.createElement('div');
    loaderDiv.className = 'loader';
    document.body.appendChild(loaderDiv);
}

// Função para remover o loader
function removerLoader() {
    const loaderDiv = document.querySelector('.loader');
    if (loaderDiv) {
        document.body.removeChild(loaderDiv);
    }
}

// Verifica se está em uma página de treino (A, B, C ou D)
if (window.location.pathname.includes('treino')) {

    // Marcar exercício como feito (duplo clique)
    document.querySelectorAll('.marcar').forEach((item) => {
        item.addEventListener('dblclick', () => {
            item.classList.toggle('feito');
            // Aqui você pode adicionar a lógica para salvar o estado "feito" se desejar persistência
        });
    });

    // Carregar cargas da planilha
    mostrarLoader(); // Mostra o loader antes de buscar os dados
    fetch(scriptURL)
        .then(response => response.json())
        .then(data => {
            removerLoader(); // Remove o loader após receber os dados
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

                        // Adiciona um evento de escuta para salvar a carga quando o campo perde o foco
                        input.addEventListener('blur', (event) => {
                            const exercicioNome = event.target.getAttribute('data-exercicio');
                            const novaCarga = event.target.value;

                            // Envia os dados para o Google Apps Script para salvar
                            fetch(scriptURL, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded',
                                },
                                body: `exercicio=${encodeURIComponent(exercicioNome)}&carga=${encodeURIComponent(novaCarga)}`
                            })
                            .then(response => response.json())
                            .then(data => {
                                console.log("Carga salva:", data);
                                // Aqui você pode adicionar um feedback visual se quiser (ex: uma mensagem rápida de sucesso)
                            })
                            .catch(error => {
                                console.error("Erro ao salvar carga:", error);
                                // Aqui você pode adicionar uma mensagem de erro para o usuário se quiser
                            });
                        });

                        // Adiciona o texto de descanso ao lado da carga
                        const descansoTexto = descanso ? `${descanso}s | ` : '';
                        p.innerHTML += `<span class="descanso">${descansoTexto}</span>`;
                        p.appendChild(input); // Insere o campo de carga
                    }
                });
            });
        })
        .catch(err => {
            removerLoader(); // Remove o loader em caso de erro também
            console.error("Erro ao carregar cargas:", err);
            // Aqui você pode adicionar uma mensagem de erro amigável para o usuário se quiser
        });

}