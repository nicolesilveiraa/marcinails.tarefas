Sistema de Lista de Tarefas - Nails Marci 

Este projeto consiste em uma aplicação para gerenciamento de rotinas diárias voltada para profissionais de Nail Design. 
O desenvolvimento foca na aplicação prática de conceitos de DevOps e Gerência de Configuração, garantindo a integridade e automação do ciclo de vida do software.


1. Descrição do Projeto e Objetivo da Solução
A rotina de um espaço de nail design exige o controle rigoroso de tarefas além dos atendimentos (esterilização, estoque, marketing).
O Nails Marci resolve o problema do esquecimento dessas tarefas críticas, oferecendo uma interface simples para cadastro, edição e acompanhamento de atividades, evitando prejuízos e otimizando o tempo da profissional.


2. Estrutura do Repositório:
   
A organização segue os padrões de Gerência de Configuração para separar os Itens de Configuração (IC):

/.github/workflows/: Contém os arquivos de automação do pipeline.

/src/: Código-fonte da aplicação (HTML, CSS e JavaScript).

/scripts/: Scripts de validação e apoio ao desenvolvimento.

/docs/: Documentação técnica e capturas de tela do protótipo.

README.md: Documentação principal do projeto.


3. Explicação do Workflow (main.yml)
   
O arquivo de configuração do workflow (main.yml) define a inteligência da nossa Integração Contínua. Ele é configurado com:

Trigger (Gatilho): Ativado automaticamente a cada push realizado na branch main.

Ambiente: Executado em um container virtual com o sistema operacional ubuntu-latest.

Permissões: Garante permissão de execução (chmod +x) para os scripts de validação antes de rodá-los.


4. Explicação do Pipeline e Fluxo de Execução
   
O pipeline é composto por 3 etapas automáticas que garantem que o código enviado está dentro dos padrões esperados:

Etapa 1 - Boas-vindas: Imprime uma mensagem no console indicando o início do processo de integração.
Etapa 2 - Listagem de Arquivos: Executa um comando ls -R para verificar se a estrutura de pastas e arquivos está correta no ambiente virtual.
Etapa 3 - Executar Script: Aciona o script validar_projeto.sh. Este script verifica especificamente se o arquivo index.html existe. 
Se o arquivo estiver lá, o pipeline finaliza com sucesso (Verde). Se faltar, o pipeline falha (Vermelho).

Resumo do Fluxo:
Push do Código ➔ Disparo do Workflow ➔ Checkout do Código ➔ Boas-vindas ➔ Check de Pastas ➔ Validação de Arquivos Críticos ➔ Status Final (Sucesso/Falha)


5. Gerência de Configuração e Baseline
   
Para assegurar a rastreabilidade, utilizamos Commits Semânticos e definimos uma Baseline v1.0.

Baseline: Criada através da funcionalidade de Releases/Tags do GitHub, representando o estado estável e homologado do sistema para a entrega final.
Rastreabilidade: O histórico de commits demonstra todas as refatorações realizadas para corrigir inconsistências na estrutura de pastas detectadas pelo pipeline.



6. Tecnologias Utilizadas:
   
Interface: HTML5, CSS3 e JavaScript (Design em Preto e Rosa Vibrante).
Automação: Shell Script (Bash).
Versionamento: Git e GitHub.
CI/CD: GitHub Actions.
Prototipação: Figma.
Gestão de Projeto: Trello com Power-Up

Equipe do Projeto
- **Nicole Silveira** — Contribuiu (Pipeline, Protótipo, Gerência de Configuração, e auxiliou na criação da documentação.)
- **Juliana Palma** — Contribuiu (Requisitos,Planejamento, e auxiliou na criação da documentação.)
- **Vítor Raniery** — Contribuiu (Documentação Overleaf)
- **Emmanuel Souza** — Contribuiu (Documentação Técnica, e ajudou na organização das informações do repositório)

