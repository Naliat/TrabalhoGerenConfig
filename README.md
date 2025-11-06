sitask/
├── **backend/** 🐍 # API REST com Flask
│ ├── **app/** ⚙️ # Código principal da aplicação Flask
│ │ ├── `__init__.py`  # ➕ Inicialização (Flask app, MongoDB)
│ │ ├── **models/** 💾 # Estruturas de Dados (Esquemas de Banco de Dados)
│ │ │ ├── `usuario.py`
│ │ │ ├── `estudo.py`
│ │ │ └── `revisao.py`
│ │ │
│ │ ├── **routes/** 🛣️ # Definição dos Endpoints da API (Blueprints)
│ │ │ ├── `usuario_routes.py`
│ │ │ ├── `estudo_routes.py`
│ │ │ └── `revisao_routes.py`
│ │ │
│ │ ├── **services/** 💼 # Lógica de Negócio (CRUD, Geração de Revisões)
│ │ │ ├── `usuario_service.py`
│ │ │ ├── `estudo_service.py`
│ │ │ └── `revisao_service.py`
│ │ │
│ │ └── **utils/** 🛠️ # Funções Auxiliares (Datas, Helpers)
│ │     └── `helpers.py`
│ │
│ ├── **tests/** 🧪 # Testes Unitários e de Integração
│ │ ├── `test_usuario.py`
│ │ ├── `test_estudo.py`
│ │ └── `test_revisao.py`
│ │
│ ├── **instance/** 🔒 # Configurações Sensíveis/Locais (e.g., MongoDB URI)
│ │ └── `config.json`
│ │
│ ├── `config.py`  # Configurações Globais (Development, Production)
│ ├── `run.py`  # ▶️ Ponto de Entrada da Aplicação Flask
│ └── `requirements.txt`  # Dependências Python
│
└── **frontend/** ⚛️ # Aplicação Single Page (React + Vite)
    ├── `index.html`  # Página Raiz
    ├── `package.json`  # Dependências e Scripts npm
    ├── `vite.config.js`  # Configurações do Bundler
    ├── **public/** 🌐 # Assets Públicos (Favicon, Manifest)
    │ └── `favicon.svg`
    │
    └── **src/** 🏗️ # Código Fonte do React
        ├── **assets/** 🖼️ # Imagens, Ícones
        │ └── `logo.svg`
        │
        ├── **components/** 🧩 # Componentes Reutilizáveis
        │ ├── `Navbar.jsx`
        │ ├── `CardEstudo.jsx`
        │ └── `RevisaoItem.jsx`
        │
        ├── **pages/** 📄 # Views Principais (Rotas)
        │ ├── `Login.jsx`
        │ ├── `Dashboard.jsx`
        │ ├── `Cronograma.jsx`
        │ └── ...outras.jsx
        │
        ├── **services/** 📡 # Módulos de Comunicação com a API (Axios)
        │ ├── `api.js`  # Configuração do Axios
        │ ├── `usuarioService.js`
        │ ├── `estudoService.js`
        │ └── `revisaoService.js`
        │
        ├── **styles/** 🎨 # CSS Global ou Configurações do Tailwind
        │ ├── `index.css`
        │ └── `theme.css`
        │
        ├── `App.jsx`  # 🔄 Componente Raiz com Roteamento
        └── `main.jsx`  # Ponto de Entrada do React DOM