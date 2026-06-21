import random

from logic.check_winner import check_winner


def minimax(
    board, depth, is_maximizing, ai_player, human_player,
    alpha=-float("inf"), beta=float("inf"), max_depth=6,
    move_order=None, cache=None,
):
    if cache is None:
        cache = {}

    key = (tuple(tuple(row) for row in board), is_maximizing)
    if key in cache:
        return cache[key]

    if check_winner(board, ai_player):
        return 1
    if check_winner(board, human_player):
        return -1
    if all(cell != "" for row in board for cell in row):
        return 0
    if depth >= max_depth:
        return _heuristic(board, ai_player, human_player)

    n = len(board)
    positions = move_order if move_order else range(1, n * n + 1)

    if is_maximizing:
        max_eval = -float("inf")
        for position in positions:
            row, col = divmod(position - 1, n)
            if board[row][col] == "":
                board[row][col] = ai_player
                eval_score = minimax(board, depth + 1, False, ai_player, human_player,
                                      alpha, beta, max_depth, move_order, cache)
                board[row][col] = ""
                max_eval = max(max_eval, eval_score)
                alpha = max(alpha, eval_score)
                if beta <= alpha:
                    break
        cache[key] = max_eval
        return max_eval
    else:
        min_eval = float("inf")
        for position in positions:
            row, col = divmod(position - 1, n)
            if board[row][col] == "":
                board[row][col] = human_player
                eval_score = minimax(board, depth + 1, True, ai_player, human_player,
                                      alpha, beta, max_depth, move_order, cache)
                board[row][col] = ""
                min_eval = min(min_eval, eval_score)
                beta = min(beta, eval_score)
                if beta <= alpha:
                    break
        cache[key] = min_eval
        return min_eval


def _heuristic(board, ai_player, human_player):
    """Rough positional score when search hits the depth cap before a terminal state."""
    n = len(board)
    lines = list(board)
    lines.extend([[board[r][c] for r in range(n)] for c in range(n)])
    lines.append([board[i][i] for i in range(n)])
    lines.append([board[i][n - 1 - i] for i in range(n)])

    score = 0
    for line in lines:
        ai_count = line.count(ai_player)
        human_count = line.count(human_player)
        if human_count == 0:
            score += ai_count
        if ai_count == 0:
            score -= human_count
    return score