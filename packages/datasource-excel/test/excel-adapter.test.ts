import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ExcelDataSourceAdapter } from '../src/excel-adapter.js';
import type { SourceFileInput } from '@document-tool/datasource-sdk';

function fixture(name: string): SourceFileInput {
  const buffer = readFileSync(resolve(process.cwd(), 'fixtures', name));
  const bytes = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  return { name, extension: 'xlsx', size: buffer.byteLength, bytes };
}

describe('ExcelDataSourceAdapter', () => {
  it('discovers workbook sheets and defaults to first visible sheet', () => {
    const adapter = new ExcelDataSourceAdapter();
    const info = adapter.inspect(fixture('multiple-sheets.xlsx'));
    expect(info.sheets.map((s) => s.name)).toEqual(['Summary', 'Invoices']);
    expect(info.defaultSheetName).toBe('Summary');
  });

  it('parses basic Excel data and native numbers', async () => {
    const adapter = new ExcelDataSourceAdapter();
    const data = await adapter.getData({ sourceOptions: { file: fixture('basic.xlsx'), headerRow: 1 } });
    expect(data.records).toHaveLength(2);
    expect(data.records[0]?.Amount).toBe(5000);
    expect(data.schema.fields.find((f) => f.name === 'Amount')?.type).toBe('number');
  });

  it('supports custom header rows and skips trailing empty rows', async () => {
    const adapter = new ExcelDataSourceAdapter();
    const data = await adapter.getData({
      sourceOptions: { file: fixture('custom-header-row.xlsx'), sheetName: 'Invoices', headerRow: 3 },
    });
    expect(data.schema.fields.map((f) => f.name)).toEqual(['Invoice No', 'Customer', 'Amount']);
    expect(data.records).toHaveLength(2);
  });

  it('handles duplicate and blank headers with warnings', async () => {
    const adapter = new ExcelDataSourceAdapter();
    const data = await adapter.getData({ sourceOptions: { file: fixture('duplicate-headers.xlsx'), headerRow: 1 } });
    expect(data.schema.fields.map((f) => f.name)).toEqual(['Name', 'Name_2', 'Column_3', 'Amount']);
    expect(data.warnings?.some((w) => w.code === 'DUPLICATE_HEADER')).toBe(true);
    expect(data.warnings?.some((w) => w.code === 'BLANK_HEADER')).toBe(true);
  });

  it('rejects an empty sheet', async () => {
    const adapter = new ExcelDataSourceAdapter();
    await expect(adapter.getData({ sourceOptions: { file: fixture('empty.xlsx') } })).rejects.toThrow(/contains no data/);
  });
});
