grammar AchitectureGraph

entry Model:
    (components+=Component | greetings+=Greeting)*;

Component:
    'component' name=ID
    ( '{' (components+=Component | greetings+=Greeting)* '}' )?
;

Greeting:
    'Hello' component=[Component:QualifiedName] '!';

QualifiedName returns string:
    ID ('.' ID)*;

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
