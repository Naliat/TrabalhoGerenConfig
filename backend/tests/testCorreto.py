import pytest
import logging
import sys
import os
import time
from datetime import datetime

# Configuração de logs para um terminal limpo, mas informativo
logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.routes.usuario_routes import validar_email, validar_senha_forte

class TestValidacoesUsuario:

    @classmethod
    def setup_class(cls):
        """Executa uma vez antes de todos os testes da classe"""
        cls.start_time = time.time()
        logger.info("\n" + "="*80)
        logger.info(f"🚀 INICIANDO BATERIA DE TESTES: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
        logger.info("="*80)

    @classmethod
    def teardown_class(cls):
        """Executa uma vez após todos os testes da classe"""
        duration = time.time() - cls.start_time
        logger.info("\n" + "="*80)
        logger.info(f"🏁 FINALIZADO EM: {duration:.4f} segundos")
        logger.info("="*80 + "\n")

    # --- TESTES DE E-MAIL ---
    @pytest.mark.parametrize("email, deve_passar", [
        ("aluno@quixada.ufc.br", True),
        ("professor@gmail.com", True),
        ("usuario_sem_arroba.com", False),
        ("email@dominio", False),
        ("", False),
    ])
    def test_email(self, email, deve_passar):
        logger.info(f"🔹 [EMAIL] Analisando: '{email}'")
        
        start = time.time()
        valido, mensagem = validar_email(email)
        elapsed = (time.time() - start) * 1000
        
        status = "✅ PASSED" if valido == deve_passar else "❌ FAILED"
        
        logger.info(f"   Status: {status} ({elapsed:.2f}ms)")
        logger.info(f"   Resultado do Sistema: {mensagem}")
        
        if not valido == deve_passar:
            logger.error(f"   ⚠️ DISCREPÂNCIA DETECTADA: Esperava {deve_passar} mas recebi {valido}")
            
        assert valido == deve_passar

    # --- TESTES DE SENHA ---
    @pytest.mark.parametrize("senha, deve_passar, cenario", [
        ("Ola12345!!", True, "Senha completa (Ideal)"),
        ("12345", False, "Muito curta"),
        ("senhateste", False, "Apenas minúsculas"),
        ("SenhaSemNumero!!", False, "Sem número"),
        ("Ola12345", False, "Sem símbolo"),
        ("ola12345!!", False, "Sem maiúscula"),
        ("OLA12345!!", False, "Sem minúscula"),
    ])
    def test_senha(self, senha, deve_passar, cenario):
        logger.info(f"🔸 [SENHA] Cenário: {cenario}")
        
        start = time.time()
        valido, mensagem, detalhes = validar_senha_forte(senha)
        elapsed = (time.time() - start) * 1000
        
        status = "✅ PASSED" if valido == deve_passar else "❌ FAILED"
        
        logger.info(f"   Status: {status} ({elapsed:.2f}ms) | Entrada: '{senha}'")
        logger.info(f"   Checklist: {detalhes}")
        
        if not valido == deve_passar:
            logger.error(f"   ❌ MOTIVO DA FALHA: {mensagem}")
            
        assert valido == deve_passar