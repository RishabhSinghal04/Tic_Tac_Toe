def check_winner(board, player: str) -> bool:
    """
    Check if the given player has won the game.
    
    Args:
        board (list[list[str]]): The game board represented as a 2D list.
        player (str): The symbol of the player ("X" or "O"). 
    
    Returns:
        bool: True if the player has won, False otherwise.
    """
    n = len(board)

    # check rows
    # All elements of a row are same
    for row in board:
        if all(cell == player for cell in row):
            return True

    # check columns
    # All elements of a column are same
    for col in range(n):
        if all(board[row][col] == player for row in range(n)):
            return True
        
        # board[0][0] -> board[1][0] -> board[2][0] -> ... -> board[n][0]
        # then board[1][0] -> board[1][1] -> ... -> board[n][1] and ...
        # upto board [n][n]

    # check diagonal
    if all(board[index][index] == player for index in range(n)):
        return True
    
    # check anti-diagonal
    if all(board[index][n - 1 - index] == player for index in range(n)):
        return True

    return False