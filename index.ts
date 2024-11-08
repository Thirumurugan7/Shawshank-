// In `index.ts`
import { parseTypeScript } from './src/parser';

const sourceCode = `
    let x: number = 5;
    function add(a: number, b: number): number {
        return a + b;
    }
    let result = add(3, 7);
`;

const tsAst = parseTypeScript(sourceCode);
console.log(tsAst);
