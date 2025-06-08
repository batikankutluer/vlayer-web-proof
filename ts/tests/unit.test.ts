import { describe, it, expect, beforeEach } from 'bun:test';
import { 
  parseUrl, 
  parseNotaryUrl, 
  formatHeaders, 
  buildWebProofRequest,
  validateWebProofOptions,
  isValidUrl,
  createPerformanceMetrics
} from '../src/utils';
import type { WebProofOptions } from '../src/types';

describe('Unit Tests - Utils', () => {
  describe('parseUrl', () => {
    it('should parse valid HTTPS URL correctly', () => {
      const result = parseUrl('https://example.com:8080/path?query=1#hash');
      expect(result).toEqual({
        domain: 'example.com',
        uri: '/path?query=1#hash',
        protocol: 'https:',
        port: 8080
      });
    });

    it('should use default port for HTTPS', () => {
      const result = parseUrl('https://example.com/path');
      expect(result.port).toBe(443);
    });

    it('should use default port for HTTP', () => {
      const result = parseUrl('http://example.com/path');
      expect(result.port).toBe(80);
    });

    it('should throw error for invalid URL', () => {
      expect(() => parseUrl('invalid-url')).toThrow('Invalid URL format');
    });

    it('should throw error for empty URL', () => {
      expect(() => parseUrl('')).toThrow('URL must be a non-empty string');
    });

    it('should throw error for invalid port', () => {
      expect(() => parseUrl('https://example.com:99999/path')).toThrow('Invalid URL format');
    });
  });

  describe('parseNotaryUrl', () => {
    it('should parse notary URL correctly', () => {
      const result = parseNotaryUrl('https://notary.example.com:7047/api');
      expect(result).toEqual({
        host: 'notary.example.com',
        port: 7047,
        pathPrefix: 'api',
        enableTls: true
      });
    });

    it('should handle HTTP protocol', () => {
      const result = parseNotaryUrl('http://notary.example.com:7047');
      expect(result.enableTls).toBe(false);
      expect(result.port).toBe(7047);
    });

    it('should throw error for empty notary URL', () => {
      expect(() => parseNotaryUrl('')).toThrow('Notary URL must be a non-empty string');
    });

    it('should throw error for invalid port', () => {
      expect(() => parseNotaryUrl('https://notary.com:70000')).toThrow('Invalid notary URL format');
    });
  });

  describe('formatHeaders', () => {
    it('should filter out empty headers', () => {
      const headers = ['Content-Type: application/json', '', '  ', 'Authorization: Bearer token'];
      const result = formatHeaders(headers);
      expect(result).toEqual(['Content-Type: application/json', 'Authorization: Bearer token']);
    });

    it('should return empty array for undefined headers', () => {
      const result = formatHeaders(undefined);
      expect(result).toEqual([]);
    });

    it('should return empty array for empty array', () => {
      const result = formatHeaders([]);
      expect(result).toEqual([]);
    });
  });

  describe('buildWebProofRequest', () => {
    it('should build request with default values', () => {
      const result = buildWebProofRequest('https://example.com');
      expect(result.url).toBe('https://example.com');
      expect(result.headers).toEqual([]);
      expect(result.max_sent_data).toBe(undefined);
      expect(result.max_recv_data).toBe(undefined);
    });

    it('should use provided options', () => {
      const options: WebProofOptions = {
        method: 'POST',
        headers: ['Content-Type: application/json'],
        max_sent_data: 8192,
        max_recv_data: 32768
      };
      const result = buildWebProofRequest('https://example.com', options);
      expect(result.method).toBe('POST');
      expect(result.headers).toEqual(['Content-Type: application/json']);
      expect(result.max_sent_data).toBe(8192);
      expect(result.max_recv_data).toBe(32768);
    });
  });

  describe('validateWebProofOptions', () => {
    it('should validate correct options', () => {
      const options: WebProofOptions = {
        method: 'GET',
        max_sent_data: 4096,
        max_recv_data: 16384
      };
      expect(() => validateWebProofOptions(options)).not.toThrow();
    });

    it('should throw error for invalid max_sent_data', () => {
      const options: WebProofOptions = { max_sent_data: -1 };
      expect(() => validateWebProofOptions(options)).toThrow('max_sent_data must be a positive integer');
    });

    it('should throw error for invalid max_recv_data', () => {
      const options: WebProofOptions = { max_recv_data: 0 };
      expect(() => validateWebProofOptions(options)).toThrow('max_recv_data must be a positive integer');
    });

    it('should throw error for invalid method', () => {
      const options: WebProofOptions = { method: 'INVALID' as any };
      expect(() => validateWebProofOptions(options)).toThrow('Invalid HTTP method');
    });
  });

  describe('isValidUrl', () => {
    it('should return true for valid URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('https://api.example.com/v1/endpoint')).toBe(true);
    });

    it('should return false for invalid URLs', () => {
      expect(isValidUrl('invalid-url')).toBe(false);
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl('not a url')).toBe(false);
    });
  });

  describe('createPerformanceMetrics', () => {
    it('should calculate duration correctly', () => {
      const start = 1000;
      const end = 1500;
      const metrics = createPerformanceMetrics(start, end);
      
      expect(metrics.startTime).toBe(start);
      expect(metrics.endTime).toBe(end);
      expect(metrics.duration).toBe(500);
    });

    it('should use current time if end time not provided', () => {
      const start = performance.now();
      const metrics = createPerformanceMetrics(start);
      
      expect(metrics.startTime).toBe(start);
      expect(metrics.endTime).toBeGreaterThan(start);
      expect(metrics.duration).toBeGreaterThan(0);
    });
  });
}); 