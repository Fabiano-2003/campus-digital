// API configuration for connecting to backend
const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:5000/api' : '/api';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string) {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async getProfile(userId: string) {
    return this.makeRequest(`/auth/profile/${userId}`);
  }

  // Books endpoints
  async getBooks(params?: { category?: string; search?: string; institution?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.institution) searchParams.set('institution', params.institution);
    
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.makeRequest(`/books${query}`);
  }

  async getBook(id: string) {
    return this.makeRequest(`/books/${id}`);
  }

  async createBook(bookData: any, userId: string) {
    return this.makeRequest('/books', {
      method: 'POST',
      headers: { 'x-user-id': userId },
      body: JSON.stringify(bookData),
    });
  }

  // Groups endpoints
  async getGroups() {
    return this.makeRequest('/groups');
  }

  async getGroup(id: string) {
    return this.makeRequest(`/groups/${id}`);
  }

  async createGroup(groupData: any, userId: string) {
    return this.makeRequest('/groups', {
      method: 'POST',
      headers: { 'x-user-id': userId },
      body: JSON.stringify(groupData),
    });
  }

  async getGroupMessages(groupId: string) {
    return this.makeRequest(`/groups/${groupId}/messages`);
  }

  // Posts endpoints
  async getPosts() {
    return this.makeRequest('/posts');
  }

  async createPost(postData: any, userId: string) {
    return this.makeRequest('/posts', {
      method: 'POST',
      headers: { 'x-user-id': userId },
      body: JSON.stringify(postData),
    });
  }

  async likePost(postId: string, userId: string) {
    return this.makeRequest(`/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'x-user-id': userId },
    });
  }

  // Videos endpoints
  async getVideos() {
    return this.makeRequest('/videos');
  }

  async getVideo(id: string) {
    return this.makeRequest(`/videos/${id}`);
  }

  async createVideo(videoData: any, userId: string) {
    return this.makeRequest('/videos', {
      method: 'POST',
      headers: { 'x-user-id': userId },
      body: JSON.stringify(videoData),
    });
  }

  // Institutions endpoints
  async getInstitutions() {
    return this.makeRequest('/institutions');
  }

  async getInstitution(id: string) {
    return this.makeRequest(`/institutions/${id}`);
  }

  async createInstitution(institutionData: any, userId: string) {
    return this.makeRequest('/institutions', {
      method: 'POST',
      headers: { 'x-user-id': userId },
      body: JSON.stringify(institutionData),
    });
  }
}

export const apiClient = new ApiClient();