import {
  loadConfig,
  useInternetIdentity,
} from "@caffeineai/core-infrastructure";
import { StorageClient } from "@caffeineai/object-storage";
import { HttpAgent } from "@icp-sdk/core/agent";
import { useCallback, useEffect, useRef, useState } from "react";

const SENTINEL = "!caf!";

/**
 * Uploads image files to the platform object-storage gateway and returns the
 * blob reference string that the backend stores in a listing's `images` array.
 * The reference round-trips through the same `!caf!<hash>` format the bindgen
 * `_uploadFile`/`_downloadFile` pair uses, so it can be resolved back to a
 * direct proxy URL for display.
 */
export function useImageUpload() {
  const { identity } = useInternetIdentity();
  const clientRef = useRef<StorageClient | null>(null);
  const identityRef = useRef<string | undefined>(undefined);

  const getClient = useCallback(async (): Promise<StorageClient> => {
    const principal = identity?.getPrincipal().toString();
    if (clientRef.current && identityRef.current === principal) {
      return clientRef.current;
    }
    const config = await loadConfig();
    const agent = HttpAgent.createSync({
      host: config.backend_host,
      identity,
    });
    const client = new StorageClient(
      config.bucket_name,
      config.storage_gateway_url,
      config.backend_canister_id,
      config.project_id,
      agent,
    );
    clientRef.current = client;
    identityRef.current = principal;
    return client;
  }, [identity]);

  const uploadImage = useCallback(
    async (
      file: File,
      onProgress?: (percentage: number) => void,
    ): Promise<string> => {
      const client = await getClient();
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { hash } = await client.putFile(
        bytes,
        onProgress,
        file.type,
        file.name,
      );
      return SENTINEL + hash;
    },
    [getClient],
  );

  const imageUrl = useCallback(
    async (reference: string): Promise<string> => {
      if (!reference.startsWith(SENTINEL)) return reference;
      const client = await getClient();
      const hash = reference.slice(SENTINEL.length);
      return client.getDirectURL(hash);
    },
    [getClient],
  );

  return { uploadImage, imageUrl };
}

/**
 * Resolves a listing's stored `!caf!<hash>` image references to direct display
 * URLs via the object-storage gateway. Non-storage references (e.g. `/assets/...`
 * paths) pass through unchanged. Returns an empty array until resolution
 * completes, so callers should fall back to a placeholder while loading.
 */
export function useListingImages(images: string[]): string[] {
  const { imageUrl } = useImageUpload();
  const [urls, setUrls] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    const resolve = async () => {
      const resolved = await Promise.all(
        images.map((ref) => imageUrl(ref).catch(() => ref)),
      );
      if (!cancelled) setUrls(resolved);
    };
    void resolve();
    return () => {
      cancelled = true;
    };
  }, [images, imageUrl]);

  return urls;
}
