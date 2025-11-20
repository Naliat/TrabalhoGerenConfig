# SITASK - Sistema de Gerenciamento de Estudos e Revisões

## Sobre esse sistema;

### Esse sistema foi proposto na disciplina de Linguagens de Programação da Universidade Federal do Ceará e visa ajudar nas atividades dos estudantes.

---

## 🌐 Acesse o projeto online
🔗 [Clique aqui para acessar o site](https://trab-de-lip-sitask.onrender.com/)

ou se achar melhor

## 📱 QR Code do site
Para acessar rapidamente, basta escanear o QR Code abaixo:

![QR Code do site](./QrcodeSite.png)

---

## 🖥️ Tecnologias utilizadas

### Frontend
- **HTML5** → Estrutura das páginas
- **CSS3** → Estilização e layout responsivo
- **JavaScript (ES6+)** → Lógica de interação e funcionalidades
- Organização em módulos (`js/`) para funcionalidades como:
  - `login.js`, `register.js`, `usuario.js`
  - `cronograma.js`, `estudos.js`, `revisoes.js`
  - `notifications.js`, `export.js`, `utils.js`

### Backend
- **Python 3.12** → Linguagem principal
- **Flask** → Framework web para rotas e APIs
- **SQLAlchemy** → ORM para manipulação do banco de dados
- **SQLite/PostgreSQL** (dependendo da configuração futura) → Banco de dados
- Estrutura modular:
  - `app/models`, `app/routes`, `app/services`, `app/utils`
  - Arquivos principais: `run.py`, `config.py`, `database.py`

---

## 📂 Estrutura de diretórios

```bash
.
├── backend
│   ├── app
│   ├── config.py
│   ├── database.py
│   ├── instance
│   ├── run.py
│   └── tests
├── frontend
│   ├── assets
│   ├── css
│   │   └── style.css
│   ├── index.html
│   ├── js
│   └── pages
├── padraoCommits.txt
├── README.md
└── venv

```

## Autores

Esse projeto foi desenvolvido por:

- [Tailan de Souza](https://github.com/Naliat)
- [Carlos Jefferson](https://github.com/carlosjeferson)