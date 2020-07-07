module.exports = function(superClass) {
  return class extends superClass {
    profilerParseDefinition(value) {
      return this.parseLiteral(value, "Literal");
    }
  }
}