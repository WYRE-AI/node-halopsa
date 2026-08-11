/**
 * Projects resource operations
 */

import type { HttpClient } from '../http.js';
import type { PaginatedIterable } from '../pagination.js';
import { createPaginatedIterable } from '../pagination.js';
import type {
  Project,
  ProjectListParams,
  ProjectListResponse,
  ProjectTaskListParams,
  ProjectTaskListResponse,
  ProjectCreateData,
  ProjectUpdateData,
} from '../types/projects.js';
import { unwrapSingle, buildListParams as sharedBuildListParams } from './utils.js';

/**
 * Projects resource operations
 */
export class ProjectsResource {
  private readonly httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * List projects with optional filtering
   */
  async list(params?: ProjectListParams): Promise<ProjectListResponse> {
    return this.httpClient.request<ProjectListResponse>('/Projects', {
      params: this.buildListParams(params),
    });
  }

  /**
   * List all projects with automatic pagination
   */
  listAll(params?: Omit<ProjectListParams, 'pageSize' | 'pageNo'>): PaginatedIterable<Project> {
    return createPaginatedIterable<Project>(
      this.httpClient,
      '/Projects',
      'projects',
      this.buildListParams(params)
    );
  }

  /**
   * Get a single project by ID
   */
  async get(id: number): Promise<Project> {
    const response = await this.httpClient.request<Project | { projects: Project[] }>(`/Projects/${id}`);

    const project = unwrapSingle<Project>(response, 'projects');

    if (!project) {

      throw new Error(`Project ${id} not found`);

    }

    return project;
  }

  /**
   * Create a new project
   */
  async create(data: ProjectCreateData): Promise<Project> {
    const response = await this.httpClient.request<Project | { projects: Project[] }>('/Projects', {
      method: 'POST',
      body: [data],
    });
    const project = unwrapSingle<Project>(response, 'projects');
    if (!project) {
      throw new Error('Failed to create project');
    }
    return project;
  }

  /**
   * Update an existing project
   */
  async update(id: number, data: ProjectUpdateData): Promise<Project> {
    const response = await this.httpClient.request<Project | { projects: Project[] }>('/Projects', {
      method: 'POST',
      body: [{ id, ...data }],
    });
    const project = unwrapSingle<Project>(response, 'projects');
    if (!project) {
      throw new Error('Failed to update project');
    }
    return project;
  }

  /**
   * Delete a project
   */
  async delete(id: number): Promise<void> {
    await this.httpClient.request<void>(`/Projects/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get tasks for a project
   */
  async tasks(id: number, params?: ProjectTaskListParams): Promise<ProjectTaskListResponse> {
    return this.httpClient.request<ProjectTaskListResponse>(`/Projects/${id}/Tasks`, {
      params: this.buildListParams(params),
    });
  }

  /**
   * Build query parameters from list params
   */
  private buildListParams<T extends object>(params?: T): Record<string, string | number | boolean | undefined> {
    return sharedBuildListParams(params);
  }
}
