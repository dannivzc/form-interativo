document.addEventListener('DOMContentLoaded', () => {
    function validarFormulario() {
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const regexCPF = /^\d{11}$/;
        const regexCEP = /^\d{8}$/;
        const regexTelefone = /^\d{10,11}$/;
        const regexData = /^\d{4}-\d{2}-\d{2}$/; // Formato yyyy-mm-dd

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

                if (valor === '') {
                    mostrarErro(input, `${campo.label} é obrigatório`);
                    formularioValido = false;
                } else {
                    removerErro(input);
                }

                if (campo.id === 'email' && valor !== '' && !regexEmail.test(valor)) {
                    mostrarErro(input, 'E-mail inválido');
                    formularioValido = false;
                }

                if (campo.id === 'cpf' && valor !== '' && !regexCPF.test(valor)) {
                    mostrarErro(input, 'CPF deve conter apenas 11 dígitos numéricos');
                    formularioValido = false;
                }

                if (campo.id === 'cep' && valor !== '' && !regexCEP.test(valor)) {
                    mostrarErro(input, 'CEP deve conter apenas 8 dígitos numéricos');
                    formularioValido = false;
                }

                if (campo.id === 'telefone' && valor !== '' && !regexTelefone.test(valor)) {
                    mostrarErro(input, 'Telefone deve conter 10 ou 11 dígitos numéricos');
                    formularioValido = false;
                }

                if (campo.id === 'dataDeNascimento' && valor !== '' && !regexData.test(valor)) {
                    mostrarErro(input, 'Data de nascimento deve estar no formato YYYY-MM-DD');
                    formularioValido = false;
                }
            });

            const termosAceitos = document.getElementById('termos').checked;
            if (!termosAceitos) {
                mostrarErro(document.getElementById('termos'), 'Você deve aceitar os termos e condições');
                formularioValido = false;
            }

            const trilhaSelecionada = document.getElementById('trilhaSelecionada').value;
            if (!trilhaSelecionada) {
                mostrarErro(document.querySelector('.trilhas-container'), 'Selecione uma trilha de aprendizagem');
                formularioValido = false;
            }

            if (formularioValido) {
                const dadosFormulario = {};
                camposObrigatorios.forEach(campo => {
                    const input = document.getElementById(campo.id);
                    if (input) dadosFormulario[campo.id] = input.value.trim();
                });

                localStorage.setItem('dadosFormulario', JSON.stringify(dadosFormulario));
                prompt('INSCRIÇÃO REALIZADA COM SUCESSO');
                window.location.href = 'success.html';
            } else {
                prompt('INSCRIÇÃO NÃO REALIZADA. Por favor, corrija os erros.');
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

    function mostrarErro(elemento, mensagem) {
        if (!elemento) return;

        elemento.classList.add('is-invalid');

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

    function buscarCEP() {
        const inputCEP = document.getElementById('cep');
        const cep = inputCEP.value.replace(/\D/g, '');

        if (!/^\d{8}$/.test(cep)) {
            mostrarErro(inputCEP, 'CEP deve ter 8 dígitos numéricos');
            return;
        }

        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(response => response.json())
            .then(data => {
                if (data.erro) throw new Error('CEP não encontrado');

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

    const dadosSalvos = JSON.parse(localStorage.getItem('dadosFormulario'));
    if (dadosSalvos) {
        Object.keys(dadosSalvos).forEach(chave => {
            const input = document.getElementById(chave);
            if (input) input.value = dadosSalvos[chave];
        });
    }

    document.getElementById('cep').addEventListener('blur', buscarCEP);

    document.querySelectorAll('.trilha-box').forEach(trilha => {
        trilha.addEventListener('click', () => {
            document.querySelectorAll('.trilha-box').forEach(t => t.classList.remove('selecionada'));
            trilha.classList.add('selecionada');
            document.getElementById('trilhaSelecionada').value = trilha.dataset.trilha;
            removerErro(document.querySelector('.trilhas-container'));
        });
    });

    validarFormulario();
});
