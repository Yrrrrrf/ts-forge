// src/client/base.ts

/**
 * Custom error class for TsForge operations
 */
export class TsForgeError extends Error {
	constructor(
		message: string,
		public code: string,
		public status?: number,
		public details?: unknown,
	) {
		super(message);
		this.name = "TsForgeError";
	}
}

/**
 * Base request options extending the standard RequestInit
 */
export interface BaseRequestOptions extends RequestInit {
	params?: Record<string, string | number | boolean>;
	timeout?: number;
}

/**
 * Base client class for handling HTTP requests
 */
export class BaseClient {
	baseUrl: string;
	schemas?: string[];
	defaultHeaders?: Record<string, string>;
	timeout?: number;
	retryConfig?: {
		maxRetries: number;
		backoff: number;
	};

	constructor(baseUrl: string, options?: Partial<BaseClient>) {
		// Add protocol if not present
		if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
			baseUrl = "http://" + baseUrl;
		}
		// Ensure baseUrl ends with a slash
		if (!baseUrl.endsWith("/")) {
			baseUrl += "/";
		}
		this.baseUrl = baseUrl;
	}

	/**
	 * Builds the full URL including query parameters
	 */
	private buildUrl(
		endpoint: string,
		params?: Record<string, string | number | boolean>,
	): string {
		// Remove leading slash from endpoint if present
		const cleanEndpoint = endpoint.startsWith("/")
			? endpoint.slice(1)
			: endpoint;
		const url = new URL(cleanEndpoint, this.baseUrl);

		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				if (value !== undefined && value !== null && value !== "") {
					url.searchParams.append(key, String(value));
				}
			});
		}

		return url.toString();
	}

	/**
	 * Handles the fetch request with timeout and retries
	 */
	private async fetchWithTimeout(
		url: string,
		options: RequestInit,
		timeout: number,
	): Promise<Response> {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeout);

		try {
			const response = await fetch(url, {
				...options,
				signal: controller.signal,
			});
			return response;
		} finally {
			clearTimeout(timeoutId);
		}
	}

	/**
	 * Main request method with retry logic
	 */
	// Modified BaseClient request method with better error handling
	async request<T>(
		endpoint: string,
		options: BaseRequestOptions = {},
	): Promise<T> {
		const { params, timeout = this.timeout, ...fetchOptions } = options;
		const url = this.buildUrl(endpoint, params);
		let attempts = 0;
		const maxRetries = this.retryConfig?.maxRetries ?? 3;

		while (attempts < maxRetries) {
			try {
				const response = await this.fetchWithTimeout(
					url,
					{
						...fetchOptions,
						headers: {
							...this.defaultHeaders,
							...fetchOptions.headers,
						},
					},
					timeout ?? 30000,
				);

				// Handle 404s for optional metadata endpoints
				if (response.status === 404 && endpoint.startsWith("/dt/")) {
					// Return empty array or object based on endpoint type
					return (endpoint.endsWith("s") ? [] : {}) as T;
				}

				if (!response.ok) {
					throw new TsForgeError(
						`HTTP error: ${response.statusText}`,
						"HTTP_ERROR",
						response.status,
						await response.json().catch(() => undefined),
					);
				}

				return await response.json();
			} catch (error) {
				attempts++;
				if (attempts === maxRetries) {
					throw error instanceof TsForgeError
						? error
						: new TsForgeError(
								String(error),
								"REQUEST_FAILED",
								undefined,
								error,
							);
				}

				const backoff =
					(this.retryConfig?.backoff ?? 1000) *
					Math.pow(2, attempts - 1);
				await new Promise((resolve) => setTimeout(resolve, backoff));
			}
		}

		throw new TsForgeError("Request failed", "REQUEST_FAILED");
	}

	/**
	 * HTTP GET request
	 */
	async get<T>(
		endpoint: string,
		options: BaseRequestOptions = {},
	): Promise<T> {
		return this.request<T>(endpoint, { ...options, method: "GET" });
	}

	/**
	 * HTTP POST request
	 */
	async post<T>(
		endpoint: string,
		data?: unknown,
		options: BaseRequestOptions = {},
	): Promise<T> {
		const response = await this.request<T>(endpoint, {
			...options,
			method: "POST",
			body: data ? JSON.stringify(data) : undefined,
		});

		// Wait for a short time to ensure transaction is committed
		await new Promise((resolve) => setTimeout(resolve, 500));

		return response;
	}

	/**
	 * HTTP PUT request
	 */
	async put<T>(
		endpoint: string,
		data?: unknown,
		options: BaseRequestOptions = {},
	): Promise<T> {
		return this.request<T>(endpoint, {
			...options,
			method: "PUT",
			body: data ? JSON.stringify(data) : undefined,
		});
	}

	/**
	 * HTTP DELETE request
	 */
	async delete<T>(
		endpoint: string,
		options: BaseRequestOptions = {},
	): Promise<T> {
		return this.request<T>(endpoint, { ...options, method: "DELETE" });
	}
}
