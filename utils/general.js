const checkIfAllFieldsPresent = (...params) => {
    let isAllFieldsPresent = true;
    for(let i=0;i<params.length;i++) {
        if (!params[i] || params[i] == null ||String(params[i]).trim() == "") {
            isAllFieldsPresent = false;
            break;
        }
    }
    return isAllFieldsPresent;
}


module.exports = { checkIfAllFieldsPresent }