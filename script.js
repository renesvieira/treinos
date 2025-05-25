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
            const originalText = button.textContent;

            button.disabled = true;

            function updateTimer() {
                const remaining = Math.ceil((endTime - Date.now()) / 1000);
                if (remaining <= 0) {
                    button.textContent = originalText;
                    button.disabled = false;
                    
                    // Vibração e Notificação quando o cronômetro terminar
                    // No iOS (Safari), a vibração e notificações em segundo plano têm suporte limitado
                    if ('vibrate' in navigator) {
                        navigator.vibrate([200, 100, 200]); // Vibra por 200ms, pausa 100ms, vibra por 200ms
                    }

                    if (Notification.permission === "granted") {
                        new Notification("O tempo de descanso acabou!", {
                            body: "É hora de continuar seu treino!",
                            icon: "/treinos/icons/icon-192x192.png", // Caminho corrigido para /treinos/
                        });
                    } else if (Notification.permission !== "denied") {
                        // Solicitar permissão se ainda não foi concedida (apenas após interação do usuário)
                        Notification.requestPermission().then(permission => {
                            if (permission === "granted") {
                                new Notification("O tempo de descanso acabou!", {
                                    body: "É hora de continuar seu treino!",
                                    icon: "/treinos/icons/icon-192x192.png", // Caminho corrigido para /treinos/
                                });
                            }
                        });
                    }

                } else {
                    button.textContent = `${remaining}s`;
                    setTimeout(updateTimer, 1000);
                }
            }

            updateTimer();
        });
    });

    // A linha abaixo foi removida para que a solicitação de permissão ocorra apenas no clique do botão.
    // if (Notification.permission === "default") {
    //     Notification.requestPermission();
    // }
});

// Registrar Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Ajuste o caminho e escopo para o GitHub Pages (agora /treinos/)
    navigator.serviceWorker.register('/treinos/sw.js', { scope: '/treinos/' })
      .then(registration => {
        console.log('ServiceWorker registrado com sucesso com escopo: ', registration.scope);
      })
      .catch(error => {
        console.log('Falha no registro do ServiceWorker: ', error);
      });
  });
}