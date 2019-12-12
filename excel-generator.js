const FileSystem = require('fs');
const ExcelJS = require('exceljs');

const Config = JSON.parse(FileSystem.readFileSync('./config.json'));
const Workbook = new ExcelJS.Workbook();
const Worksheet = Workbook.addWorksheet(Config.WorkseetName);
const TranslationKeys = getFlattenKeysFromObject(getJsonObjectFromLanguage(Config.SupportedLang[0]));
fillWorksheetWithTranslations(Worksheet, TranslationKeys);
saveWorkbook(Workbook);

function getJsonObjectFromLanguage(lang) {
    let rawdata = FileSystem.readFileSync(`${Config.Paths.TraductionFilesFolder}${lang}.json`);
    return JSON.parse(rawdata);
}

function getFlattenKeysFromObject(obj) {
    return processKeyFromObject(obj, '', []);
}

function processKeyFromObject(obj, currentKey, processedKeys) {
    if(Object(obj) !== obj){
        processedKeys.push(currentKey);
    } else {
        for (let key in obj) {
            processKeyFromObject(obj[key], currentKey ? `${currentKey}${Config.KeySeparator}${key}` : key, processedKeys);
        }
        return processedKeys;
    }
}

function getTranslationValues(keys, lang) {
    let data = getJsonObjectFromLanguage(lang);
    return keys.map((key) => {
        let keyArray = key.split(Config.KeySeparator);
        let currentData = data
        while(Object(currentData) === currentData) {
            currentData = currentData[keyArray.shift()];
        }
        return currentData === undefined ? '' : currentData;
    })
}

function fillWorksheetWithTranslations(worksheet, keys) {
    let keysValues = keys;
    keysValues.unshift(Config.KeyHeader);
    worksheet.getColumn(1).values = keysValues
    Config.SupportedLang.forEach((lang, index) => {
        let translations = getTranslationValues(keys, lang);
        translations.unshift(lang);
        worksheet.getColumn(index + 2).values = translations;
    })
}

function saveWorkbook(workbook) {
    workbook.xlsx.writeFile(`${Config.Paths.ExcelFileFolder}${Config.ExcelFilename}`);
}