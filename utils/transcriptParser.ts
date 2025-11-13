
export function parseTranscriptToNumber(transcript: string): number | null {
  if (!transcript) return null;

  // Replace Vietnamese decimal comma with a standard dot.
  let numericString = transcript.replace(/,/g, '.');

  // Remove all non-numeric characters except for the decimal point and a potential leading minus sign.
  // This will strip out currency symbols, thousand separators (like spaces or dots), and any other words.
  numericString = numericString.replace(/[^0-9.-]/g, '');

  // Handle cases where multiple dots might remain, e.g., from "1.000.000" becoming "1.000.000".
  // Keep only the last dot as a potential decimal separator.
  const parts = numericString.split('.');
  if (parts.length > 1) {
    numericString = parts.slice(0, -1).join('') + '.' + parts.slice(-1);
  }

  const num = parseFloat(numericString);
  
  return isNaN(num) ? null : num;
}
