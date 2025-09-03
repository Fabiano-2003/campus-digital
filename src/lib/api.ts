// API configuration for connecting to backend
const getApiBaseUrl = () => {
  if (import.meta.env.DEV) {
    // In development, try to connect to the backend server
    const currentPort = window.location.port;
    if (currentPort === '8080' || currentPort === '8081' || currentPort === '8082' || currentPort === '8083') {
      // Frontend is running, backend should be on 3001
      return 'http://0.0.0.0:3001/api';
    }
    return 'http://0.0.0.0:3001/api';
  }
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

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

  // Friends endpoints
  async sendFriendRequest(targetUserId: string, userId: string) {
    return this.makeRequest('/friends/request', {
      method: 'POST',
      headers: { 'x-user-id': userId },
      body: JSON.stringify({ targetUserId }),
    });
  }

  async acceptFriendRequest(friendshipId: string, userId: string) {
    return this.makeRequest(`/friends/accept/${friendshipId}`, {
      method: 'POST',
      headers: { 'x-user-id': userId },
    });
  }

  async rejectFriendRequest(friendshipId: string, userId: string) {
    return this.makeRequest(`/friends/reject/${friendshipId}`, {
      method: 'POST',
      headers: { 'x-user-id': userId },
    });
  }

  async getFriendRequests(userId: string) {
    return this.makeRequest('/friends/requests', {
      headers: { 'x-user-id': userId },
    });
  }

  async getFriends(userId: string, search?: string) {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.makeRequest(`/friends${params}`, {
      headers: { 'x-user-id': userId },
    });
  }

  async searchUsers(query: string, userId: string) {
    return this.makeRequest(`/friends/search?q=${encodeURIComponent(query)}`, {
      headers: { 'x-user-id': userId },
    });
  }

  // Conversations endpoints
  async createConversation(participantId: string, userId: string) {
    return this.makeRequest('/conversations/create', {
      method: 'POST',
      headers: { 'x-user-id': userId },
      body: JSON.stringify({ participantId }),
    });
  }

  async getConversations(userId: string) {
    return this.makeRequest('/conversations', {
      headers: { 'x-user-id': userId },
    });
  }

  async getConversationMessages(conversationId: string, userId: string, limit?: number, offset?: number) {
    const params = new URLSearchParams();
    if (limit) params.set('limit', limit.toString());
    if (offset) params.set('offset', offset.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.makeRequest(`/conversations/${conversationId}/messages${query}`, {
      headers: { 'x-user-id': userId },
    });
  }

  async sendMessage(conversationId: string, content: string, userId: string, messageType = 'text') {
    return this.makeRequest(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'x-user-id': userId },
      body: JSON.stringify({ content, message_type: messageType }),
    });
  }
}

export const apiClient = new ApiClient();