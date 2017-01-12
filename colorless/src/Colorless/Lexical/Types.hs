module Colorless.Lexical.Types
  ( Line(..)
  , Column(..)
  , TokenVal(..)
  , Token(..)
  , reverseTokenVals
  ) where

import Pregame

newtype Line = Line Integer
  deriving (Show, Eq, Num, Enum, Real, Ord, Integral)

newtype Column = Column Integer
  deriving (Show, Eq, Num, Enum, Real, Ord, Integral)

data Loc = Loc
  { _line :: Line
  , _column :: Column
  } deriving (Show, Eq)

data TokenVal = TokenVal
  { _loc :: Loc
  , _val :: Token
  } deriving (Show, Eq)

data Token
  = TokenLowerCamelCase Text
  | TokenUpperCamelCase Text
  | TokenNumber Integer
  | TokenNest
  | TokenPeriod
  | TokenMinus
  | TokenNewline
  | TokenOpenParen
  | TokenCloseParen
  | TokenColon
  | TokenEar
  | TokenPercent
  | TokenLeftAngle
  | TokenRightAngle
  | TokenBang
  | TokenDollar
  | TokenForwardSlash
  | TokenPound
  deriving (Show, Eq)

reverseTokenVals :: [TokenVal]
reverseTokenVals =
    [ TokenVal loc (TokenLowerCamelCase "reverse")
    , TokenVal loc (TokenLowerCamelCase "str")
    , TokenVal loc TokenColon
    , TokenVal loc (TokenLowerCamelCase "str")
    ]
    where
      loc = Loc 0 0
