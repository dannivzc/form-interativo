document.addEventListener('DOMContentLoaded', () => {
    function validarFormulario() {
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex para validar e-mail
        
        document.querySelector('form').addEventListener('submit', (event) => {
            event.preventDefault();

            const camposObrigatorios = [
                { id: 'nomeCompleto', label: 'Nome completo' },
                { id: 'dataDeNascimento', label: 'Data de nascimento' },
                { id: 'cpf', label: 'CPF' },
                { id: 'email', label: 'E-mail' },
                { id: 'telefone', label: 'Telefone' },
                { id: 'sexo', label: 'Sexo' },
                { id: 'cep', label: 'CEP' },
                { id: 'rua', label: 'Rua' },
                { id: 'numero', label: 'Número' },
                { id: 'cidade', label: 'Cidade' },
                { id: 'estado', label: 'Estado' },
                { id: 'trilhaSelecionada', label: 'Trilha de Aprendizagem' }
            ];

            let formularioValido = true;

            camposObrigatorios.forEach(campo => {
                const input = document.getElementById(campo.id);
                const valor = input ? input.value.trim() : '';
                
                // Validação dos campos obrigatórios
                if (valor === '') {
                    mostrarErro(input, `${campo.label} é obrigatório`);
                    formularioValido = false;
                } else {
                    removerErro(input);
                }
                if (campo.id === 'email' && valor !== '') {
                    if (!regexEmail.test(valor)) {
                        mostrarErro(input, 'E-mail inválido');
                        formularioValido = false;
                    }
                }
            });

            const termosAceitos = document.getElementById('termos').checked;
            if (!termosAceitos) {
                mostrarErro(document.getElementById('termos'), 'Você deve aceitar os termos e condições');
                formularioValido = false;
            }

            // Validação da trilha selecionada
            const trilhaSelecionada = document.getElementById('trilhaSelecionada').value;
            if (!trilhaSelecionada) {
                mostrarErro(document.querySelector('.trilhas-container'), 'Selecione uma trilha de aprendizagem');
                formularioValido = false;
            }

            // Se tudo OK envia o formulário
            if (formularioValido) {
                const dadosFormulario = {};
                camposObrigatorios.forEach(campo => {
                    const input = document.getElementById(campo.id);
                    if (input) {
                        dadosFormulario[campo.id] = input.value.trim();
                    }
                });
                
                // Salva dadosFormulario no LocalStorage
                localStorage.setItem('dadosFormulario', JSON.stringify(dadosFormulario));
                
                alert('INSCRIÇÃO REALIZADA COM SUCESSO');
                window.location.href = 'success.html';
            }
        });

        document.querySelectorAll("input, select").forEach((input) => {
            input.addEventListener("input", () => {
                removerErro(input);
 
                if (input.id === 'email' && input.value.trim() !== '') {
                    if (!regexEmail.test(input.value)) {
                        mostrarErro(input, 'E-mail inválido');
                    }
                }
            });
        });
    }

    // Funções auxiliares 
    function mostrarErro(elemento, mensagem) {
        if (!elemento) return;
        
        elemento.classList.add('is-invalid');
        
        // atualiza a mensagem de erro
        let erroElemento = elemento.nextElementSibling;
        if (!erroElemento || !erroElemento.classList.contains('mensagem-erro')) {
            erroElemento = document.createElement('div');
            erroElemento.className = 'mensagem-erro';
            elemento.parentNode.insertBefore(erroElemento, elemento.nextSibling);
        }
        
        erroElemento.textContent = mensagem;
        erroElemento.style.color = 'red';
        erroElemento.style.fontSize = '0.8rem';
        erroElemento.style.marginTop = '0.25rem';
    }

    function removerErro(elemento) {
        if (!elemento) return;
        
        elemento.classList.remove('is-invalid');
        
        const erroElemento = elemento.nextElementSibling;
        if (erroElemento && erroElemento.classList.contains('mensagem-erro')) {
            erroElemento.remove();
        }
    }

    // Função para buscar o CEP
    function buscarCEP() {
        const inputCEP = document.getElementById('cep');
        const cep = inputCEP.value.replace(/\D/g, '');
        
        if (cep.length !== 8) {
            mostrarErro(inputCEP, 'CEP deve ter 8 dígitos');
            return;
        }
        
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(response => response.json())
            .then(data => {
                if (data.erro) {
                    throw new Error('CEP não encontrado');
                }
                document.getElementById('rua').value = data.logradouro || '';
                document.getElementById('cidade').value = data.localidade || '';
                document.getElementById('estado').value = data.uf || '';
                
                removerErro(inputCEP);
            })
            .catch(error => {
                console.error(error);
                mostrarErro(inputCEP, 'CEP não encontrado. Verifique o número digitado.');
            });
    }

    // Carrega dados do formulário do LocalStorage
    const dadosSalvos = JSON.parse(localStorage.getItem('dadosFormulario'));
    if (dadosSalvos) {
        Object.keys(dadosSalvos).forEach(chave => {
            const input = document.getElementById(chave);
            if (input) {
                input.value = dadosSalvos[chave];
            }
        });
    }

    // Event listeners
    document.getElementById('cep').addEventListener('blur', buscarCEP);
    
    // Event listeners para as trilhas
    document.querySelectorAll('.trilha-box').forEach(trilha => {
        trilha.addEventListener('click', () => {
            document.querySelectorAll('.trilha-box').forEach(t => {
                t.classList.remove('selecionada');
            });
            trilha.classList.add('selecionada');
            document.getElementById('trilhaSelecionada').value = trilha.dataset.trilha;
            removerErro(document.querySelector('.trilhas-container'));
        });
    });
    validarFormulario();
});
