// import * as ts from 'typescript';
// import { 
//     CairoNode, 
//     CairoProgram, 
//     CairoFunction, 
//     CairoType,
//     CairoParameter,
//     CairoExpression 
// } from './types/cairo';

// export class TypeScriptToCairoConverter {
//     private sourceFile: ts.SourceFile;

//     constructor(sourceCode: string) {
//         this.sourceFile = ts.createSourceFile(
//             'temp.ts',
//             sourceCode,
//             ts.ScriptTarget.Latest,
//             true
//         );
//     }

//     public convert(): string {
//         const program = this.createCairoProgram();
//         return this.generateCode(program);
//     }

//     private createCairoProgram(): CairoProgram {
//         return {
//             type: 'program',
//             body: this.convertBody(this.sourceFile)
//         };
//     }

//     private convertBody(node: ts.Node): CairoNode[] {
//         const nodes: CairoNode[] = [];
//         ts.forEachChild(node, child => {
//             const converted = this.convertNode(child);
//             if (converted) {
//                 nodes.push(converted);
//             }
//         });
//         return nodes;
//     }

//     private convertNode(node: ts.Node): CairoNode | null {
//         switch (node.kind) {
//             case ts.SyntaxKind.FunctionDeclaration:
//                 return this.convertFunction(node as ts.FunctionDeclaration);
//             default:
//                 console.warn(`Unsupported node type: ${ts.SyntaxKind[node.kind]}`);
//                 return null;
//         }
//     }

//     private convertFunction(node: ts.FunctionDeclaration): CairoFunction | null {
//         if (!node.name) {
//             throw new Error('Anonymous functions are not supported');
//         }

//         return {
//             type: 'function',
//             name: node.name.text,
//             parameters: this.convertParameters(node.parameters),
//             returnType: this.convertType(node.type),
//             body: node.body ? this.convertBody(node.body) : []
//         };
//     }

//     private convertParameters(parameters: ts.NodeArray<ts.ParameterDeclaration>): CairoParameter[] {
//         return parameters.map(param => ({
//             name: (param.name as ts.Identifier).text,
//             type: this.convertType(param.type)
//         }));
//     }

//     private convertType(typeNode: ts.TypeNode | undefined): CairoType {
//         if (!typeNode) {
//             return { name: 'felt' }; // Default type
//         }

//         switch (typeNode.kind) {
//             case ts.SyntaxKind.NumberKeyword:
//                 return { name: 'felt' };
//             case ts.SyntaxKind.StringKeyword:
//                 return { name: 'felt*' };
//             case ts.SyntaxKind.BooleanKeyword:
//                 return { name: 'bool' };
//             default:
//                 return { name: 'felt' };
//         }
//     }

//     private generateCode(node: CairoNode): string {
//         switch (node.type) {
//             case 'program':
//                 const program = node as CairoProgram;
//                 return program.body.map(n => this.generateCode(n)).join('\n\n');
            
//             case 'function':
//                 const func = node as CairoFunction;
//                 const params = func.parameters
//                     .map(p => `${p.name}: ${p.type.name}`)
//                     .join(', ');
                
//                 return `func ${func.name}(${params}) -> (${func.returnType.name}) {\n` +
//                        `    // Function body will be implemented in next step\n` +
//                        `}`;
            
//             default:
//                 return '';
//         }
//     }
// }



import * as ts from 'typescript';
import { CairoContract, CairoFunction, CairoStorage } from './types/cairo';

export class TypeScriptToCairoConverter {
    private sourceFile: ts.SourceFile;
    private contract: CairoContract;

    constructor(sourceCode: string) {
        this.sourceFile = ts.createSourceFile(
            'temp.ts',
            sourceCode,
            ts.ScriptTarget.Latest,
            true
        );
        
        this.contract = {
            name: 'Counter',
            storage: [],
            functions: [],
        };
    }

    public convert(): string {
        this.processNode(this.sourceFile);
        return this.generateCairoCode();
    }

    private processNode(node: ts.Node) {
        if (ts.isClassDeclaration(node) && node.name?.text === 'Counter') {
            this.processClass(node);
        }
        ts.forEachChild(node, child => this.processNode(child));
    }

    private processClass(node: ts.ClassDeclaration) {
        // Add storage variable
        this.contract.storage.push({
            name: 'value',
            type: 'felt'
        });

        // Process methods
        node.members.forEach(member => {
            if (ts.isMethodDeclaration(member)) {
                this.processMember(member);
            }
        });
    }

    private processMember(node: ts.MethodDeclaration) {
        if (!node.name) return;

        const methodName = node.name.getText();
        const parameters = node.parameters.map(param => ({
            name: param.name.getText(),
            type: 'felt'
        }));

        let cairoFunction: CairoFunction = {
            name: methodName,
            parameters: parameters,
            returnType: 'felt',
            visibility: 'external',
            decorators: ['@external'],
            body: []
        };

        switch (methodName) {
            case 'getValue':
                cairoFunction.visibility = 'view';
                cairoFunction.decorators = ['@view'];
                cairoFunction.body = ['return value;'];
                break;
            case 'increment':
                cairoFunction.body = [
                    'let value = value + 1;',
                    'return value;'
                ];
                break;
            case 'decrement':
                cairoFunction.body = [
                    'let value = value - 1;',
                    'return value;'
                ];
                break;
            case 'add':
                cairoFunction.body = [
                    'let value = value + amount;',
                    'return value;'
                ];
                break;
        }

        this.contract.functions.push(cairoFunction);
    }

    private generateCairoCode(): string {
        let code = [
            '#[starknet::contract]',
            'mod Counter {',
            '    use starknet::ContractAddress;',
            '',
            '    #[storage]',
            '    struct Storage {',
            `        ${this.generateStorageVariables()}`,
            '    }',
            ''
        ];

        // Add functions
        this.contract.functions.forEach(func => {
            code.push(...this.generateFunction(func));
        });

        code.push('}');

        return code.join('\n');
    }

    private generateStorageVariables(): string {
        return this.contract.storage
            .map(storage => `${storage.name}: ${storage.type}`)
            .join(',\n        ');
    }

    private generateFunction(func: CairoFunction): string[] {
        const params = func.parameters
            .map(param => `${param.name}: ${param.type}`)
            .join(', ');

        return [
            `    ${func.decorators.join('\n    ')}`,
            `    fn ${func.name}(${params}) -> ${func.returnType} {`,
            ...func.body.map(line => `        ${line}`),
            '    }',
            ''
        ];
    }
}