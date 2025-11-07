from app import create_app # Corrigido: Não usa 'backend.'

app = create_app()

if __name__ == '__main__':
    # Certifique-se de que a variável de ambiente FLASK_APP está configurada 
    # ou use app.run() para rodar.
    app.run(debug=True)