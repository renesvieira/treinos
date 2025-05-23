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

            // **MUDANÇA AQUI: Solicitar permissão no clique do botão, se ainda não concedida**
            if (Notification.permission === "default") {
                console.log('Solicitando permissão de notificação no primeiro clique...');
                Notification.requestPermission().then(permission => {
                    if (permission === "granted") {
                        console.log('Permissão de notificação concedida no clique.');
                        // Prossegue com o timer e notificação
                        startTimerAndNotification(button, duration, originalText);
                    } else if (permission === "denied") {
                        console.warn('Permissão de notificação negada no clique.');
                        // Se negou, ainda podemos iniciar o timer sem notificação
                        startTimerAndNotification(button, duration, originalText, false); // Passa false para não notificar
                    }
                }).catch(error => {
                    console.error('Erro ao solicitar permissão de notificação no clique:', error);
                    startTimerAndNotification(button, duration, originalText, false); // Em caso de erro, inicia sem notificação
                });
            } else {
                // Se a permissão já foi dada ou negada, apenas inicia o timer (e notifica se "granted")
                const shouldNotify = Notification.permission === "granted";
                startTimerAndNotification(button, duration, originalText, shouldNotify);
            }
        });
    });

    // Função para iniciar o timer e a notificação (separada para reutilização)
    function startTimerAndNotification(button, duration, originalText, shouldNotify = true) {
        const endTime = Date.now() + duration * 1000;
        button.disabled = true;

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
        updateTimer();
    }

    // REMOVIDO: A solicitação inicial de permissão foi movida para o clique do botão
    // if (Notification.permission === "default") {
    //     Notification.requestPermission();
    // }
});