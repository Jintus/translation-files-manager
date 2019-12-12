const ExcelJS = require('exceljs');
const fs = require('fs');

const LANGUAGES = ['en', 'fr', 'es', 'pt', 'it'];

function getTranslationDataForLanguage(language) {
    let rawdata = fs.readFileSync('./i18n/' + language + '.json');
    return JSON.parse(rawdata);
}

function getKeysFromFile(traduction) {
    var keys = [];
    function getKey(currentObj, propertie) {
        if(Object(currentObj) !== currentObj){
            keys.push(propertie);
        } else {
            for (var p in currentObj) {
                getKey(currentObj[p], propertie ? propertie+"."+p : p);
            }
        }
    }
    getKey(traduction, '');
    return keys;
}

function getTranslationValues(lang, trKeys){
    let data = getTranslationDataForLanguage(lang);
    return trKeys.map((trKey) => {
        let splitedKeys = trKey.split('.');
        let currentData = data
        while(splitedKeys.length > 0) {
            if (currentData === undefined) {
                return '';
            }
            currentData = currentData[splitedKeys.shift()];
        }
        return currentData
    });
}

var workbook = new ExcelJS.Workbook();
var worksheet = workbook.addWorksheet('Traductions');
worksheet.getCell('A1').value = 'Keys';
let allTranslationKeys = getKeysFromFile(getTranslationDataForLanguage('en'));
allTranslationKeys.forEach((key, index) => {
    worksheet.getCell('A'+ (index + 2)).value = key;
});
LANGUAGES.forEach((lang, index) => {
    let translations = getTranslationValues(lang, allTranslationKeys);
    translations.unshift(lang)
    worksheet.getColumn(index + 2).values = translations;
})
workbook.xlsx.writeFile('test.xlsx')