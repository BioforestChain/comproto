
// TODO: string to enum
export const getDataType = (data: unknown): string => {
    const typeStr = Object.prototype.toString.call(data);
    const matchResArray = typeStr.match(/\[object (\w+)\]/);
    if (!matchResArray) return '';
    return matchResArray[1] || '';
};

