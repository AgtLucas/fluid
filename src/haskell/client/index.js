var Lines = require('../../lines.js').Lines;

var {
  mkExportTypes,
  genWrap,
  genStruct,
  genEnumeration,
  genVersion,
  isFunc,
  enumeralNameTagMember,
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

const genModule = (name, lowercaseName, prefix, version, types, values) => {
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
  values.forEach(value =>
    lines.add([
        '  , ', value, '\n',
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
    'import qualified Colorless.Client.Expr as C\n',
    'import qualified Colorless.Ast as Ast\n',
  ]);
  return lines;
};

const genService = (s) => {
  var lines = new Lines();
  s.hollow.filter(isFunc).forEach(call => {
    lines.add([
      '\n',
      call.func, ' :: C.Expr ', call.output, '\n',
      call.func, ' = C.unsafeExpr (Ast.Ast\'HollowCall (Ast.HollowCall "', call.label, '"))\n',
    ]);
  });

  s.wrap.filter(isFunc).forEach(call => {
    lines.add([
      '\n',
      call.func, ' :: C.Expr ', call.name, ' -> C.Expr ', call.output, '\n',
      call.func, ' expr\'\' = C.unsafeExpr (Ast.Ast\'WrapCall (Ast.WrapCall "', call.label, '" (Ast.toAst expr\'\')))\n',
    ]);
  });

  s.struct.filter(isFunc).forEach(call => {
    lines.add([
      '\n',
      call.func, ' :: C.Expr ', call.name, ' -> C.Expr ', call.output, '\n',
      call.func, ' expr\'\' = C.unsafeExpr (Ast.Ast\'StructCall (Ast.StructCall "', call.label, '" (Ast.toAst expr\'\')))\n',
    ]);
  });

  s.enumeration.filter(isFunc).forEach(call => {
    lines.add([
      '\n',
      call.func, ' :: C.Expr ', call.name, ' -> C.Expr ', call.output, '\n',
      call.func, ' expr\'\' = C.unsafeExpr (Ast.Ast\'EnumerationCall (Ast.EnumerationCall "', call.label, '" (Ast.toAst expr\'\')))\n',
    ]);
  });

  return lines;
};

const mkExportValues = (s) => {
  var calls =
    [].concat(s.hollow).concat(s.wrap).concat(s.struct).concat(s.enumeration)
      .filter(isFunc)
      .map(x => x.lowercaseName);

  var exprMk =
    [].concat(s.struct).concat(s.wrap)
    .map(x => x.lowercaseName + '\'Mk');
  s.enumeration.forEach(({lowercaseName, enumerals}) =>
    enumerals.forEach(({tag}) =>
      exprMk.push(lowercaseName + '\'' + tag + '\'Mk')
    )
  );

  var expr =
    [].concat(s.struct).concat(s.wrap)
    .map(x => x.lowercaseName + '\'');
  expr = expr.concat(s.enumeration.map(({lowercaseName}) => lowercaseName + '\''));

  var paths = [];
  s.struct.forEach(struct =>
    struct.members.forEach(member =>
      paths.push(struct.lowercaseName + '\'' + member.name)));

  return calls.concat(exprMk).concat(expr).concat(paths);
};

const genWrapExpr = ({name, lowercaseName, type}) => {
  var lines = new Lines();

  lines.add([
    '\n',
    lowercaseName, '\'Mk :: C.Expr (', type,
  ]);
  lines.add([' -> ', name, ')\n']);

  lines.add([
    lowercaseName, '\'Mk = C.unsafeWrapExpr\n',
  ]);

  lines.add([
    '\n',
    lowercaseName, '\' :: ', name,' -> C.Expr ', name, '\n',
    lowercaseName, '\' = C.unsafeExpr P.. Ast.toAst\n',
  ]);

  return lines.collapse();
};

const genWrapToAst = ({name}) => {
 var lines = new Lines();

  lines.add([
    '\n',
    'instance Ast.ToAst ', name, ' where\n',
    '  toAst (', name, ' w) = Ast.toAst w\n',
  ]);

  return lines;
};

const genStructPath = ({name, lowercaseName, members}) => {
  var lines = new Lines();

  members.forEach(member =>
    lines.add([
      '\n',
      lowercaseName, '\'', member.name, ' :: C.Path (', name, ' -> ', member.type, ')\n',
      lowercaseName, '\'', member.name, ' = C.unsafePath ["', member.label ,'"]\n',
    ])
  );

  return lines;
};

const genStructToAst = ({name, label, members}) => {
  var lines = new Lines();

  lines.add([
    '\n',
    'instance Ast.ToAst ', name, ' where', '\n',
    '  toAst ', name, '\n',
  ]);
  lines.add(['    { ', members[0].name, '\n']);
  members.slice(1).forEach(member =>
    lines.add(['    , ', member.name, '\n'])
  );
  lines.add('    }');
  lines.add([
    ' = Ast.Ast\'Struct P.. Ast.Struct P.$ Map.fromList\n',
    '    [ ("', members[0].label, '", Ast.toAst ', members[0].name, ')\n',
  ]);
  members.slice(1).forEach(member =>
    lines.add(['    , ("', member.label, '", Ast.toAst ', member.name, ')\n'])
  );
  lines.add('    ]\n');

  return lines.collapse();
};

const genStructExpr = ({name, lowercaseName, members}) => {
  var lines = new Lines();

  lines.add([
    '\n',
    lowercaseName, '\'Mk :: C.Expr (', members[0].type,
  ]);
  members.slice(1).forEach(member =>
    lines.add([' -> ', member.type])
  );
  lines.add([' -> ', name, ')\n']);

  lines.add([
    lowercaseName, '\'Mk = C.unsafeStructExpr ["', members[0].label, '"',
  ]);
  members.slice(1).forEach(member =>
    lines.add([', "', member.label, '"'])
  );
  lines.add(']\n');

  lines.add([
    '\n',
    lowercaseName, '\' :: ', name,' -> C.Expr ', name, '\n',
    lowercaseName, '\' = C.unsafeExpr P.. Ast.toAst\n',
  ]);

  return lines.collapse();
};

const genEnumerationToAst = ({name, enumerals}) => {
  var lines = new Lines();

  lines.add([
    '\n',
    'instance Ast.ToAst ', name, ' where', '\n',
    '  toAst = \\case\n',
  ]);

  function nameTag(tag) {
    return name + '\'' + tag;
  }
  function nameTagMembers(tag) {
    return enumeralNameTagMember(name, tag);
  }

  enumerals.forEach(enumeral => {
    if (!enumeral.members) {
      lines.add([
        '    ', nameTag(enumeral.tag), ' -> Ast.Ast\'Enumeral P.$ Ast.Enumeral "', enumeral.label, '" P.Nothing\n',
      ]);
    } else {
      lines.add([
        '    ', nameTag(enumeral.tag), ' ', nameTagMembers(enumeral.tag), '\n',
      ]);
      lines.add([
        '      { ', enumeral.members[0].name, '\n'
      ]);
      enumeral.members.slice(1).forEach(member =>
        lines.add([
          '      , ', member.name, '\n'
        ])
      );
      lines.add([
        '      } -> Ast.Ast\'Enumeral P.$ Ast.Enumeral "', enumeral.label, '" P.$ P.Just P.$ Map.fromList\n',
      ]);
      lines.add([
        '      [ ("', enumeral.members[0].label, '", Ast.toAst ', enumeral.members[0].name, ')\n'
      ]);
      enumeral.members.slice(1).forEach(member =>
        lines.add([
          '      , ("', member.label, '", Ast.toAst ', member.name, ')\n'
        ])
      );
      lines.add('      ]\n');
    }
  });

  return lines.collapse();
};

const genEnumeralExpr = ({name, lowercaseName, enumerals}) => {
  var lines = new Lines();

  enumerals.forEach(enumeral => {
    if (!enumeral.members) {
      lines.add([
        '\n',
        lowercaseName, '\'', enumeral.tag,'\'Mk :: C.Expr ', name,
      ]);
      lines.add([
        '\n',
        lowercaseName, '\'', enumeral.tag,'\'Mk = C.unsafeExpr P.. Ast.toAst P.$ ', name, '\'', enumeral.tag,'\n',
      ]);
    } else {
      lines.add([
        '\n',
        lowercaseName, '\'', enumeral.tag,'\'Mk :: C.Expr (', enumeral.members[0].type,
      ]);
      enumeral.members.slice(1).forEach(member =>
        lines.add([' -> ', member.type])
      );
      lines.add([' -> ', name, ')\n']);

      lines.add([
        lowercaseName, '\'', enumeral.tag,'\'Mk = C.unsafeEnumeralExpr "', enumeral.label, '" ["', enumeral.members[0].label, '"',
      ]);
      enumeral.members.slice(1).forEach(member =>
        lines.add([', "', member.label, '"'])
      );
      lines.add(']\n');
    }

  });

  lines.add([
    '\n',
    lowercaseName, '\' :: ', name,' -> C.Expr ', name, '\n',
    lowercaseName, '\' = C.unsafeExpr P.. Ast.toAst\n',
  ]);
  return lines.collapse();
};

const gen = (specs) => {
  const spec = specs[specs.length - 1];
  const exportTypes = mkExportTypes(spec);
  const exportValues = mkExportValues(spec);

  var lines = new Lines();
  lines.add(genPragmas());
  lines.add(genModule(spec.name, spec.lowercaseName, spec.module, spec.version, exportTypes, exportValues));
  lines.add(genImports());
  lines.add(genVersion(spec.lowercaseName, spec.version.major, spec.version.minor));
  lines.add(genService(spec));
  spec.wrap.forEach(ty => {
    lines.add(genWrap(ty));
    lines.add(genWrapToAst(ty));
    lines.add(genWrapExpr(ty));
  });
  spec.struct.forEach(ty => {
    lines.add(genStruct(ty));
    lines.add(genStructPath(ty));
    lines.add(genStructToAst(ty));
    lines.add(genStructExpr(ty));
  });
  spec.enumeration.forEach(ty => {
    lines.add(genEnumeration(ty));
    lines.add(genEnumerationToAst(ty));
    lines.add(genEnumeralExpr(ty));
  });
  lines.add('\n');
  return lines.collapse();
};

module.exports = {
  gen
};
