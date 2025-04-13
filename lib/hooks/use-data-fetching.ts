import useSWR, { SWRConfiguration, SWRResponse } from "swr"
import { useState } from "react"
import { logError, ErrorCategory, ErrorSeverity } from "../logging/error-logger"

interface FetcherOptions {
  method?: string
  headers?: Record<string, string>
  body?: any
}

// Enhanced fetcher with error handling and logging
const fetcher = async <T>(url: string, options?: FetcherOptions): Promise<T> => {
  try {
    const fetchOptions: RequestInit = {
      method: options?.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...(options?.body ? { body: JSON.stringify(options.body) } : {}),
    }

    const response = await fetch(url, fetchOptions)

    // Handle non-2xx responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error || `HTTP error ${response.status}`

      // Log the error
      await logError({
        category: ErrorCategory.API_ERROR,
        severity: ErrorSeverity.ERROR,
        message: `API request failed: ${errorMessage}`,
        details: {
          url,
          status: response.status,
          statusText: response.statusText,
          errorData,
        },
        method: options?.method || "GET",
        statusCode: response.status,
      })

      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error: any) {
    // Log fetch errors
    await logError({
      category: ErrorCategory.API_ERROR,
      severity: ErrorSeverity.ERROR,
      message: `Fetch error: ${error instanceof Error ? error.message : "Unknown error"}`,
      details: { url, options },
      stack: error instanceof Error ? error.stack : undefined,
    })

    throw error
  }
}

interface UseDataFetchingResult<T> extends Omit<SWRResponse<T, Error>, "mutate"> {
  isLoading: boolean
  isError: boolean
  mutate: (data?: T, shouldRevalidate?: boolean) => Promise<T | undefined>
  refresh: () => Promise<T | undefined>
}

export function useDataFetching<T = any>(
  url: string | null,
  options?: FetcherOptions,
  swrOptions?: SWRConfiguration
): UseDataFetchingResult<T> {
  const [isLoading, setIsLoading] = useState(true)

  const {
    data,
    error,
    isValidating,
    mutate,
    isLoading: swrIsLoading,
    ...rest
  } = useSWR<T>(
    url,
    url ? (url: string) => fetcher<T>(url, options) : null,
    {
      onSuccess: () => setIsLoading(false),
      onError: () => setIsLoading(false),
      revalidateOnFocus: false, // Disable revalidation on window focus by default
      ...swrOptions,
    }
  )

  // Custom mutate function that can update the cache and optionally revalidate
  const customMutate = async (newData?: T, shouldRevalidate = true) => {
    return await mutate(newData, shouldRevalidate)
  }

  // Function to force refresh the data
  const refresh = async () => {
    setIsLoading(true)
    return await mutate()
  }

  return {
    data,
    error,
    isValidating,
    isLoading: isLoading && !error && !data,
    isError: !!error,
    mutate: customMutate,
    refresh,
    ...rest,
  }
}
