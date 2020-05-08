import fs from 'fs';
import ts from 'typescript';

export const loadEnvTypeDeclaration = (path, encoding, silent) => {
    try {
        const data = fs.readFileSync(path, encoding);
        const source = ts.createSourceFile(path, data, ts.ScriptTarget.ES2015, true);
        const schema = {};
        source.getChildren().find(c => c.kind === ts.SyntaxKind.SyntaxList).getChildren()
            .find(c => c.kind === ts.SyntaxKind.ModuleDeclaration && c.name.text === 'dotenv-extended').body.getChildren()
            .find(c => c.kind === ts.SyntaxKind.SyntaxList).getChildren()
            .find(c => c.kind === ts.SyntaxKind.InterfaceDeclaration && c.name.escapedText === 'IEnvironmentMap').getChildren()
            .find(c => c.kind === ts.SyntaxKind.SyntaxList).getChildren()
            // Only accepts members of type "string"
            .filter(c => c.type.kind === ts.SyntaxKind.StringKeyword)
            .forEach(c => schema[c.name.escapedText] = '');
        return schema;
    } catch (err) {
        if (!silent) {
            console.error(err.message);
        }
        return {};
    }
};
export default loadEnvTypeDeclaration;
