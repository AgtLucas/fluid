module Fluid.Gen.Python.ServerVersion where

import Fluid.Gen.Plan (Plan)
import Fluid.Gen.Lines (linesContent, line)

gen :: Plan -> Array String -> String
gen plan addonNames = linesContent do
  line ""
