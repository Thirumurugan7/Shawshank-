// export interface Position {
//     line: number;
//     column: number;
// }

// export interface CairoNode {
//     type: string;
//     position?: Position;
// }

// export interface CairoProgram extends CairoNode {
//     type: 'program';
//     body: CairoNode[];
// }

// export interface CairoFunction extends CairoNode {
//     type: 'function';
//     name: string;
//     parameters: CairoParameter[];
//     returnType: CairoType;
//     body: CairoNode[];
// }

// export interface CairoParameter {
//     name: string;
//     type: CairoType;
// }

// export interface CairoType {
//     name: 'felt' | 'felt*' | 'uint256' | 'bool';
//     isArray?: boolean;
// }

// export interface CairoExpression extends CairoNode {
//     type: 'expression';
//     expressionType: 'binary' | 'literal' | 'identifier';
// }

// export interface CairoBinaryExpression extends CairoExpression {
//     expressionType: 'binary';
//     operator: string;
//     left: CairoExpression;
//     right: CairoExpression;
// }

// export interface CairoLiteral extends CairoExpression {
//     expressionType: 'literal';
//     value: string | number | boolean;
// }

// export interface CairoIdentifier extends CairoExpression {
//     expressionType: 'identifier';
//     name: string;
// }


export interface CairoContract {
    name: string;
    storage: CairoStorage[];
    functions: CairoFunction[];
    events?: CairoEvent[];
}

export interface CairoStorage {
    name: string;
    type: string;
}

export interface CairoFunction {
    name: string;
    parameters: CairoParameter[];
    returnType: string;
    body: string[];
    visibility: 'public' | 'private' | 'external' | 'view';
    decorators: string[];
}

export interface CairoParameter {
    name: string;
    type: string;
}

export interface CairoEvent {
    name: string;
    parameters: CairoParameter[];
}