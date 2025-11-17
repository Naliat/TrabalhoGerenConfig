from app import create_app

app = create_app()

if __name__ == '__main__':
    # >>> A alteração crucial é aqui:
    app.run(debug=True)