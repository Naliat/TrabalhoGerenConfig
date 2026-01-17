# Testes Unitários - Backend

## Descrição

Este diretório contém testes unitários para o backend da aplicação.

## Testes Implementados

### test_validacoes.py
Contém 5 testes unitários simples para validação de e-mail e senha:

1. **test_email_valido**: Verifica se um e-mail válido é aceito
2. **test_email_invalido_sem_arroba**: Verifica se e-mail sem @ é rejeitado
3. **test_senha_valida**: Verifica se senha com 6+ caracteres é aceita
4. **test_senha_curta**: Verifica se senha com menos de 6 caracteres é rejeitada
5. **test_senha_vazia**: Verifica se senha vazia é rejeitada

## Como Executar os Testes

### 1. Instalar dependências
```bash
cd backend
pip install -r requirements.txt
```

### 2. Executar todos os testes
```bash
python -m pytest tests/
```

### 3. Executar com mais detalhes
```bash
python -m pytest tests/ -v
```

### 4. Executar um arquivo específico
```bash
python -m pytest tests/test_validacoes.py
```

### 5. Executar um teste específico
```bash
python -m pytest tests/test_validacoes.py::TestValidacaoEmail::test_email_valido
```

## Estrutura dos Testes

```
backend/
├── tests/
│   ├── __init__.py
│   └── test_validacoes.py
├── pytest.ini
└── requirements.txt (inclui pytest e pytest-mock)
```

## Cobertura dos Testes

Os testes cobrem:
- ✅ Validação de e-mail (formato correto/incorreto)
- ✅ Validação de senha (comprimento mínimo)

## Próximos Passos

Para expandir os testes, você pode adicionar:
- Testes para models (UsuarioModel)
- Testes para services (usuario_service)
- Testes de integração para rotas
- Testes com mocks para banco de dados
