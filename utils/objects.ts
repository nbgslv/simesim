export const getObjectsDiff = (
  obj1: Record<string, unknown>,
  obj2: Record<string, unknown>
): Record<string, unknown> => {
  const result: Record<string, any> = {};
  for (const key in obj1) {
    if (obj1[key] !== obj2[key]) {
      result[key] = obj2[key];
    }
  }
  return result;
};

export const getFormData = (
  data: Record<string, string | number | boolean>
): string => {
  const formData = [];
  for (const key in data) {
    const encodedKey = encodeURIComponent(key);
    const encodedValue = encodeURIComponent(data[key]);
    formData.push(encodedKey + '=' + encodedValue);
  }
  return formData.join('&');
};
