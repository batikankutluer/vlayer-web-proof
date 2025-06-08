import { describe, it, expect, beforeAll } from 'bun:test';
import { webProof, simpleWebProof } from '../src/web-proof';
import { isNativeBindingLoaded, getNativeBindingInfo } from '../src/native-wrapper';
import type { WebProofOptions } from '../src/types';

describe('Integration Tests - Error Handling & Validation', () => {
  beforeAll(() => {
    console.log('Native binding info:', getNativeBindingInfo());
  });

  describe('webProof function', () => {
    it('should handle invalid URL gracefully', async () => {
      const result = await webProof('invalid-url');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid URL format');
      expect(result.metrics).toBeDefined();
      expect(result.metrics!.duration).toBeGreaterThan(0);
    });

    it('should handle valid URL with invalid options', async () => {
      const options: WebProofOptions = {
        max_sent_data: -1
      };
      
      const result = await webProof('https://httpbin.org/get', options);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('max_sent_data must be a positive integer');
      expect(result.metrics).toBeDefined();
    });

    it('should include performance metrics', async () => {
      const result = await webProof('invalid-url-test');
      
      expect(result.metrics).toBeDefined();
      expect(result.metrics!.startTime).toBeGreaterThan(0);
      expect(result.metrics!.endTime).toBeGreaterThan(result.metrics!.startTime);
      expect(result.metrics!.duration).toBeGreaterThan(0);
    });

    it('should validate options properly', async () => {
      const invalidOptions = [
        { max_sent_data: -1 },
        { max_recv_data: 0 },
        { method: 'INVALID' as any }
      ];
      
      for (const options of invalidOptions) {
        const result = await webProof('https://example.com', options);
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.metrics).toBeDefined();
      }
    });
  });

  describe('simpleWebProof function', () => {
    it('should validate parameters', async () => {
      const invalidCases = [
        { host: '', port: 7047, url: 'https://httpbin.org/get', expectedError: 'Notary host' },
        { host: '127.0.0.1', port: -1, url: 'https://httpbin.org/get', expectedError: 'port number' },
        { host: '127.0.0.1', port: 65536, url: 'https://httpbin.org/get', expectedError: 'port number' },
        { host: '127.0.0.1', port: 7047, url: 'invalid-url', expectedError: 'URL format' }
      ];

      for (const testCase of invalidCases) {
        try {
          await simpleWebProof(testCase.host, testCase.port, testCase.url);
          expect(true).toBe(false); // Should not reach here
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toContain(testCase.expectedError);
        }
      }
    });
  });

  describe('Native Binding', () => {
    it('should provide binding information', () => {
      const info = getNativeBindingInfo();
      
      expect(typeof info.loaded).toBe('boolean');
      expect(typeof info.attempts).toBe('number');
      expect(info.attempts).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(info.supportedPlatforms)).toBe(true);
      expect(info.supportedPlatforms.length).toBeGreaterThan(0);
      expect(info.supportedPlatforms).toContain('linux-x64');
    });

    it('should check binding status', () => {
      const loaded = isNativeBindingLoaded();
      expect(typeof loaded).toBe('boolean');
    });
  });

  describe('Error Messages', () => {
    it('should provide user-friendly error messages for invalid URLs', async () => {
      const invalidUrls = [
        'not-a-url',
        'ftp://invalid.com',
        '',
        'javascript:alert(1)'
      ];
      
      for (const url of invalidUrls) {
        const result = await webProof(url);
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.metrics).toBeDefined();
      }
    });

    it('should handle edge cases gracefully', async () => {
      // Test with invalid URL to avoid network requests
      const edgeCases = [
        { url: 'invalid-url-1', options: { headers: ['', '  ', 'valid: header'] } },
        { url: 'invalid-url-2', options: { method: 'GET', data: undefined } },
        { url: 'invalid-url-3', options: { max_sent_data: undefined, max_recv_data: undefined } }
      ];
      
      for (const testCase of edgeCases) {
        const result = await webProof(testCase.url, testCase.options);
        expect(result.metrics).toBeDefined();
        expect(typeof result.success).toBe('boolean');
        expect(result.success).toBe(false); // Should fail due to invalid URL
      }
    });
  });
}); 