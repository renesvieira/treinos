document.addEventListener('DOMContentLoaded', function () {
    const dataInicio = new Date('2025-04-07');
    const hoje = new Date();
    const semanaElement = document.getElementById('semana-projeto');

    if (semanaElement) {
        if (hoje < dataInicio) {
            semanaElement.textContent = 'PROJETO AINDA NÃO INICIADO';
        } else {
            const diffEmMilissegundos = hoje - dataInicio;
            const diffEmDias = Math.ceil(diffEmMilissegundos / (1000 * 60 * 60 * 24));
            const semanaAtual = Math.ceil(diffEmDias / 7);
            semanaElement.textContent = `SEMANA ${semanaAtual}`;
        }
    }

    const scriptURL = 'https://script.google.com/macros/s/AKfycbyBPMJEmbA7a8OPGJoV5aD2rSXZNG22tI-IScUAKAnN5-kWFNYaddbrmmTA7y54kAp0Sg/exec';
    let loaderDiv;

    function mostrarLoader() {
        const trainingSection = document.querySelector('main.container > section');
        if (trainingSection) {
            trainingSection.style.position = 'relative';
            loaderDiv = document.createElement('div');
            loaderDiv.className = 'loader';
            trainingSection.appendChild(loaderDiv);
        }
    }

    function removerLoader() {
        if (loaderDiv) {
            loaderDiv.remove();
            loaderDiv = null;
        }
    }

    const paginasDeTreino = ['treino_a.html', 'treino_b.html', 'treino_c.html', 'treino_d.html'];

    if (paginasDeTreino.some(pagina => window.location.pathname.includes(pagina))) {
        document.querySelectorAll('.marcar').forEach((item) => {
            item.addEventListener('dblclick', () => {
                item.classList.toggle('feito');
            });
        });

        mostrarLoader();
        fetch(scriptURL)
            .then(response => response.json())
            .then(data => {
                removerLoader();
                data.forEach(entry => {
                    const nome = entry.exercicio.trim();
                    const carga = entry.carga;
                    const descanso = entry.descanso || '';

                    document.querySelectorAll('.card-exercicio').forEach(card => {
                        const titulo = card.querySelector('h3').innerText.trim();
                        if (titulo === nome) {
                            const p = card.querySelector('p');
                            const input = document.createElement('input');
                            input.className = 'carga';
                            input.value = carga || '';
                            input.setAttribute('data-exercicio', nome);

                            input.addEventListener('blur', (event) => {
                                const exercicioNome = event.target.getAttribute('data-exercicio');
                                const novaCarga = event.target.value;

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
                                })
                                .catch(error => {
                                    console.error("Erro ao salvar carga:", error);
                                });
                            });

                            const descansoTexto = descanso ? `${descanso}s | ` : '';
                            p.innerHTML += `<span class="descanso">${descansoTexto}</span>`;
                            p.appendChild(input);
                        }
                    });
                });
            })
            .catch(err => {
                removerLoader();
                console.error("Erro ao carregar cargas:", err);
            });
    }

    // 🧠 CRONÔMETRO COM BASE NO TEMPO REAL
    document.querySelectorAll('.timer-btn').forEach(button => {
        button.addEventListener('click', () => {
            let duration = parseInt(button.getAttribute('data-duration'), 10);
            if (isNaN(duration)) duration = 90;

            const endTime = Date.now() + duration * 1000;
            const originalText = button.textContent; // Captura o texto original do botão

            // Função para solicitar permissão (se ainda não concedida) e iniciar o timer
            const requestAndStartTimer = () => {
                if (Notification.permission === "default") {
                    console.log('Solicitando permissão de notificação no clique...');
                    Notification.requestPermission().then(permission => {
                        if (permission === "granted") {
                            console.log('Permissão de notificação concedida no clique.');
                            startActualTimer(); // Inicia o timer após permissão
                        } else if (permission === "denied") {
                            console.warn('Permissão de notificação negada no clique.');
                            startActualTimer(false); // Inicia o timer, mas sem notificações
                        }
                    }).catch(error => {
                        console.error('Erro ao solicitar permissão de notificação no clique:', error);
                        startActualTimer(false); // Em caso de erro, inicia sem notificação
                    });
                } else {
                    // Se a permissão já foi dada ou negada, apenas inicia o timer
                    startActualTimer(Notification.permission === "granted");
                }
            };

            // Função que realmente gerencia o timer e as notificações
            const startActualTimer = (shouldNotify = true) => {
                button.disabled = true; // Desabilita o botão imediatamente

                function updateTimer() {
                    const remaining = Math.ceil((endTime - Date.now()) / 1000);
                    if (remaining <= 0) {
                        button.textContent = originalText;
                        button.disabled = false;

                        // Notificação quando o cronômetro terminar
                        if (shouldNotify) {
                            new Notification("O tempo de descanso acabou!", {
                                body: "É hora de continuar seu treino!",
                                // icon: "/caminho/para/seu/icone.png", // Mantenha comentado ou use um caminho real, ex: '/favicon.ico'
                            });
                        }

                    } else {
                        button.textContent = `${remaining}s`;
                        setTimeout(updateTimer, 1000);
                    }
                }
                updateTimer(); // Inicia a contagem
            };

            // Chama a função principal de requisição e início do timer
            requestAndStartTimer();
        });
    });

    // Removido a solicitação de permissão no DOMContentLoaded, agora é no clique
});