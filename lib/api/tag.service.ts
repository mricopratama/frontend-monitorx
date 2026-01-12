import { apiClient } from './client';

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface TagWithCount extends Tag {
  website_count: number;
}

export interface CreateTagRequest {
  name: string;
  color: string;
}

export interface UpdateTagRequest {
  name?: string;
  color?: string;
}

export interface AssignTagsRequest {
  tag_ids: string[];
}

export const tagService = {
  /**
   * Create a new tag
   */
  async create(data: CreateTagRequest): Promise<Tag> {
    const response = await apiClient.post('/tags', data);
    return response.data;
  },

  /**
   * Get all tags for the current user
   */
  async getAll(): Promise<TagWithCount[]> {
    const response = await apiClient.get('/tags');
    return response.data;
  },

  /**
   * Get a specific tag by ID
   */
  async getById(id: string): Promise<Tag> {
    const response = await apiClient.get(`/tags/${id}`);
    return response.data;
  },

  /**
   * Update a tag
   */
  async update(id: string, data: UpdateTagRequest): Promise<Tag> {
    const response = await apiClient.put(`/tags/${id}`, data);
    return response.data;
  },

  /**
   * Delete a tag
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/tags/${id}`);
  },

  /**
   * Assign tags to a website
   */
  async assignToWebsite(websiteId: string, tagIds: string[]): Promise<void> {
    await apiClient.post(`/websites/${websiteId}/tags`, { tag_ids: tagIds });
  },

  /**
   * Get all tags assigned to a website
   */
  async getWebsiteTags(websiteId: string): Promise<Tag[]> {
    const response = await apiClient.get(`/websites/${websiteId}/tags`);
    return response.data;
  },
};
