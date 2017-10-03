var Lines = require('../../lines.js').Lines;

var {
  mkExportTypes,
  genWrap,
  genStruct,
  genEnumeration,
  genVersion,
  isFunc,
} = require('../common.js');

const genPragmas = () => {
  return new Lines([
    '-- Pragmas\n',
    '{-# OPTIONS_GHC -fno-warn-unused-imports #-}\n',
    '{-# LANGUAGE DeriveGeneric #-}\n',
    '{-# LANGUAGE DuplicateRecordFields #-}\n',
    '{-# LANGUAGE LambdaCase #-}\n',
    '{-# LANGUAGE OverloadedStrings #-}\n',
    '{-# LANGUAGE GeneralizedNewtypeDeriving #-}\n',
    '{-# LANGUAGE MultiParamTypeClasses #-}\n',
    '{-# LANGUAGE NamedFieldPuns #-}\n',
    '{-# LANGUAGE TupleSections #-}\n',
    '{-# LANGUAGE FlexibleContexts #-}\n',
    '{-# LANGUAGE FlexibleInstances #-}\n',
    '{-# LANGUAGE ScopedTypeVariables #-}\n',
    '{-# LANGUAGE NoImplicitPrelude #-}\n',
  ]);
};

const genModule = (name, lowercaseName, prefix, version, types) => {
  var lines = new Lines([
    '\n',
    '-- Module\n',
    'module ', prefix, '\n',
    '  ( ', lowercaseName, '\'Version\n',
  ]);
  types.forEach(type =>
    lines.add([
      '  , ', type, '(..)\n',
    ])
  );
  lines.add('  ) where\n');
  return lines;
};

const genImports = () => {
  var lines = new Lines([
    '\n',
    '-- Imports\n',
    'import qualified Prelude as P\n',
    'import qualified Data.Map as Map\n',
    'import qualified Control.Monad.IO.Class as IO\n',
    'import qualified Data.Aeson as A\n',
    'import qualified Data.Text as T\n',
    'import qualified Data.Text.Conversions as T\n',
    'import qualified Data.String as P (IsString)\n',
    'import qualified Data.Word as I\n',
    'import qualified Data.Int as I\n',
    'import qualified Data.IORef as IO\n',
    'import qualified GHC.Generics as P (Generic)\n',
    'import qualified Colorless.Client as C\n',
    'import qualified Colorless.Ast as Ast\n',
  ]);
  return lines;
};

const genService = (s) => {
  var lines = new Lines();
  s.hollow.filter(isFunc).forEach(call => {
    lines.add([
      '\n',
      'call\'', call.name, ' :: Expr ', call.output, '\n',
      '\n'
    ]);
  });

  s.wrap.filter(isFunc).forEach(call => {
    lines.add([
      '\n',
      'call\'', call.name, ' :: Expr ', call.name, ' -> Expr ', call.output, '\n',
      '\n'
    ]);
  });

  s.struct.filter(isFunc).forEach(call => {
    lines.add([
      '\n',
      'call\'', call.name, ' :: Expr ', call.name, ' -> Expr ', call.output, '\n',
      '\n'
    ]);
  });

  s.enumeration.filter(isFunc).forEach(call => {
    lines.add([
      '\n',
      'call\'', call.name, ' :: Expr ', call.name, ' -> Expr ', call.output, '\n',
      '\n'
    ]);
  });

  return lines;
};

const gen = (specs) => {
  const spec = specs[specs.length - 1];
  const exportTypes = mkExportTypes(spec);

  var lines = new Lines();
  lines.add(genPragmas());
  lines.add(genModule(spec.name, spec.lowercaseName, spec.module, spec.version, exportTypes));
  lines.add(genImports());
  lines.add(genVersion(spec.lowercaseName, spec.version.major, spec.version.minor));
  // lines.add(genService(spec));
  spec.wrap.forEach(ty => lines.add(genWrap(ty)));
  spec.struct.forEach(ty => lines.add(genStruct(ty)));
  spec.enumeration.forEach(ty => lines.add(genEnumeration(ty)));
  lines.add('\n');
  return lines.collapse();
};

module.exports = {
  gen
};
