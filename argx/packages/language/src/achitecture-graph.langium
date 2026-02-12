grammar Architecturegraphs

entry Model: (attributes+=Attribute | types+=AType | nodes+=ANode | edges+=AEdge)*;

AType:
  'type' name=ID (':' supers+=[AType:QualifiedName] )?
  ( '{' (attributes+=Attribute )* '}' | ';' );

ANode:
  kind=[AType:QualifiedName] name=ID
  ( '{' (attributes+=Attribute | nodes+=ANode | edges+=AEdge)* '}' | ';' );

AEdge:
  source=[ANode:QualifiedName] '->' target=[ANode:QualifiedName]
  (':' kind=[AType:QualifiedName])?
  ';'?;

QualifiedName returns string: ID ('.' ID)*;

Attribute: name=ID '=' value=(STRING | NUMBER | BOOLEAN) ';'?;

terminal STRING: /"[^"]*"|'[^']*'/;
terminal NUMBER: /-?[0-9]+(\.[0-9]+)?/;
terminal BOOLEAN: /true|false/;
terminal ID: /[_a-zA-Z][\w_]*/;

hidden terminal WS: /[ \t\r\n]+/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
