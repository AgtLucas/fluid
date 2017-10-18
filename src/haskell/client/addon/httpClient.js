var Lines = require('../../../lines.js').Lines;

const importing = (s) => [
  'import qualified Fluid.Client.HttpClient as HttpClient',
];

const exporting = (s) => [
    s.lowercaseName + '\'HttpClient\'Post',
];

const gen = (s) => {
  return new Lines([
    '\n',
    s.lowercaseName, '\'HttpClient\'Post\n',
    '  :: (C.HasType a, Ast.ToAst a, C.FromVal a)\n',
    '  => HttpClient.Manager\n',
    '  -> C.Pull\n',
    '  -> HttpClient.RequestHeaders\n',
    '  -> C.Request ', s.meta,' a\n',
    '  -> P.IO (HttpClient.HttpClientResponse R.ByteString, P.Maybe (C.Response ', s.error,' a))\n',
    s.lowercaseName, '\'HttpClient\'Post = HttpClient.sendRequest\n',
  ]);
};

module.exports = {
  importing,
  exporting,
  gen,
};