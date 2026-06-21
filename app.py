from flask import Flask, Response, render_template, jsonify, request
from logic.ai_move import ai_move_hard, ai_move_medium

app = Flask(__name__)


@app.route("/")
def home() -> str:
    return render_template("index.html")


@app.route("/api/ai-move", methods=["POST"])
def api_ai_move() -> Response:
    data = request.get_json()
    board = data["board"]
    ai_player = data["aiPlayer"]
    human_player = "O" if ai_player == "X" else "X"
    difficulty = data.get("difficulty", "medium")

    if difficulty == "medium":
        position = ai_move_medium(board, ai_player, human_player)
    else:
        position = ai_move_hard(board, ai_player, human_player)

    return jsonify({"position": position})


if __name__ == "__main__":
    app.run(debug=True)
