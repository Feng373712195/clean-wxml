
const cssVariables = require('./cssVariables');
const getDynamicClass = require('./getDynamicClass');

// 是否为三元表达式
const ternaryExpressionReg = /(.*?)\?(.*):(.*)/;
// 是否字符串正则表达式
const isStringReg = /['|"](.*?)['|"]/;

// 处理三元表达式模版渲染Class
function getTernaryExpressionClass(dynamicClass, cssVariable) {
  let TagClass = [];

  let hasExpression = dynamicClass;
  const expressions = [];

  const getExpression = (classStr, expressions = []) => {
    let ret = '';
    classStr.replace(/(.*?)\?(.*):(.*)/, (...arg) => {
      const expressionsHeader = arg[1].split(':');
      expressions.push(`${expressionsHeader.length > 1 ? expressionsHeader[expressionsHeader.length - 1] : arg[1]}?${arg[2]}:${arg[3]}`);
      ret = `${arg[2]}:${arg[3]}`;
    });
    return ret;
  };
  while (hasExpression = getExpression(hasExpression, expressions)) {}
  expressions.reverse().forEach((expression, index) => {
    const expressionValue = expression.replace(/(.*\?)/, '').split(':');

    if (expressionValue.length > 2) {
      expression = expression.replace(new RegExp(`s?\\:s?${expressionValue[2]}`), '');
    }
    let [, , leftValue, rightValue] = ternaryExpressionReg.exec(expression);

    leftValue = leftValue.trimLeft().trimRight();
    rightValue = rightValue.trimLeft().trimRight();
    let res = null;
    res = getDynamicClass(leftValue, cssVariable);
    TagClass = TagClass.concat(res);
    if (!isStringReg.test(leftValue)) {
      cssVariables.add(leftValue);
    }
    res = getDynamicClass(rightValue, cssVariable);
    TagClass = TagClass.concat(res);
    if (!isStringReg.test(rightValue)) {
      cssVariables.add(rightValue);
    }

    if (index != expressions.length) {
      expressions.slice(index + 1, expressions.length).forEach((val, index2) => {
        expressions[index + index2 + 1] = expressions[index + index2 + 1].replace(expression, "''");
      });
    }
  });

  return TagClass;
}

module.exports = getTernaryExpressionClass;
