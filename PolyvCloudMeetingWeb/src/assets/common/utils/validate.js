function minLength(value, length) {
    return value.length < length ? 1 : 0
}

function maxLength(value, length) {
    return value.length > length ? 1 : 0
}

function validChar(value) {
    return !/^[0-9a-zA-Z\_]+$/.test(value) ? 1 : 0
}

function isNonEmpty(value) {
    return value === '' ?  1 : 0
}

const validator = {
    minLength, maxLength, validChar, isNonEmpty
}

export default validator