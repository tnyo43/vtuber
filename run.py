from flask import Flask, render_template
from geventwebsocket.handler import WebSocketHandler
app = Flask(__name__)

@app.route("/")
def index():
    return "This is the index page"

@app.route("/recognize")
def recognize():
    return render_template('index.html')

if __name__ == "__main__":
    app.run()

