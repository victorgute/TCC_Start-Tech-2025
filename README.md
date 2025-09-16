# EcoManager - Plataforma de Gestão ESG

![EcoManager Dashboard](https://github.com/user-attachments/assets/cae63b60-8dba-484b-8417-1ab2e3f1bdfc)

### Tabela de Conteúdos
1. [Sobre o Projeto](#sobre-o-projeto)
2. [Funcionalidades Principais](#funcionalidades-principais)
3. [Arquitetura da Solução](#arquitetura-da-solução)
4. [Como Começar (Instalação)](#como-começar-instalação)
5. [Roadmap de Evoluções](#roadmap-de-evoluções)
6. [Equipe](#equipe)

---
## Sobre o Projeto

O EcoManager é uma aplicação web completa, desenvolvida como parte do projeto **Start Tech TOTVS**, com o objetivo de aplicar de forma prática os conhecimentos de desenvolvimento de software e cloud computing.

A plataforma foi criada para ajudar empresas a monitorar, gerir e otimizar os seus indicadores de sustentabilidade, alinhados às práticas de **ESG (Environmental, Social, and Governance)**. O EcoManager resolve o problema da recolha e análise descentralizada de dados de consumo, transformando informações complexas em dashboards visuais, relatórios exportáveis e metas acionáveis.

---
## Funcionalidades Principais

* **Autenticação Segura:** Login e registo de utilizadores utilizando **Firebase Authentication**, com suporte para email/senha e login social (Google).
* **Calculadoras de Impacto:** Ferramentas para calcular o impacto ambiental em quatro áreas-chave: Energia, Água, Resíduos e TI Circular.
* **Dashboards Dinâmicos:** Gráficos interativos gerados com **Chart.js** que visualizam os dados inseridos em tempo real.
* **Gestão com Workspaces:** Sistema que permite aos utilizadores criar e alternar entre diferentes "áreas de trabalho" para organizar os seus dados (ex: por filial, por ano).
* **CRUD Completo:**
    * **Lançamentos:** Os utilizadores podem ver e apagar (CRUD - Create, Read, Delete) os dados que inseriram.
    * **Metas ESG:** Gestão completa de metas (CRUD - Create, Read, Update, Delete) que são guardadas de forma persistente no banco de dados.
* **Página de Metas Inteligente:** O progresso das metas é calculado e atualizado automaticamente com base nos dados dos dashboards.
* **Relatórios e Exportação:** Funcionalidade para exportar todos os dados de um workspace para um arquivo `.csv`.
* **Gestão de Perfil:** Os utilizadores podem visualizar e atualizar as suas informações de conta.

---
## Arquitetura da Solução

A aplicação utiliza uma arquitetura de nuvem moderna, segura и escalável, hospedada na **Amazon Web Services (AWS)**.

* **Front-end:**
    * **Tecnologias:** HTML5, CSS3, JavaScript (ES Modules)
    * **Build Tool:** Vite.js
    * **Descrição:** Uma interface de utilizador reativa e responsiva, que consome os dados da nossa API de back-end.

* **Back-end:**
    * **Tecnologias:** Node.js, Express.js
    * **Gestor de Processos:** PM2
    * **Descrição:** Uma API RESTful que lida com a lógica de negócio, autenticação e comunicação com o banco de dados.

* **Cloud e DevOps:**
    * **Modelo:** Híbrido **IaaS** (EC2 para a aplicação) e **PaaS** (DynamoDB e SSM para serviços geridos).
    * **Computação:** A aplicação corre numa instância **AWS EC2**.
    * **Banco de Dados:** **AWS DynamoDB** com um design de tabela única (Single-Table Design).
    * **Segurança:**
        * **AWS IAM Role** associada à instância EC2 para acesso seguro aos serviços.
        * **AWS SSM Parameter Store** для gestão centralizada e segura de todas as chaves de API e segredos.
        * **HTTPS** ativado com certificado SSL gratuito via **Certbot (Let's Encrypt)**.
    * **CI/CD:** Pipeline de deploy contínuo configurado com **GitHub Actions** que, a cada `push` na branch `main`, atualiza e reinicia a aplicação no servidor EC2 automaticamente.

---
## Como Começar (Instalação)

Siga estes passos para configurar e executar o projeto num ambiente de desenvolvimento local.

### Pré-requisitos
* Node.js (versão 18 ou superior)
* Git
* Conta na AWS com as credenciais configuradas
* Parâmetros criados no AWS SSM Parameter Store e tabela criada no DynamoDB

### 1. Clonar o Repositório
```bash
git clone (https://github.com/victorgute/TCC_Start-Tech-2025.git)

cd TCC_Start-Tech-2025

# Navegue para a pasta do back-end
cd backend

# Instale as dependências
npm install

# A partir da raiz do projeto, navegue para a pasta do front-end
cd frontend

# Instale as dependências
npm install

# Executar a Aplicação Você precisará de dois terminais abertos.
cd backend
npm run dev
# O servidor da API estará a correr em http://localhost:3001

# O site estará acessível em http://localhost:5173 (ou outra porta indicada pelo Vite)
cd frontend
npm run dev
