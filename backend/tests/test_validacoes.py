"""
Testes unitários para funções de validação
"""
import pytest
import sys
import os

# Adiciona o diretório backend ao path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.routes.usuario_routes import validar_email, validar_senha_forte


class TestValidacaoEmail:
    """Testes para validação de e-mail"""
    
    def test_email_valido(self):
        """Teste 1: Verifica se e-mail válido é aceito"""
        valido, mensagem = validar_email("usuario@exemplo.com")
        assert valido is True
        assert "válido" in mensagem.lower()
    
    def test_email_invalido_sem_arroba(self):
        """Teste 2: Verifica se e-mail sem @ é rejeitado"""
        valido, mensagem = validar_email("usuarioexemplo.com")
        assert valido is False
        assert "inválido" in mensagem.lower()


class TestValidacaoSenha:
    """Testes para validação de senha"""
    
    def test_senha_valida(self):
        """Teste 3: Verifica se senha com 6+ caracteres é aceita"""
        valido, mensagem, detalhes = validar_senha_forte("senha123")
        assert valido is True
        assert detalhes["min_len"] is True
    
    def test_senha_curta(self):
        """Teste 4: Verifica se senha com menos de 6 caracteres é rejeitada"""
        valido, mensagem, detalhes = validar_senha_forte("12345")
        assert valido is False
        assert "6 caracteres" in mensagem
        assert detalhes["min_len"] is False
    
    def test_senha_vazia(self):
        """Teste 5: Verifica se senha vazia é rejeitada"""
        valido, mensagem, detalhes = validar_senha_forte("")
        assert valido is False
        assert detalhes["min_len"] is False
