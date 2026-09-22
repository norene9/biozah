"use client";

import Image from "next/image";
import { Component, useState, type ReactNode } from "react";
import { ImagePlaceholder } from "./image-placeholder";

/**
 * next/image throws SYNCHRONOUSLY during render when a URL's host isn't in
 * next.config's remotePatterns — that's not a network failure, so a plain
 * onError handler never sees it. Only a React error boundary can catch it.
 * A genuinely broken link (404, timeout) is a separate case: the host is fine,
 * the request just fails after mounting, and THAT is what onError catches.
 * Together these cover "any invalid image_url falls back to the placeholder"
 * regardless of which way it fails.
 */
class ImageBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidUpdate(prevProps: { children: ReactNode }) {
    if (prevProps.children !== this.props.children && this.state.failed) {
      this.setState({ failed: false });
    }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function Thumb({ src, size, radius, onLoadError }: { src: string; size: number; radius: number; onLoadError: () => void }) {
  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      unoptimized
      className="ad-thumb"
      style={{ width: size, height: size, borderRadius: radius }}
      onError={onLoadError}
    />
  );
}

export function SafeThumb({
  src,
  name,
  size = 40,
  radius = 10,
}: {
  src?: string | null;
  name: string;
  size?: number;
  radius?: number;
}) {
  const [loadFailed, setLoadFailed] = useState(false);
  const placeholder = <ImagePlaceholder name={name} size={size} radius={radius} />;

  if (!src || loadFailed) return placeholder;

  return (
    <ImageBoundary key={src} fallback={placeholder}>
      <Thumb src={src} size={size} radius={radius} onLoadError={() => setLoadFailed(true)} />
    </ImageBoundary>
  );
}
