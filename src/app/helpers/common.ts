export const asyncForEach = async (array: any[], callback: any) => {
  if (!Array.isArray(array)) {
    throw new Error("Expected an array");
  }
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

export function isJSON(str: any) {
  try {
    JSON.parse(str);
    return true;
  } catch (error) {
    return false;
  }
}

export function isObject(input: any) {
  return typeof input === "object" && !Array.isArray(input);
}
