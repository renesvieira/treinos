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
            const semanaAtual = Math.ceil(diffEmMilissegundos / 7);
            semanaElement.textContent = `SEMANA ${semanaAtual}`;
        }
    }

    // URL da sua planilha Google Sheets (Google Apps Script)
    const scriptURL = 'https://script.google.com/macros/s/AKfycbyBPMJEmbA7a8OPGJoV5aD2rSXZNG22tI-IScUAKAnN5-kWFNYaddbrmbTA7y54kAp0Sg/exec';
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
        // Funcionalidade de marcar exercício como feito
        document.querySelectorAll('.marcar').forEach((item) => {
            item.addEventListener('dblclick', () => {
                item.classList.toggle('feito');
            });
        });

        // Carregar e exibir cargas da planilha
        mostrarLoader();
        fetch(scriptURL)
            .then(response => response.json())
            .then(data => {
                removerLoader();
                data.forEach(entry => {
                    const nome = entry.exercicio.trim();
                    const carga = entry.carga;
                    const descanso = entry.descanso || ''; // Certifica que 'descanso' existe

                    document.querySelectorAll('.card-exercicio').forEach(card => {
                        const titulo = card.querySelector('h3').innerText.trim();
                        if (titulo === nome) {
                            const p = card.querySelector('p');
                            
                            // Cria o input de carga
                            const input = document.createElement('input');
                            input.className = 'carga';
                            input.type = 'text'; // Define o tipo para texto ou number
                            input.placeholder = 'kg'; // Placeholder para indicar kg
                            input.value = carga || ''; // Preenche com a carga existente
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

                            // Atualiza o parágrafo com as informações da planilha e o input
                            // Remova o conteúdo antigo de 'p' antes de adicionar o novo, se necessário
                            // Ou garanta que só está adicionando uma vez.
                            p.innerHTML = `${p.innerText.split('|')[0].trim()} | `; // Mantém a parte de séries/reps
                            p.innerHTML += `<span class="descanso">${descanso ? `${descanso}s | ` : ''}</span>`;
                            p.appendChild(input);
                        }
                    });
                });
            })
            .catch(err => {
                removerLoader();
                console.error("Erro ao carregar cargas:", err);
                // Você pode adicionar um elemento para mostrar um erro ao usuário aqui
            });
    }

    // 🧠 CRONÔMETRO COM BASE NO TEMPO REAL
    document.querySelectorAll('.timer-btn').forEach(button => {
        button.addEventListener('click', () => {
            // Tente solicitar permissão de forma mais direta e imediata no clique
            if (Notification.permission === "default") {
                console.log('Solicitando permissão de notificação (tentativa direta no clique)...');
                Notification.requestPermission(); // Apenas solicite, sem then/catch inicial
            }

            let duration = parseInt(button.getAttribute('data-duration'), 10);
            if (isNaN(duration)) duration = 90;

            const endTime = Date.now() + duration * 1000;
            const originalText = button.textContent;

            const startActualTimer = (shouldNotify = true) => {
                button.disabled = true;

                function updateTimer() {
                    const remaining = Math.ceil((endTime - Date.now()) / 1000);
                    if (remaining <= 0) {
                        button.textContent = originalText;
                        button.disabled = false;

                        // Notificação quando o cronômetro terminar
                        if (shouldNotify && Notification.permission === "granted") {
                            new Notification("O tempo de descanso acabou!", {
                                body: "É hora de continuar seu treino!",
                                // icon: "/icons/icon-192x192.png", // Use o ícone real se tiver um
                                vibrate: [200, 100, 200] // Adiciona vibração
                            });
                        }

                    } else {
                        button.textContent = `${remaining}s`;
                        setTimeout(updateTimer, 1000);
                    }
                }
                updateTimer();
            };

            startActualTimer(Notification.permission === "granted" || Notification.permission === "default");
        });
    });

    // Código para registrar o Service Worker (Adicionado para PWA)
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => {
            console.log('ServiceWorker registrado com sucesso:', registration.scope);
          })
          .catch(error => {
            console.log('Falha no registro do ServiceWorker:', error);
          });
      });
    }
});