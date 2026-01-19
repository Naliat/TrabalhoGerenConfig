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
├── backend
│   ├── app
│   │   ├── database.py
│   │   ├── __init__.py
│   │   ├── logger.py
│   │   ├── models
│   │   │   ├── __init__.py
│   │   │   ├── __pycache__
│   │   │   └── usuario_model.py
│   │   ├── __pycache__
│   │   │   ├── database.cpython-312.pyc
│   │   │   ├── __init__.cpython-312.pyc
│   │   │   └── logger.cpython-312.pyc
│   │   ├── routes
│   │   │   ├── admin_routes.py
│   │   │   ├── __pycache__
│   │   │   └── usuario_routes.py
│   │   └── services
│   │       ├── email_service.py
│   │       └── usuario_service.py
│   ├── config.py
│   ├── dockerfile
│   ├── relatorio_testes.txt
│   ├── requirements.txt
│   ├── run.py
│   └── tests
│       ├── __init__.py
│       ├── __pycache__
│       │   ├── __init__.cpython-312.pyc
│       │   ├── oi.cpython-312-pytest-7.4.3.pyc
│       │   ├── testC.cpython-312-pytest-7.4.3.pyc
│       │   ├── testCorreto.cpython-312-pytest-7.4.3.pyc
│       │   ├── testError.cpython-312-pytest-7.4.3.pyc
│       │   └── test_validacoes.cpython-312-pytest-7.4.3.pyc
│       ├── README.md
│       ├── testCorreto.py
│       ├── testError.py
│       └── test_validacoes.py
├── docker-compose.yml
├── frontend
│   ├── css
│   │   ├── admin.css
│   │   ├── esqueciSenha.css
│   │   ├── pomodoro.css
│   │   └── style.css
│   ├── dockerfile
│   ├── index.html
│   ├── js
│   │   ├── admin.js
│   │   ├── app.js
│   │   ├── cronograma.js
│   │   ├── estudos.js
│   │   ├── export.js
│   │   ├── forgot-password.js
│   │   ├── login.js
│   │   ├── navigation.js
│   │   ├── notifications.js
│   │   ├── pomodoro.js
│   │   ├── register.js
│   │   ├── relatorios.js
│   │   ├── reset-password.js
│   │   ├── revisoes.js
│   │   ├── usuario.js
│   │   └── utils.js
│   └── pages
│       ├── admin.html
│       ├── app.html
│       ├── forgot-password.html
│       ├── login.html
│       ├── registro.html
│       └── reset-password.html
├── QrcodeSite.png
└── README.md
