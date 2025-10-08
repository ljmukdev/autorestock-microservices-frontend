declare module 'csv-parser' {
  import { Transform } from 'stream';
  
  interface CsvParserOptions {
    separator?: string;
    quote?: string;
    escape?: string;
    newline?: string;
    skipLines?: number;
    headers?: string[] | boolean;
    strict?: boolean;
  }
  
  function csvParser(options?: CsvParserOptions): Transform;
  
  export = csvParser;
}

