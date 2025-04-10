const scriptURL = 'https://script.google.com/macros/s/AKfycbyBPMJEmbA7a8OPGJoV5aD2rSXZNG22tI-IScUAKAnN5-kWFNYaddbrmmTA7y54kAp0Sg/exec';

let loaderDiv; // Referência para o elemento loader

// Função para mostrar o loader dentro da section de treino
function mostrarLoader() {
    const trainingSection = document.querySelector('main.container > section'); // Seleciona a section
    if (trainingSection) {
        trainingSection.style.position = 'relative'; // Define a section como container
        loaderDiv = document.createElement('div');
        loaderDiv.className = 'loader';
        trainingSection.appendChild(loaderDiv);
    }
}

// Função para remover o loader
function removerLoader() {
    const trainingSection = document.querySelector('main.container > section');
    if (trainingSection && loaderDiv) {
        trainingSection.removeChild(loaderDiv);
        trainingSection.style.position = ''; // Remove o relative (opcional)
        loaderDiv = null;
    }
}

// Array com os "pedaços" do pathname que indicam uma página de treino
const paginasDeTreino = ['treino_a.html', 'treino_b.html', 'treino_c.html', 'treino_d.html'];

// Verifica se a página atual é uma das páginas de treino
if (paginasDeTreino.some(pagina => window.location.pathname.includes(pagina))) {
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