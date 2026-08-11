/**
 * Assets (Configuration Items) resource operations
 */

import type { HttpClient } from '../http.js';
import type { PaginatedIterable } from '../pagination.js';
import { createPaginatedIterable } from '../pagination.js';
import type {
  Asset,
  AssetType,
  AssetListParams,
  AssetListResponse,
  AssetTypeListResponse,
  AssetCreateData,
  AssetUpdateData,
} from '../types/assets.js';
import type { BaseListParams } from '../types/common.js';
import { unwrapSingle, buildListParams as sharedBuildListParams } from './utils.js';

/**
 * Assets resource operations
 */
export class AssetsResource {
  private readonly httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * List assets with optional filtering
   */
  async list(params?: AssetListParams): Promise<AssetListResponse> {
    return this.httpClient.request<AssetListResponse>('/Asset', {
      params: this.buildListParams(params),
    });
  }

  /**
   * List all assets with automatic pagination
   */
  listAll(params?: Omit<AssetListParams, 'pageSize' | 'pageNo'>): PaginatedIterable<Asset> {
    return createPaginatedIterable<Asset>(
      this.httpClient,
      '/Asset',
      'assets',
      this.buildListParams(params)
    );
  }

  /**
   * Get a single asset by ID
   */
  async get(id: number): Promise<Asset> {
    const response = await this.httpClient.request<Asset | { assets: Asset[] }>(`/Asset/${id}`);

    const asset = unwrapSingle<Asset>(response, 'assets');

    if (!asset) {

      throw new Error(`Asset ${id} not found`);

    }

    return asset;
  }

  /**
   * Create a new asset
   */
  async create(data: AssetCreateData): Promise<Asset> {
    const response = await this.httpClient.request<Asset | { assets: Asset[] }>('/Asset', {
      method: 'POST',
      body: [data],
    });
    const asset = unwrapSingle<Asset>(response, 'assets');
    if (!asset) {
      throw new Error('Failed to create asset');
    }
    return asset;
  }

  /**
   * Update an existing asset
   */
  async update(id: number, data: AssetUpdateData): Promise<Asset> {
    const response = await this.httpClient.request<Asset | { assets: Asset[] }>('/Asset', {
      method: 'POST',
      body: [{ id, ...data }],
    });
    const asset = unwrapSingle<Asset>(response, 'assets');
    if (!asset) {
      throw new Error('Failed to update asset');
    }
    return asset;
  }

  /**
   * Delete an asset
   */
  async delete(id: number): Promise<void> {
    await this.httpClient.request<void>(`/Asset/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Build query parameters from list params
   */
  private buildListParams<T extends object>(params?: T): Record<string, string | number | boolean | undefined> {
    return sharedBuildListParams(params);
  }
}

/**
 * Asset types resource operations
 */
export class AssetTypesResource {
  private readonly httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * List asset types
   */
  async list(params?: BaseListParams): Promise<AssetTypeListResponse> {
    return this.httpClient.request<AssetTypeListResponse>('/AssetType', {
      params: this.buildListParams(params),
    });
  }

  /**
   * Get a single asset type by ID
   */
  async get(id: number): Promise<AssetType> {
    const response = await this.httpClient.request<AssetType | { asset_types: AssetType[] }>(`/AssetType/${id}`);

    const assetType = unwrapSingle<AssetType>(response, 'asset_types');

    if (!assetType) {

      throw new Error(`Asset type ${id} not found`);

    }

    return assetType;
  }

  /**
   * Build query parameters from list params
   */
  private buildListParams<T extends object>(params?: T): Record<string, string | number | boolean | undefined> {
    if (!params) return {};

    const result: Record<string, string | number | boolean | undefined> = {};
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        const apiKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        result[apiKey] = value as string | number | boolean;
      }
    }
    return result;
  }
}
