import chess
import chess.engine
from stockfish import Stockfish
import random
import numpy
import tensorflow as tf
from tensorflow import keras
def random_board(max_depth=200):
    board = chess.Board()
    depth = random.randrange(0, max_depth)
    for _ in range(depth):
        all_moves = list(board.legal_moves)
        random_move = random.choice(all_moves)
        board.push(random_move)
        if board.is_game_over():
            break
    return board

def stockfish(board, depth):
    return Stockfish(board, depth)
  
squares_index  =  {  'a':  0,  'b':  1,  'c':  2,  'd':  3,  'e':  4,  'f':  5,  'g':  6,  'h':  7  }

def square_to_index(square):
    letter = chess.square_name(square)
    return 8 - int(letter[1]), squares_index[letter[0]]

def split_dims(board):
# this is the 3d matrix
    board3d = numpy.zeros((14, 8, 8), dtype=numpy.int8)
    for piece in chess.PIECE_TYPES:
        for square in board.pieces(piece, chess.WHITE):
            idx = numpy.unravel_index(square, (8, 8))
            board3d[piece - 1][7 - idx[0]][idx[1]] = 1
        for square in board.pieces(piece, chess.BLACK):
            idx = numpy.unravel_index(square, (8, 8))
            board3d[piece + 5][7 - idx[0]][idx[1]] = 1
        aux = board.turn
        board.turn = chess.WHITE
        for move in board.legal_moves:
            i, j = square_to_index(move.to_square)
            board3d[12][i][j] = 1
        board.turn = chess.BLACK
        for move in board.legal_moves:
            i, j = square_to_index(move.to_square)
            board3d[13][i][j] = 1
    board.turn = aux
    return board3d

def build_model(conv_size, conv_depth):
    board3d = keras.layers.Input(shape=(14, 8, 8))
    x = board3d
    for _ in range(conv_depth):
        x = keras.layers.Conv2D(filters=conv_size, kernel_size=3, padding='same', activation='relu')(x)
        x = keras.layers.Flatten()(x)
        x = keras.layers.Dense(64, 'relu')(x)
        x = keras.layers.Dense(1, 'sigmoid')(x)
        return keras.models.Model(inputs=board3d, outputs=x)
    
    