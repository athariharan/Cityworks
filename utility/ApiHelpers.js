
export function unwrap(res) {
  const body = res?.data ?? res;
  if (Array.isArray(body))             return body;
  if (Array.isArray(body?.data))       return body.data;
  if (Array.isArray(body?.data?.data)) return body.data.data;
  return [];
}
