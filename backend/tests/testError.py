import pytest
import logging
import sys
import os
import time
from datetime import datetime

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.routes.usuario_routes import validar_email, validar_senha_forte

class TestValidacoesUsuario:

    @classmethod
    def setup_class(cls):
        cls.start_time = time.time()
        logger.info("\n" + "="*80)
        logger.info(f"🚀 INICIANDO BATERIA DE TESTES: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
        logger.info("="*80)

    @classmethod
    def teardown_class(cls):
        duration = time.time() - cls.start_time
        logger.info("\n" + "="*80)
        logger.info(f"🏁 FINALIZADO EM: {duration:.4f} segundos")
        logger.info("="*80 + "\n")

    @pytest.mark.parametrize("email, deve_passar, cenario", [
        ("aluno@quixada.ufc.br", True, "E-mail institucional"),
        ("professor@gmail.com", True, "E-mail comum"),
        ("usuario_sem_arroba.com", False, "Falta @"),
        ("email@dominio", False, "Falta TLD (.com)"),
        ("", False, "Campo vazio"),
        ("falha_proposital@teste.com", False, "FORÇANDO FALHA: E-mail válido mas esperado False"),
    ])
    def test_email(self, email, deve_passar, cenario):
        logger.info(f"🔹 [EMAIL] {cenario} | Analisando: '{email}'")
        
        start = time.time()
        valido, mensagem = validar_email(email)
        elapsed = (time.time() - start) * 1000
        
        status = "✅ PASSED" if valido == deve_passar else "❌ FAILED"
        
        logger.info(f"   Status: {status} ({elapsed:.2f}ms)")
        logger.info(f"   Mensagem: {mensagem}")
        
        if not valido == deve_passar:
            logger.error(f"   ⚠️ ERRO: Esperava {deve_passar} mas a função retornou {valido}")
            
        assert valido == deve_passar

    @pytest.mark.parametrize("senha, deve_passar, cenario", [
        ("Ola12345!!", True, "Senha completa (Ideal)"),
        ("12345", False, "Muito curta"),
        ("senhateste", False, "Apenas minúsculas"),
        ("SenhaSemNumero!!", False, "Sem número"),
        ("Ola12345", False, "Sem símbolo"),
        ("ola12345!!", False, "Sem maiúscula"),
        ("OLA12345!!", False, "Sem minúscula"),
        ("123", True, "FORÇANDO FALHA: Senha curta mas esperada True"),
    ])
    def test_senha(self, senha, deve_passar, cenario):
        logger.info(f"🔸 [SENHA] {cenario}")
        
        start = time.time()
        valido, mensagem, detalhes = validar_senha_forte(senha)
        elapsed = (time.time() - start) * 1000
        
        status = "✅ PASSED" if valido == deve_passar else "❌ FAILED"
        
        logger.info(f"   Status: {status} ({elapsed:.2f}ms) | Entrada: '{senha}'")
        logger.info(f"   Checklist: {detalhes}")
        
        if not valido == deve_passar:
            logger.error(f"   ❌ MOTIVO DA FALHA: {mensagem}")
            
        assert valido == deve_passar