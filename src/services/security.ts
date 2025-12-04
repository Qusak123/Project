export interface EncryptedData {
  encrypted: string;
  iv: string;
  authTag: string;
}

export interface RBACPolicy {
  role: 'admin' | 'analyst' | 'viewer';
  permissions: string[];
}

export class EncryptionService {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly ENCODING = 'hex';

  static async encrypt(
    plaintext: string,
    keyString: string
  ): Promise<EncryptedData> {
    const key = await this.stringToKey(
      keyString
    );
    const iv = this.generateIV();
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);

    const cipher = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      data
    );

    const encryptedArray = new Uint8Array(
      cipher
    );
    const authTag = encryptedArray.slice(-16);
    const encrypted = encryptedArray.slice(
      0,
      -16
    );

    return {
      encrypted: this.toHex(encrypted),
      iv: this.toHex(iv),
      authTag: this.toHex(authTag),
    };
  }

  static async decrypt(
    encryptedData: EncryptedData,
    keyString: string
  ): Promise<string> {
    const key = await this.stringToKey(
      keyString
    );
    const iv = this.fromHex(
      encryptedData.iv
    );
    const encrypted = this.fromHex(
      encryptedData.encrypted
    );
    const authTag = this.fromHex(
      encryptedData.authTag
    );

    const combined = new Uint8Array(
      encrypted.length + authTag.length
    );
    combined.set(encrypted);
    combined.set(authTag, encrypted.length);

    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      combined
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  private static async stringToKey(
    keyString: string
  ): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const data = encoder.encode(keyString);
    const hash = await crypto.subtle.digest(
      'SHA-256',
      data
    );

    return crypto.subtle.importKey(
      'raw',
      hash,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }

  private static generateIV(): Uint8Array {
    return crypto.getRandomValues(
      new Uint8Array(12)
    );
  }

  private static toHex(
    array: Uint8Array
  ): string {
    return Array.from(array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private static fromHex(
    hex: string
  ): Uint8Array {
    const array = new Uint8Array(
      hex.length / 2
    );
    for (let i = 0; i < hex.length; i += 2) {
      array[i / 2] = parseInt(
        hex.substring(i, i + 2),
        16
      );
    }
    return array;
  }

  static async hashPassword(
    password: string
  ): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest(
      'SHA-256',
      data
    );

    return this.toHex(new Uint8Array(hash));
  }

  static async verifyPassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    const newHash =
      await this.hashPassword(password);
    return newHash === hash;
  }

  static generateKey(): string {
    const array = crypto.getRandomValues(
      new Uint8Array(32)
    );
    return this.toHex(array);
  }

  static async hashSensitiveData(
    data: string
  ): Promise<string> {
    const encoder = new TextEncoder();
    const encoded = encoder.encode(data);
    const hash = await crypto.subtle.digest(
      'SHA-256',
      encoded
    );

    return this.toHex(new Uint8Array(hash));
  }
}

export class RBACEngine {
  private policies: Map<string, RBACPolicy> =
    new Map();

  constructor() {
    this.initializeDefaultPolicies();
  }

  private initializeDefaultPolicies(): void {
    this.policies.set('admin', {
      role: 'admin',
      permissions: [
        'manage_users',
        'manage_models',
        'view_all_transactions',
        'manage_thresholds',
        'view_compliance_logs',
        'configure_system',
        'manage_datasets',
      ],
    });

    this.policies.set('analyst', {
      role: 'analyst',
      permissions: [
        'view_transactions',
        'analyze_patterns',
        'view_reports',
        'manage_thresholds',
        'export_data',
      ],
    });

    this.policies.set('viewer', {
      role: 'viewer',
      permissions: [
        'view_own_transactions',
        'view_own_reports',
      ],
    });
  }

  hasPermission(
    role: string,
    permission: string
  ): boolean {
    const policy = this.policies.get(role);
    return policy?.permissions.includes(
      permission
    ) || false;
  }

  getPermissions(role: string): string[] {
    return this.policies.get(role)?.permissions || [];
  }

  canAccess(
    userRole: string,
    userId: string,
    resourceId: string,
    resourceType: string
  ): boolean {
    const permissions =
      this.getPermissions(userRole);

    switch (resourceType) {
      case 'transaction':
        if (userRole === 'admin') return true;
        if (userRole === 'analyst')
          return permissions.includes(
            'view_transactions'
          );
        return (
          permissions.includes(
            'view_own_transactions'
          ) && userId === resourceId
        );

      case 'report':
        if (userRole === 'admin') return true;
        if (userRole === 'analyst')
          return permissions.includes(
            'view_reports'
          );
        return (
          permissions.includes(
            'view_own_reports'
          ) && userId === resourceId
        );

      case 'model':
        return permissions.includes(
          'manage_models'
        );

      case 'threshold':
        return permissions.includes(
          'manage_thresholds'
        );

      default:
        return false;
    }
  }

  addCustomPolicy(
    role: string,
    permissions: string[]
  ): void {
    this.policies.set(role, {
      role: role as any,
      permissions,
    });
  }
}

export class AuditLogger {
  async logAction(
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    details: Record<string, any>,
    status: 'success' | 'failure' = 'success'
  ): Promise<void> {
    const logEntry = {
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details,
      timestamp: new Date().toISOString(),
      status,
    };

    console.log('Audit Log:', logEntry);
  }

  async getAuditLog(
    filters: {
      userId?: string;
      action?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<any[]> {
    return [];
  }
}
