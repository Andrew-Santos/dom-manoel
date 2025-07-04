document.addEventListener('DOMContentLoaded', function() {
    // Configuração do Supabase
    const supabaseUrl = 'https://zbvirsjyvybhpusdnjxq.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpidmlyc2p5dnliaHB1c2RuanhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNDI3OTcsImV4cCI6MjA2MDkxODc5N30.wTP6w7pyZNIWkhuvv2OMLx6kfnh5_-iice8q_141HUE';
    
    const supabase = supabase.createClient(supabaseUrl, supabaseKey);

    // Elementos do DOM
    const etapas = document.querySelectorAll('.etapa');
    const formCodigo = document.getElementById('formCodigo');
    const formNome = document.getElementById('formNome');
    const formTelefone = document.getElementById('formTelefone');
    const codigoInput = document.getElementById('codigo');
    const nomeInput = document.getElementById('nome');
    const telefoneInput = document.getElementById('telefone');
    const mensagemCodigo = document.getElementById('mensagemCodigo');

    // Variável para armazenar o código válido
    let codigoValido = '';

    // Máscara para o telefone
    telefoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        let formattedValue = '';
        
        if (value.length > 0) {
            formattedValue = '(' + value.substring(0, 2);
        }
        if (value.length > 2) {
            formattedValue += ') ' + value.substring(2, 3);
        }
        if (value.length > 3) {
            formattedValue += ' ' + value.substring(3, 7);
        }
        if (value.length > 7) {
            formattedValue += '-' + value.substring(7, 11);
        }
        
        e.target.value = formattedValue;
    });

    // Formatar código e nome para maiúsculas
    codigoInput.addEventListener('input', function() {
        this.value = this.value.toUpperCase();
    });

    nomeInput.addEventListener('input', function() {
        this.value = this.value.toUpperCase();
    });

    // Etapa 1: Verificar código
    formCodigo.addEventListener('submit', async function(e) {
        e.preventDefault();
        const codigo = codigoInput.value.trim();
        
        try {
            // Verifica se o código existe na tabela sorteio
            const { data, error } = await supabase
                .from('sorteio')
                .select('nome')
                .eq('codigo', codigo)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 é o erro quando nenhum resultado é encontrado
                throw error;
            }

            if (data) {
                if (data.nome) {
                    mensagemCodigo.textContent = 'Código expirado, entre em contato com a loja.';
                } else {
                    codigoValido = codigo;
                    mostrarEtapa(2);
                    mensagemCodigo.textContent = '';
                }
            } else {
                mensagemCodigo.textContent = 'Código divergente.';
            }
        } catch (error) {
            console.error('Erro ao verificar código:', error);
            mensagemCodigo.textContent = 'Erro ao verificar código. Tente novamente.';
        }
    });

    // Etapa 2: Coletar nome
    formNome.addEventListener('submit', function(e) {
        e.preventDefault();
        if (nomeInput.value.trim() === '') {
            alert('Por favor, digite seu nome completo.');
            return;
        }
        mostrarEtapa(3);
    });

    // Etapa 3: Coletar telefone e enviar dados
   formTelefone.addEventListener('submit', async function(e) {
    e.preventDefault();
    const telefone = telefoneInput.value.replace(/\D/g, '');
    
    if (telefone.length !== 11) {
        alert('Por favor, digite um telefone válido com 11 dígitos.');
        return;
    }
    
    try {
        // Obtém a data e hora atual no formato local (Brasília)
        const now = new Date();
        const dataAtual = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
        
        // Atualiza os campos incluindo a data
        const { data, error } = await supabaseClient
            .from('sorteio')
            .update({
                nome: nomeInput.value.trim(),
                telefone: telefone,
                data: dataAtual
            })
            .eq('codigo', codigoValido);

        if (error) throw error;

        mostrarEtapa(4);
        setTimeout(() => {
            window.location.href = 'https://www.instagram.com/churrascariadommanoel';
        }, 3000);
    } catch (error) {
        console.error('Erro ao enviar dados:', error);
        alert('Erro ao enviar dados. Tente novamente.');
    }
});

    // Função para mostrar uma etapa específica
    function mostrarEtapa(numero) {
        etapas.forEach(etapa => etapa.classList.remove('ativa'));
        document.getElementById(`etapa${numero}`).classList.add('ativa');
    }
});