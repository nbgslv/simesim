// eslint-disable-next-line import/prefer-default-export
export const getFormData = (
  data: Record<string, string | number | boolean>
): string => {
  const formData = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const encodedKey = encodeURIComponent(key);
      const encodedValue = encodeURIComponent(data[key]);
      formData.push(`${encodedKey}=${encodedValue}`);
    }
  }
  return formData.join('&');
};
