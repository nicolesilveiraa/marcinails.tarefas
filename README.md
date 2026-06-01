Sistema de Lista de Tarefas - Nails Marci

Este projeto consiste em uma aplicação para gerenciamento de rotinas diárias voltada para profissionais de nail design. O desenvolvimento foca na aplicação prática de conceitos de DevOps e gerência de configuração, garantindo a integridade e automação do ciclo de vida do software.

Descrição do Projeto e Objetivo da Solução
A rotina de um espaço de nail design exige o controle rigoroso de tarefas além dos atendimentos (esterilização, estoque, marketing). O Nails Marci resolve o problema do esquecimento dessas tarefas críticas, oferecendo uma interface simples para cadastro, edição e acompanhamento de atividades, otimizando o tempo da profissional.

Evolução Funcional (Baseline 2.0)
Nesta atualização, o projeto evoluiu para um sistema funcional com banco de dados integrado criado do zero. As principais novidades incluem:

Autenticação e segurança: Sistema de login e cadastro com salvamento no banco de dados e bloqueio de rotas para usuários não logados, exibindo avisos de redirecionamento.
Gestão de Tarefas: Integração de funcionalidade para exclusão direta de tarefas via lixeira no dashboard.
Customização de Perfil: Área de perfil com edição de nome, configuração de notificações e inclusão de botões de privacidade, ajuda e logout seguro.

Estrutura do Repositório:
A organização segue os padrões de Gerência de Configuração para separar os Itens de Configuração (IC):

/.github/workflows/: Contém os arquivos de automação do pipeline.
/src/: Código-fonte da aplicação (HTML, CSS e JavaScript).
/scripts/: Scripts de validação e apoio ao desenvolvimento.
/docs/: Documentação técnica completa e evidências (Parte 8).
deployment.yaml: Configuração para Kubernetes.
Dockerfile: Receita de container da aplicação.
README.md: Documentação principal do projeto.

Documentação de Gerência de Configuração (Parte 8)
Para atender aos requisitos técnicos da disciplina, a documentação detalhada encontra-se na pasta /docs:

Itens de Configuração e Baseline: Definidos conforme solicitado para a versão 2.0.
Controle de Mudanças: Registro das evoluções da 1a para a 2a unidade.
Solicitação de Mudança: Exemplo de nova feature fictícia aplicada ao fluxo.
Gerência de Dependências: Análise de riscos e controle de bibliotecas.
Auditoria de Configuração: Tabela de conformidade do projeto.

Arquitetura e Infraestrutura
A representação visual da arquitetura (Pod, Service e Acesso do usuário) encontra-se disponível no arquivo /docs/arquitetura.png. O arquivo de configuração (deployment.yaml) está na raiz do repositório para consulta.

Tecnologias Utilizadas:
Interface: HTML5, CSS3 e JavaScript (Design em Preto e Rosa Vibrante).
Backend: Banco de dados integrado (Supabase).
Automação: Shell Script (Bash).
Versionamento: Git e GitHub.
CI/CD: GitHub Actions.
Prototipação: Figma.
Gestão de Projeto: Trello com Power-Up

Equipe:

Nicole Silveira
Juliana Catarine
Vitor Raniery
