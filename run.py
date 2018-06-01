from flask import Flask, render_template
from geventwebsocket.handler import WebSocketHandler
app = Flask(__name__)

@app.route("/")
def index():
    return "This is the index page"

@app.route("/recognize")
def recognize():
    return render_template('index.html')

@app.route("/login")
def login():
    return render_template('login.html')

@app.route("/channel-main")
def main():
    return render_template('main.html')

@app.route("/terminal")
def terminal():
    return render_template('terminal.html')

if __name__ == "__main__":
    app.run()

