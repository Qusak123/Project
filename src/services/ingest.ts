export interface IngestConfig {
  batchSize: number;
  retryAttempts: number;
  timeout: number;
}

export interface IngestResult {
  total: number;
  success: number;
  failed: number;
  errors: string[];
  duration: number;
}

export interface DataSource {
  name: string;
  type: 'csv' | 'json' | 'database' | 'api';
  path: string;
  format: string;
}

export class DataIngestor {
  private config: IngestConfig;

  constructor(
    config: IngestConfig = {
      batchSize: 1000,
      retryAttempts: 3,
      timeout: 30000,
    }
  ) {
    this.config = config;
  }

  async ingestFromCSV(
    data: string
  ): Promise<IngestResult> {
    const startTime = Date.now();
    const lines = data
      .split('\n')
      .filter(line => line.trim());
    const headers = this.parseCSVLine(
      lines[0]
    );

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        const values =
          this.parseCSVLine(lines[i]);
        const record = this.mapToRecord(
          headers,
          values
        );

        this.validateRecord(record);
        success++;
      } catch (error) {
        failed++;
        errors.push(
          `Line ${i}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    return {
      total: lines.length - 1,
      success,
      failed,
      errors: errors.slice(0, 10),
      duration: Date.now() - startTime,
    };
  }

  async ingestFromJSON(
    data: any[]
  ): Promise<IngestResult> {
    const startTime = Date.now();
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (let i = 0; i < data.length; i++) {
      try {
        this.validateRecord(data[i]);
        success++;
      } catch (error) {
        failed++;
        errors.push(
          `Record ${i}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    return {
      total: data.length,
      success,
      failed,
      errors: errors.slice(0, 10),
      duration: Date.now() - startTime,
    };
  }

  private parseCSVLine(
    line: string
  ): string[] {
    const result: string[] = [];
    let current = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (
        char === ',' &&
        !insideQuotes
      ) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  private mapToRecord(
    headers: string[],
    values: string[]
  ): Record<string, any> {
    const record: Record<
      string,
      any
    > = {};

    headers.forEach((header, index) => {
      record[header] =
        values[index] || null;
    });

    return record;
  }

  private validateRecord(
    record: Record<string, any>
  ): void {
    if (
      !record.amount ||
      isNaN(parseFloat(record.amount))
    ) {
      throw new Error(
        'Invalid or missing amount field'
      );
    }

    if (!record.timestamp) {
      throw new Error(
        'Missing timestamp field'
      );
    }

    const date = new Date(record.timestamp);
    if (isNaN(date.getTime())) {
      throw new Error(
        'Invalid timestamp format'
      );
    }

    if (
      record.is_fraudulent !== undefined
    ) {
      if (
        ![0, 1, 'true', 'false', true, false].includes(
          record.is_fraudulent
        )
      ) {
        throw new Error(
          'Invalid is_fraudulent value'
        );
      }
    }
  }

  async ingestBatch(
    data: Record<string, any>[]
  ): Promise<IngestResult> {
    const startTime = Date.now();
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    const batches = this.createBatches(
      data,
      this.config.batchSize
    );

    for (
      let batchIdx = 0;
      batchIdx < batches.length;
      batchIdx++
    ) {
      const batch = batches[batchIdx];

      for (
        let recordIdx = 0;
        recordIdx < batch.length;
        recordIdx++
      ) {
        try {
          this.validateRecord(
            batch[recordIdx]
          );
          success++;
        } catch (error) {
          failed++;
          if (errors.length < 10) {
            errors.push(
              `Batch ${batchIdx}, Record ${recordIdx}: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
          }
        }
      }
    }

    return {
      total: data.length,
      success,
      failed,
      errors,
      duration: Date.now() - startTime,
    };
  }

  private createBatches<T>(
    data: T[],
    batchSize: number
  ): T[][] {
    const batches: T[][] = [];

    for (
      let i = 0;
      i < data.length;
      i += batchSize
    ) {
      batches.push(
        data.slice(
          i,
          i + batchSize
        )
      );
    }

    return batches;
  }

  async retryIngest(
    data: Record<string, any>[],
    attempt: number = 1
  ): Promise<IngestResult> {
    try {
      return await this.ingestBatch(data);
    } catch (error) {
      if (
        attempt <
        this.config.retryAttempts
      ) {
        await this.delay(
          1000 * Math.pow(2, attempt)
        );
        return this.retryIngest(
          data,
          attempt + 1
        );
      }
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve =>
      setTimeout(resolve, ms)
    );
  }
}
