import { useEffect, useState } from "react";

type SupportedVideoProvider = "youtube" | "facebook" | "instagram";

type VideoEmbed = {
  provider: SupportedVideoProvider;
  src: string;
  title: string;
};

type HeroMediaFrameProps = {
  videoUrl?: string | null;
  mediaType?: "image" | "video" | "youtube" | "facebook" | "instagram" | "external";
  posterSrc?: string | null;
  imageSrc: string;
  imageAlt: string;
  autoplay?: boolean;
  loop?: boolean;
  className?: string;
};

function normalizeTrimmedUrl(value?: string | null) {
  return value?.trim() ?? "";
}

function parseUrl(value: string) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function getYouTubeEmbedUrl(url: URL) {
  const host = url.hostname.replace(/^www\./, "");

  if (host === "youtu.be") {
    const videoId = url.pathname.split("/").filter(Boolean)[0];

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`;
    }
  }

  if (host === "youtube.com" || host === "m.youtube.com") {
    const segments = url.pathname.split("/").filter(Boolean);

    if (url.pathname === "/watch") {
      const videoId = url.searchParams.get("v");

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`;
      }
    }

    if (segments[0] === "embed" || segments[0] === "shorts" || segments[0] === "live") {
      const videoId = segments[1];

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`;
      }
    }
  }

  return null;
}

function getInstagramEmbedUrl(url: URL) {
  const host = url.hostname.replace(/^www\./, "");

  if (!host.endsWith("instagram.com")) {
    return null;
  }

  if (url.pathname.includes("/embed")) {
    return url.toString();
  }

  const segments = url.pathname.split("/").filter(Boolean);
  const type = segments[0];
  const mediaId = segments[1];

  if (!type || !mediaId || !["p", "reel", "tv"].includes(type)) {
    return null;
  }

  return `https://www.instagram.com/${type}/${mediaId}/embed`;
}

function getFacebookEmbedUrl(url: URL) {
  const host = url.hostname.replace(/^www\./, "");

  if (!(host.endsWith("facebook.com") || host === "fb.watch")) {
    return null;
  }

  if (url.pathname.includes("/plugins/video.php")) {
    return url.toString();
  }

  return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url.toString())}&show_text=false&width=1280`;
}

function getVideoEmbed(urlValue?: string | null): VideoEmbed | null {
  const value = normalizeTrimmedUrl(urlValue);

  if (!value) {
    return null;
  }

  const url = parseUrl(value);

  if (!url) {
    return null;
  }

  const youtubeEmbed = getYouTubeEmbedUrl(url);

  if (youtubeEmbed) {
    return {
      provider: "youtube",
      src: youtubeEmbed,
      title: "VISEMFOOD YouTube video",
    };
  }

  const instagramEmbed = getInstagramEmbedUrl(url);

  if (instagramEmbed) {
    return {
      provider: "instagram",
      src: instagramEmbed,
      title: "VISEMFOOD Instagram video",
    };
  }

  const facebookEmbed = getFacebookEmbedUrl(url);

  if (facebookEmbed) {
    return {
      provider: "facebook",
      src: facebookEmbed,
      title: "VISEMFOOD Facebook video",
    };
  }

  return null;
}

export function HeroMediaFrame({
  videoUrl,
  mediaType = "image",
  posterSrc,
  imageSrc,
  imageAlt,
  autoplay = true,
  loop = true,
  className,
}: HeroMediaFrameProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  const shouldAutoplay = autoplay && !prefersReducedMotion;
  const embed = getVideoEmbed(videoUrl);
  const frameClass =
    className ?? "h-[360px] w-full overflow-hidden rounded-[calc(var(--vf-radius-lg)+0.25rem)] bg-[var(--vf-surface-strong)] sm:h-[460px] lg:h-[600px]";
  const mediaClass = className ?? "h-[360px] w-full object-cover sm:h-[460px] lg:h-[600px]";

  if (embed) {
    return (
      <div className={frameClass}>
        <iframe
          src={embed.src}
          title={embed.title}
          className="h-full w-full border-0"
          loading="eager"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }

  if (mediaType === "video" && videoUrl) {
    return (
      <video
        src={videoUrl}
        poster={posterSrc ?? imageSrc}
        className={mediaClass}
        autoPlay={shouldAutoplay}
        muted={shouldAutoplay}
        loop={loop}
        playsInline
        controls={!shouldAutoplay}
        aria-label={imageAlt}
      />
    );
  }

  return <img src={imageSrc} alt={imageAlt} className={mediaClass} />;
}
