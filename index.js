const nodePath = require('path');

function wrapFunction(path, t, wrapper, name) {
  path.replaceWith(
    t.variableDeclaration('const', [
      t.variableDeclarator(
        t.identifier(path.get('id.name').node),
        t.callExpression(t.identifier(wrapper), [
          t.stringLiteral(name),
          t.toExpression(path.node),
        ])
      )
    ])
  );
} 

module.exports = function({ types: t }) {
  return {
    pre(state) {

    },

    visitor: {
      Program(path, state) {
        const functionMarker = state.opts.functionMarker || '#';
        const sourceDir = state.opts.sourceDir || '.';

        path.traverse({
          enter(path) {
            if (!path.node.leadingComments) {
              return;
            }
            let i=-1;
            for (i=0; i<path.node.leadingComments.length; i++) {
              const commentLine = path.node.leadingComments[i];
              if (commentLine.value.startsWith(functionMarker)) {
                const parent = path.findParent((path) => 
                  path.isFunctionDeclaration()
                );
                
                if (parent == null) {
                  return;
                }

                const wrapper = commentLine.value.substring(functionMarker.length);
                const funname = parent.get('id.name').node;

                const filePath = nodePath.relative(sourceDir, state.file.opts.filename);
                const ext = nodePath.extname(filePath);

                const name = filePath.substring(0, filePath.length - ext.length) + ':' + funname;

                wrapFunction(parent, t, wrapper, name);
                path.node.leadingComments.splice(i, 1);
              }
            }
          }
        })
      },
    },

    post(state) {

    }
  };
};

