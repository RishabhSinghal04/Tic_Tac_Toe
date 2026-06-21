import random

from logic.minimax import minimax
from logic.check_winner import check_winner


def ai_move_medium(board, ai_player: str, human_player: str) -> int:
    n = len(board)
    num_of_cells = n * n

    # try to win
    # check for empty cell and assign one if found
    # return that position where AI wins
    for position in range(1, num_of_cells + 1):
        row, col = divmod(position - 1, n)
        if board[row][col] == "":
            board[row][col] = ai_player
            if check_winner(board, ai_player):
                board[row][col] = ""
                return position
            board[row][col] = ""

    # block opponent
    # check for empty cell and assign one to human player if found
    # return that position where opponent will win
    for position in range(1, num_of_cells + 1):
        row, col = divmod(position - 1, n)
        if board[row][col] == "":
            board[row][col] = human_player
            if check_winner(board, human_player):
                board[row][col] = ""
                return position
            board[row][col] = ""

    # strategic fallback
    centers = _get_center_positions(n)
    for centre in centers:
        row, col = divmod(centre - 1, n)
        if board[row][col] == "":
            return centre

    # corners
    corners = [1, n, num_of_cells - n + 1, num_of_cells]
    for corner in corners:
        row, col = divmod(corner - 1, n)
        if board[row][col] == "":
            return corner

    # random move
    available = [
        position
        for position in range(1, num_of_cells + 1)
        if board[(position - 1) // n][(position - 1) % n] == ""
    ]
    return random.choice(available)


def ai_move_hard(board, ai_player: str, human_player: str) -> int:
    n = len(board)
    num_of_cells = n * n
    empty_cells = sum(row.count("") for row in board)
    move_order = _move_order(n)

    if empty_cells == num_of_cells:
        return move_order[0]  # strongest opening cell, no search needed

    max_depth = _adaptive_depth(n, empty_cells)
    cache = {}
    best_score = -float("inf")
    best_moves = []

    for position in move_order:
        row, col = divmod(position - 1, n)
        if board[row][col] == "":
            board[row][col] = ai_player
            score = minimax(
                board,
                0,
                False,
                ai_player,
                human_player,
                max_depth=max_depth,
                move_order=move_order,
                cache=cache,
            )
            board[row][col] = ""
            if score > best_score:
                best_score = score
                best_moves = [position]
            elif score == best_score:
                best_moves.append(position)

    return random.choice(best_moves)


def _move_order(n) -> list[int]:
    """Center-out move ordering so alpha-beta prunes more effectively."""
    center = (n - 1) / 2
    positions = list(range(1, n * n + 1))

    def dist(p):
        row, col = divmod(p - 1, n)
        return abs(row - center) + abs(col - center)

    return sorted(positions, key=dist)


def _adaptive_depth(n, empty_cells):
    if n == 3:
        return empty_cells  # always cheap, full search is fine
    if empty_cells > 18:
        return 3
    if empty_cells > 10:
        return 4
    return 6


def _get_center_positions(n: int) -> list[int]:
    num_of_cells = n * n
    if n % 2 == 1:
        return [(num_of_cells + 1) // 2]

    mid1, mid2 = n // 2, n // 2 + 1
    return [
        (mid1 - 1) * n + mid1,
        (mid1 - 1) * n + mid2,
        (mid2 - 1) * n + mid1,
        (mid2 - 1) * n + mid2,
    ]
