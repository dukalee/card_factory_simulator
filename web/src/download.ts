/** 텍스트를 파일로 저장 (브라우저에는 파일 시스템이 없으므로 다운로드로 제공) */
export function download(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
