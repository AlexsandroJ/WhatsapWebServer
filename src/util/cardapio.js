const dataTest = require('./productsTest');

let allSabores = '';

dataTest.products.forEach(Element => {
    allSabores += Element.category + ': '
    Element.item.forEach(pizza => {
        allSabores += pizza.type + ', ';
    });
});

console.log(allSabores);