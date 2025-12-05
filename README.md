# SITASK - Sistema de Gerenciamento de Estudos e Revisões 🧠

---

### 💡 Sobre o Projeto

O **SITasks** é uma aplicação web desenvolvida como projeto final para a disciplina de **Linguagens de Programação** da Universidade Federal do Ceará (UFC).

O sistema visa **auxiliar estudantes** no gerenciamento eficiente de suas rotinas acadêmicas, oferecendo ferramentas para organizar cronogramas, registrar sessões de estudo, agendar revisões periódicas e acompanhar o progresso em diferentes disciplinas.


### 🌐 Acesse o Projeto Online

O projeto está hospedado e disponível para uso imediato:

🔗 **[Clique aqui para acessar o site](https://trab-de-lip-sitask.onrender.com/)**

#### 📱 QR Code do site

Para acesso rápido via dispositivo móvel:

![QR Code do site](./QrcodeSite.png)

---

### Tecnologias Utilizadas

O SITasks é construído como uma aplicação Full-Stack, utilizando a seguinte pilha tecnológica:

#### Frontend (Client-Side)

| Categoria | Tecnologia | Uso Principal |
| :--- | :--- | :--- |
| **Estrutura** | **HTML5** | Fornece a estrutura semântica das páginas. |
| **Estilização** | **CSS3** | Layout responsivo e design da interface. |
| **Lógica** | **JavaScript (ES6+)** | Interação com o usuário e comunicação via API. |
| **Organização** | **Módulos JS** | Separação de lógica em arquivos como `login.js`, `reset-password.js` e `forgot-password.js`. |

#### Backend (API e Servidor)

| Categoria | Tecnologia | Uso Principal |
| :--- | :--- | :--- |
| **Linguagem** | **Python 3.12** | Linguagem principal de back-end. |
| **Framework** | **Flask** | Micro-framework para criação das rotas RESTful da API. |
| **Banco de Dados** | **MongoDB** | Armazenamento NoSQL para dados de usuários e tarefas. |
| **E-mail** | **SendGrid** | Serviço para envio de e-mails transacionais (ex: recuperação de senha). |
| **Utilidades** | `Flask-CORS`, `python-dotenv`, `bson` | Gerenciamento de CORS, variáveis de ambiente e manipulação de IDs do MongoDB. |

---

### Estrutura de Diretórios

A estrutura do projeto separa claramente o *backend* (API Flask) e o *frontend* (HTML/CSS/JS):

```bash
.
├── backend
│   ├── app
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models
│   │   ├── routes
│   │   └── services
│   ├── instance
│   ├── run.py
│   └── tests
├── frontend
│   ├── assets
│   ├── css
│   ├── js
│   ├── index.html
│   └── pages
├── padraoCommits.txt
├── README.md
└── venv
