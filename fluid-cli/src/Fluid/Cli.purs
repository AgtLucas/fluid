module Fluid.Cli where

import Prelude

import Control.Monad.Aff (Fiber, launchAff, liftEff')
import Control.Monad.Aff.Console (log, CONSOLE)
import Control.Monad.Eff (Eff)
import Control.Monad.Eff.Console as Eff
import Control.Monad.Eff.Exception (EXCEPTION)
import Data.Either (Either(..))
import Data.Maybe (Maybe(..))
import Fluid.Gen.Spec (parseSpec)
import Node.Encoding (Encoding(..))
import Node.FS.Aff (readTextFile, FS)
import Node.Yargs.Applicative (yarg, runY)
import Node.Yargs.Setup (example, usage)

type Args =
  { src :: String
  , dest :: String
  , name :: String
  , lang :: String
  , prefix :: String
  , side :: String
  , major :: Int
  , addon :: Array String
  }

mkArgs :: forall eff. String -> String -> String -> String -> String -> String -> Int -> Array String -> Eff (console :: Eff.CONSOLE, exception :: EXCEPTION | eff) Args
mkArgs src dest name lang prefix side major addon = pure
  { src: src
  , dest: dest
  , name: name
  , lang: lang
  , prefix: prefix
  , side: side
  , major: major
  , addon: addon
  }

getArgs :: forall eff. Eff (console :: Eff.CONSOLE, exception :: EXCEPTION | eff) Args
getArgs = do
  let setup = usage "$0 -w Word1 " -- "-w Word2"
              <> example "$0 -w Hello -w World" "Say hello!"
  runY setup $ mkArgs <$> yarg "s" ["src"] (Just "Directory of specs OR JSON containing array of specs") (Right "Required") true
                      <*> yarg "d" ["dest"] (Just "Directory to generate code") (Right "Required") true
                      <*> yarg "n" ["name"] (Just "Name of top level source file and directory") (Right "Required") true
                      <*> yarg "l" ["lang"] (Just "Language of code") (Right "Required") true
                      <*> yarg "m" ["prefix"] (Just "Prefix or module name") (Right "Required") true
                      <*> yarg "e" ["side"] (Just "\'client\' or \'server\' side code or \'both\'") (Left "client") true
                      <*> yarg "v" ["major"] (Just "Oldest supported major version") (Left 0) true
                      <*> yarg "a" ["addon"] (Just "Add-on code for client-side or server-side. May require additional dependencies.") (Left []) true

main :: forall eff. Eff (fs :: FS, console :: CONSOLE | eff) (Fiber (fs :: FS, console :: CONSOLE | eff) Unit)
main = launchAff do
    args <- liftEff' getArgs
    contents <- readTextFile UTF8 "./config.json"
    case parseSpec contents of
      Right config -> log $ show $ config.pull.protocol
      Left e -> log e
